"""Base classes for all agent types."""

from abc import ABC
from enum import Enum
from pydantic import BaseModel, Field
from typing import Any, Dict
import time
import logging
import json

from app.core.config import settings
from app.utils.agent_logger import setup_agent_logger


logger = logging.getLogger(__name__)


class AgentStatus(str, Enum):
    """Agent execution status."""

    PENDING = "pending"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentState(BaseModel):
    """Persistent agent state for tracking execution."""

    agent_id: str
    status: AgentStatus = AgentStatus.PENDING
    iteration: int = 0
    tokens_used: int = 0
    tool_calls_made: int = 0
    start_time: float = Field(default_factory=time.time)
    last_update: float = Field(default_factory=time.time)
    context: Dict[str, Any] = Field(default_factory=dict)
    result: Dict[str, Any] | None = None
    error: str | None = None
    messages: list[Dict[str, str]] = Field(default_factory=list)


class BaseAgent(ABC):
    """Base class for all agent types."""

    def __init__(
        self,
        agent_id: str,
        system_prompt: str,
        initial_user_message: str,
        tools,
        llm_client,
        max_iterations: int = 50,
        max_tokens: int = 200_000,
        max_tool_calls: int = 100,
        max_duration_seconds: int = 300,
    ):
        """Initialize agent.

        Args:
            agent_id: Unique agent ID
            system_prompt: System prompt for the agent
            initial_user_message: Initial user message with task context
            tools: ToolManager instance
            llm_client: OpenAI client for LLM calls
            max_iterations: Maximum iterations allowed
            max_tokens: Maximum tokens allowed
            max_tool_calls: Maximum tool calls allowed
            max_duration_seconds: Maximum duration in seconds
        """
        self.agent_id = agent_id
        self.system_prompt = system_prompt
        self.initial_user_message = initial_user_message
        self.tools = tools
        self.llm = llm_client
        self.max_iterations = max_iterations
        self.max_tokens = max_tokens
        self.max_tool_calls = max_tool_calls
        self.max_duration_seconds = max_duration_seconds

        # Initialize state
        self.state = AgentState(agent_id=agent_id)
        self.state.messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": initial_user_message},
        ]

        # Setup file logging
        self.agent_logger = setup_agent_logger(agent_id)

    async def run(self) -> bool:
        """Execute one iteration.

        Returns:
            True if should continue, False if task is complete
        """
        self.state.iteration += 1
        self.state.last_update = time.time()
        self.state.status = AgentStatus.EXECUTING

        self.agent_logger.debug(f"Agent {self.agent_id} - Iteration {self.state.iteration}")

        try:
            # Call LLM with function calling
            response = self.llm.chat.completions.create(
                model=settings.MODEL_NAME,
                messages=self.state.messages,
                tools=self.tools.get_all_schemas(),
                temperature=1.0,
            )

            message = response.choices[0].message

            # Count actual tokens from OpenAI response
            if hasattr(response, 'usage') and response.usage:
                tokens_this_call = response.usage.total_tokens
                self.state.tokens_used += tokens_this_call
                self.agent_logger.debug(
                    f"Tokens: {tokens_this_call} - this call, {self.state.tokens_used} total"
                )

            # Extract content and tool calls
            content = message.content or ""
            tool_calls_data = self._extract_tool_calls(response)

            # Log content
            if content:
                self.agent_logger.debug(f"Agent Response Content: {content[:200]}")

            # Execute tools if any
            if tool_calls_data:
                self.agent_logger.debug(f"Agent made {len(tool_calls_data)} Tool Calls: {[tc['name'] for tc in tool_calls_data]}")
                results = await self.tools.execute_batch(tool_calls_data)
                self.state.tool_calls_made += len(tool_calls_data)
                self._log_tool_execution_details(tool_calls_data, results)

                # Check for completion signal
                if self._is_complete(results):
                    self.state.status = AgentStatus.COMPLETED
                    self.state.result = self._extract_final_result(results)
                    self.agent_logger.debug(f"Agent {self.agent_id} completed task")
                    return False  # Stop

                # Add tool results to messages
                self._add_tool_results_to_messages(tool_calls_data, results)

            else:
                # No tool calls
                self.agent_logger.debug(f"Agent {self.agent_id} made no tool calls")
                # Add assistant message to continue conversation
                if content:
                    self.state.messages.append({"role": "assistant", "content": content})

            return True

        except Exception as e:
            logger.error(f"Agent {self.agent_id} iteration failed: {e}", exc_info=True)
            self.state.status = AgentStatus.FAILED
            self.state.error = str(e)
            return False

    def should_stop(self) -> bool:
        """Check if agent should stop based on limits.

        Returns:
            True if should stop, False if should continue
        """
        # Already completed or failed
        if self.state.status in (AgentStatus.COMPLETED, AgentStatus.FAILED):
            return True

        # Max iterations
        if self.state.iteration >= self.max_iterations:
            logger.warning(f"Agent {self.agent_id} reached max iterations: {self.state.iteration}")
            self.state.status = AgentStatus.COMPLETED
            self.state.result = {"reason": "max_iterations_reached"}
            return True

        # Max tokens
        if self.state.tokens_used >= self.max_tokens:
            logger.warning(f"Agent {self.agent_id} reached max tokens: {self.state.tokens_used}")
            self.state.status = AgentStatus.COMPLETED
            self.state.result = {"reason": "max_tokens_reached"}
            return True

        # Max tool calls
        if self.state.tool_calls_made >= self.max_tool_calls:
            logger.warning(f"Agent {self.agent_id} reached max tool calls: {self.state.tool_calls_made}")
            self.state.status = AgentStatus.COMPLETED
            self.state.result = {"reason": "max_tool_calls_reached"}
            return True

        # Max duration
        elapsed = time.time() - self.state.start_time
        if elapsed >= self.max_duration_seconds:
            logger.warning(f"Agent {self.agent_id} reached max duration: {elapsed:.2f}s")
            self.state.status = AgentStatus.COMPLETED
            self.state.result = {"reason": "max_duration_reached"}
            return True

        return False

    def _extract_tool_calls(self, llm_response) -> list[Dict[str, Any]]:
        """Extract tool calls from LLM response."""
        message = llm_response.choices[0].message
        if not message.tool_calls:
            return []

        tool_calls = []
        for tc in message.tool_calls:
            tool_calls.append({
                "id": tc.id,
                "name": tc.function.name,
                "arguments": json.loads(tc.function.arguments),
            })
        return tool_calls

    def _is_complete(self, tool_results: dict) -> bool:
        """Check if any tool result signals completion.

        Args:
            tool_results: Dict of tool call ID -> ToolResult

        Returns:
            True if completion tool was called
        """
        for result in tool_results.values():
            if result.success and result.data:
                # Check for completion signals
                if isinstance(result.data, dict) and result.data.get("completed"):
                    return True
        return False

    def _extract_final_result(self, tool_results: dict) -> Dict[str, Any]:
        """Extract final result from completion tool.

        Args:
            tool_results: Dict of tool call ID -> ToolResult

        Returns:
            Final result data
        """
        for result in tool_results.values():
            if result.success and result.data:
                if isinstance(result.data, dict) and result.data.get("completed"):
                    return result.data
        return {}

    def _add_tool_results_to_messages(self, tool_calls: list, results: dict) -> None:
        """Add tool calls and results to message history.

        Args:
            tool_calls: List of tool call dicts
            results: Dict of tool call ID -> ToolResult
        """
        # Add assistant message with tool calls
        self.state.messages.append({
            "role": "assistant",
            "content": None,
            "tool_calls": [
                {
                    "id": tc["id"],
                    "type": "function",
                    "function": {
                        "name": tc["name"],
                        "arguments": json.dumps(tc["arguments"])
                    }
                }
                for tc in tool_calls
            ]
        })

        # Add tool results
        for tc in tool_calls:
            result = results.get(tc["id"])
            content = json.dumps(result.model_dump() if result else {"error": "No result"})

            self.state.messages.append({
                "role": "tool",
                "tool_call_id": tc["id"],
                "content": content,
            })

    def _log_tool_execution_details(self, tool_calls: list, results: dict) -> None:
        """Log detailed per-tool execution diagnostics for debugging."""
        for tc in tool_calls:
            result = results.get(tc["id"])
            if not result:
                self.agent_logger.error(
                    f"Tool result missing for call_id={tc['id']} tool={tc['name']}"
                )
                continue

            metadata = result.metadata or {}
            tool_args = metadata.get("tool_args", tc.get("arguments", {}))
            status = "SUCCESS" if result.success else "FAILED"

            if result.success:
                self.agent_logger.debug(
                    f"Tool {status}: {tc['name']} args={json.dumps(tool_args, default=str)[:1200]} "
                    f"metadata={json.dumps(metadata, default=str)[:1200]}"
                )
            else:
                self.agent_logger.error(
                    f"Tool {status}: {tc['name']} args={json.dumps(tool_args, default=str)[:1200]} "
                    f"error={result.error} metadata={json.dumps(metadata, default=str)[:1200]}"
                )
