"""Process and command execution tools using Daytona SDK."""

from app.agents.tools.base import BaseTool, ToolDefinition, ToolResult


class RunCommandTool(BaseTool):
    """Execute shell commands in sandbox."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="run_command",
            description="Execute a shell command in the sandbox",
            parameters={
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "Shell command to execute"
                    },
                    "cwd": {
                        "type": "string",
                        "description": "Working directory (default: workspace/repo)"
                    },
                    "timeout": {
                        "type": "integer",
                        "description": "Timeout in seconds (default: 30)"
                    }
                },
                "required": ["command"]
            }
        )

    async def execute(
        self,
        command: str,
        cwd: str = "workspace/repo",
        timeout: int = 30,
        **kwargs
    ) -> ToolResult:
        """Execute command using Daytona process.exec()."""
        try:
            response = self.sandbox.process.exec(
                command=command,
                cwd=cwd,
                timeout=timeout
            )

            return ToolResult(
                success=response.exit_code == 0,
                data={
                    "stdout": response.result,
                    "exit_code": response.exit_code
                },
                metadata={"command": command}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class RunCodeTool(BaseTool):
    """Execute code directly (Python/TypeScript/JavaScript)."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="run_code",
            description="Execute code directly in the sandbox (Python, TypeScript, or JavaScript)",
            parameters={
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Code to execute"
                    },
                    "timeout": {
                        "type": "integer",
                        "description": "Timeout in seconds (default: 30)"
                    }
                },
                "required": ["code"]
            }
        )

    async def execute(self, code: str, timeout: int = 30, **kwargs) -> ToolResult:
        """Execute code using Daytona process.code_run()."""
        try:
            response = self.sandbox.process.code_run(code)

            return ToolResult(
                success=response.exit_code == 0,
                data={
                    "result": response.result,
                    "exit_code": response.exit_code
                },
                metadata={"code_length": len(code)}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class RunTestsTool(BaseTool):
    """Run test suite."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="run_tests",
            description="Run test suite (pytest, jest, etc.) in the repository",
            parameters={
                "type": "object",
                "properties": {
                    "test_path": {
                        "type": "string",
                        "description": "Path to test file or directory (default: . for all tests)"
                    },
                    "framework": {
                        "type": "string",
                        "enum": ["pytest", "jest", "unittest", "auto"],
                        "description": "Test framework to use (default: auto-detect)"
                    }
                },
                "required": []
            }
        )

    async def execute(
        self,
        test_path: str = ".",
        framework: str = "auto",
        **kwargs
    ) -> ToolResult:
        """Execute tests using Daytona process.exec()."""
        try:
            # Auto-detect framework if specified
            if framework == "auto":
                framework = "pytest"  # Default to pytest for now

            # Build command
            if framework == "pytest":
                command = f"pytest {test_path} -v"
            elif framework == "jest":
                command = f"npm test -- {test_path}"
            elif framework == "unittest":
                command = f"python -m unittest discover {test_path}"
            else:
                command = f"{framework} {test_path}"

            response = self.sandbox.process.exec(
                command=command,
                cwd="workspace/repo",
                timeout=120  # Tests can take longer
            )

            return ToolResult(
                success=response.exit_code == 0,
                data={
                    "output": response.result,
                    "exit_code": response.exit_code,
                    "framework": framework
                },
                metadata={"test_path": test_path}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class RunLinterTool(BaseTool):
    """Run code linter."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="run_linter",
            description="Run linter (ruff, eslint, etc.) to check code quality",
            parameters={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to lint (default: . for entire repo)"
                    },
                    "linter": {
                        "type": "string",
                        "enum": ["ruff", "eslint", "pylint", "auto"],
                        "description": "Linter to use (default: auto-detect)"
                    }
                },
                "required": []
            }
        )

    async def execute(
        self,
        path: str = ".",
        linter: str = "auto",
        **kwargs
    ) -> ToolResult:
        """Execute linter using Daytona process.exec()."""
        try:
            if linter == "auto":
                linter = "ruff"  # Default

            # Build command
            if linter == "ruff":
                command = f"ruff check {path}"
            elif linter == "eslint":
                command = f"npx eslint {path}"
            elif linter == "pylint":
                command = f"pylint {path}"
            else:
                command = f"{linter} {path}"

            response = self.sandbox.process.exec(
                command=command,
                cwd="workspace/repo",
                timeout=60
            )

            return ToolResult(
                success=response.exit_code == 0,
                data={
                    "output": response.result,
                    "exit_code": response.exit_code,
                    "linter": linter
                },
                metadata={"path": path}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))
