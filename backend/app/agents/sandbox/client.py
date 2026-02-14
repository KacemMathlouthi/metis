"""Daytona SDK client wrapper for sandbox operations."""

from daytona import Daytona, DaytonaConfig, CreateSandboxFromSnapshotParams
from app.core.config import settings


class DaytonaClient:
    """Wrapper around Daytona SDK for agent use."""

    def __init__(self, git_username: str | None = None, git_token: str | None = None):
        """Initialize Daytona client with settings from config.

        Args:
            git_username: Git username for authentication (default: "git")
            git_token: Git personal access token for authentication
        """
        self._client = Daytona(
            DaytonaConfig(
                api_key=settings.DAYTONA_API_KEY,
                api_url=settings.DAYTONA_API_URL,
                target=settings.DAYTONA_TARGET,
            )
        )
        self.git_username = git_username or "git"
        self.git_token = git_token

    def create_sandbox(
        self,
        agent_id: str,
        repository_url: str | None = None,
        branch: str | None = None,
        language: str = "python",
        snapshot: str | None = None,
    ):
        """Create a new Daytona sandbox.

        Args:
            agent_id: Unique agent ID (used as sandbox name)
            repository_url: Git repo to clone (optional)
            language: Python, TypeScript, or JavaScript (default: python)
            snapshot: Custom snapshot name (optional)

        Returns:
            Daytona Sandbox instance
        """
        params = CreateSandboxFromSnapshotParams(
            name=f"agent-{agent_id}",
            language=language,
            snapshot=snapshot,
            resources={
                "cpu": 2,  # 2 vCPU
                "memory": 4,  # 4GB RAM
                "disk": 2,  # 2GB disk
            },
            auto_stop_interval=15,  # Stop after 15 min inactivity
            auto_delete_interval=-1,  # Never auto-delete
            ephemeral=False,  # Keep sandbox after stop
        )

        # Create sandbox (will stream logs if needed)
        sandbox = self._client.create(params, timeout=0)

        # Clone repository if provided
        if repository_url:
            self._clone_repository(sandbox, repository_url, branch)

        return sandbox

    def _clone_repository(self, sandbox, repository_url: str, branch: str | None = None) -> None:
        """Clone a Git repository into the sandbox.

        Args:
            sandbox: Daytona Sandbox instance
            repository_url: Git repository URL to clone
            branch: Specific branch to clone
        """
        # Use Daytona's built-in git clone with authentication
        sandbox.git.clone(
            url=repository_url,
            path="workspace/repo",
            branch=branch,  # Clone PR's branch
            username=self.git_username,
            password=self.git_token,
        )

    def find_sandbox(self, sandbox_id: str):
        """Find an existing sandbox by ID.

        Args:
            sandbox_id: Daytona sandbox ID

        Returns:
            Daytona Sandbox instance or None
        """
        try:
            return self._client.find_one(sandbox_id)
        except Exception:
            return None
