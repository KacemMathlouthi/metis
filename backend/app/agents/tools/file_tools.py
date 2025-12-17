"""File system operation tools using Daytona SDK."""

from app.agents.tools.base import BaseTool, ToolDefinition, ToolResult


class ReadFileTool(BaseTool):
    """Read file contents from sandbox filesystem."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="read_file",
            description="Read the contents of a file from the repository",
            parameters={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path to file relative to workspace/repo"
                    }
                },
                "required": ["file_path"]
            }
        )

    async def execute(self, file_path: str, **kwargs) -> ToolResult:
        """Execute file read using Daytona fs.download_file()."""
        try:
            # Auto-prefix relative paths with workspace/repo
            if not file_path.startswith("/") and not file_path.startswith("workspace/"):
                file_path = f"workspace/repo/{file_path}"

            # Download file content from sandbox
            content = self.sandbox.fs.download_file(file_path)

            # Convert bytes to string
            if isinstance(content, bytes):
                content = content.decode('utf-8')

            return ToolResult(
                success=True,
                data={"content": content, "path": file_path},
                metadata={"size_bytes": len(content)}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class ListFilesTool(BaseTool):
    """List files and directories."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="list_files",
            description="List files and directories in a path",
            parameters={
                "type": "object",
                "properties": {
                    "directory": {
                        "type": "string",
                        "description": "Directory path (default: workspace/repo)"
                    }
                },
                "required": []
            }
        )

    async def execute(self, directory: str = "workspace/repo", **kwargs) -> ToolResult:
        """Execute directory listing using Daytona fs.list_files()."""
        try:
            # Auto-prefix relative paths with workspace/repo
            if not directory.startswith("/") and not directory.startswith("workspace/"):
                directory = f"workspace/repo/{directory}"

            files = self.sandbox.fs.list_files(directory)

            # Convert to simple list format
            file_list = [
                {
                    "name": f.name,
                    "is_dir": f.is_dir,
                    "size": f.size,
                    "modified": str(f.mod_time) if hasattr(f, 'mod_time') else None
                }
                for f in files
            ]

            return ToolResult(
                success=True,
                data={"files": file_list, "directory": directory},
                metadata={"count": len(file_list)}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class SearchFilesTool(BaseTool):
    """Search for text in files (grep)."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="search_files",
            description="Search for text patterns in files (recursive grep)",
            parameters={
                "type": "object",
                "properties": {
                    "pattern": {
                        "type": "string",
                        "description": "Text pattern to search for"
                    },
                    "path": {
                        "type": "string",
                        "description": "Path to search in (default: workspace/repo)"
                    }
                },
                "required": ["pattern"]
            }
        )

    async def execute(self, pattern: str, path: str = "workspace/repo", **kwargs) -> ToolResult:
        """Execute search using Daytona fs.find_files()."""
        try:
            # Auto-prefix relative paths
            if not path.startswith("/") and not path.startswith("workspace/"):
                path = f"workspace/repo/{path}"

            # Use Daytona's built-in search
            results = self.sandbox.fs.find_files(path=path, pattern=pattern)

            # Format results
            matches = [
                {
                    "file": match.file,
                    "line": match.line,
                    "content": match.content
                }
                for match in results
            ]

            return ToolResult(
                success=True,
                data={"matches": matches, "pattern": pattern},
                metadata={"match_count": len(matches)}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class ReplaceInFilesTool(BaseTool):
    """Replace text in files."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="replace_in_files",
            description="Replace text in one or more files",
            parameters={
                "type": "object",
                "properties": {
                    "files": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of file paths to modify"
                    },
                    "pattern": {
                        "type": "string",
                        "description": "Text pattern to find"
                    },
                    "replacement": {
                        "type": "string",
                        "description": "Text to replace with"
                    }
                },
                "required": ["files", "pattern", "replacement"]
            }
        )

    async def execute(
        self,
        files: list[str],
        pattern: str,
        replacement: str,
        **kwargs
    ) -> ToolResult:
        """Execute replace using Daytona fs.replace_in_files()."""
        try:
            # Prefix files with workspace/repo if not absolute
            full_paths = [
                f"workspace/repo/{f}" if not f.startswith("/") else f
                for f in files
            ]

            self.sandbox.fs.replace_in_files(
                files=full_paths,
                pattern=pattern,
                new_value=replacement
            )

            return ToolResult(
                success=True,
                data={"files_modified": full_paths, "pattern": pattern, "replacement": replacement},
                metadata={"file_count": len(full_paths)}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class CreateFileTool(BaseTool):
    """Create a new file."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="create_file",
            description="Create a new file with content",
            parameters={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path for new file relative to workspace/repo"
                    },
                    "content": {
                        "type": "string",
                        "description": "File content"
                    }
                },
                "required": ["file_path", "content"]
            }
        )

    async def execute(self, file_path: str, content: str, **kwargs) -> ToolResult:
        """Execute file creation using Daytona fs.upload_file()."""
        try:
            full_path = f"workspace/repo/{file_path}"
            self.sandbox.fs.upload_file(content.encode('utf-8'), full_path)

            return ToolResult(
                success=True,
                data={"path": file_path, "size": len(content)},
                metadata={"created": True}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class DeleteFileTool(BaseTool):
    """Delete a file."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="delete_file",
            description="Delete a file from the repository",
            parameters={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path to file relative to workspace/repo"
                    }
                },
                "required": ["file_path"]
            }
        )

    async def execute(self, file_path: str, **kwargs) -> ToolResult:
        """Execute file deletion using Daytona fs.delete_file()."""
        try:
            full_path = f"workspace/repo/{file_path}"
            self.sandbox.fs.delete_file(full_path)

            return ToolResult(
                success=True,
                data={"path": file_path, "deleted": True}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))
