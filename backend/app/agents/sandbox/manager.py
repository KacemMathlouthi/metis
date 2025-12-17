"""Manages Daytona sandbox lifecycle for agents."""

from typing import Any, Dict
from app.agents.sandbox.client import DaytonaClient


class SandboxManager:
    """Manages Daytona sandbox lifecycle."""

    def __init__(self, git_username: str | None = None, git_token: str | None = None):
        """Initialize sandbox manager.

        Args:
            git_username: Git username for authentication
            git_token: Git personal access token
        """
        self.client = DaytonaClient(git_username=git_username, git_token=git_token)
        self._active_sandboxes: Dict[str, Any] = {}

    def acquire(
        self,
        agent_id: str,
        repository_url: str | None = None,
        branch: str | None = None,
        language: str = "python",
    ):
        """Acquire a sandbox for an agent.

        Args:
            agent_id: Agent ID (unique identifier)
            repository_url: Git repo to clone
            language: Programming language runtime (default: python)

        Returns:
            Daytona Sandbox instance
        """
        # Check if sandbox already exists for this agent
        if agent_id in self._active_sandboxes:
            sandbox = self._active_sandboxes[agent_id]
            # Check if sandbox is still running
            if sandbox.state == "STARTED":
                return sandbox
            else:
                # Sandbox stopped, start it again
                sandbox.start()
                return sandbox

        # Create new sandbox
        sandbox = self.client.create_sandbox(
            agent_id=agent_id,
            repository_url=repository_url,
            branch=branch,
            language=language,
        )

        self._active_sandboxes[agent_id] = sandbox
        return sandbox

    def release(self, agent_id: str) -> None:
        """Release and delete sandbox for an agent.

        Args:
            agent_id: Agent ID
        """
        if agent_id in self._active_sandboxes:
            sandbox = self._active_sandboxes.pop(agent_id)
            try:
                sandbox.delete()
            except Exception as e:
                # Log error but don't fail
                print(f"Error deleting sandbox {agent_id}: {e}")

    def get(self, agent_id: str):
        """Get active sandbox for an agent.

        Args:
            agent_id: Agent ID

        Returns:
            Daytona Sandbox instance or None
        """
        return self._active_sandboxes.get(agent_id)

    def stop(self, agent_id: str) -> None:
        """Stop sandbox without deleting (for cost savings).

        Args:
            agent_id: Agent ID
        """
        if agent_id in self._active_sandboxes:
            sandbox = self._active_sandboxes[agent_id]
            try:
                sandbox.stop()
            except Exception as e:
                print(f"Error stopping sandbox {agent_id}: {e}")

    def list_active(self) -> list[str]:
        """List all active agent IDs with sandboxes.

        Returns:
            List of agent IDs
        """
        return list(self._active_sandboxes.keys())
