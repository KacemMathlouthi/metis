"""Autonomous agent execution loop."""

import logging

from app.agents.base import AgentState, BaseAgent

logger = logging.getLogger(__name__)


class AgentLoop:
    """Orchestrates agent execution using run() and should_stop()."""

    def __init__(self, agent: BaseAgent):
        """Initialize agent loop.

        Args:
            agent: BaseAgent instance to execute
        """
        self.agent = agent

    async def execute(self) -> AgentState:
        """Run agent until completion or limits exceeded.

        Returns:
            Final agent state
        """
        logger.info(f"Starting agent loop for {self.agent.agent_id}")

        try:
            # Run iterations
            while not self.agent.should_stop():
                # Execute one iteration
                should_continue = await self.agent.run()

                # Agent decided to stop
                if not should_continue:
                    break

        except Exception as e:
            logger.error(f"Agent loop failed: {e}", exc_info=True)
            self.agent.state.status = "failed"
            self.agent.state.error = str(e)

        # Log final stats
        logger.info(
            f"Agent {self.agent.agent_id} finished: "
            f"status={self.agent.state.status}, "
            f"iterations={self.agent.state.iteration}, "
            f"tokens={self.agent.state.tokens_used}, "
            f"tools={self.agent.state.tool_calls_made}"
        )

        return self.agent.state
