"""Agent run model for background Issue -> PR coding workflow."""

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.base_class import BaseModel


class AgentRun(Base, BaseModel):
    """Tracks a single background coding-agent execution."""

    __tablename__ = "agent_runs"

    installation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("installations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    repository = Column(String(500), nullable=False, index=True)
    issue_number = Column(Integer, nullable=False, index=True)

    issue_title_snapshot = Column(Text, nullable=True)
    issue_body_snapshot = Column(Text, nullable=True)
    issue_url = Column(String(1000), nullable=True)
    custom_instructions = Column(Text, nullable=True)

    status = Column(
        Enum(
            "PENDING",
            "RUNNING",
            "COMPLETED",
            "FAILED",
            "CANCELED",
            name="agent_run_status_enum",
        ),
        nullable=False,
        default="PENDING",
        index=True,
    )
    celery_task_id = Column(String(255), nullable=True, index=True)

    iteration = Column(Integer, nullable=False, default=0)
    tokens_used = Column(Integer, nullable=False, default=0)
    tool_calls_made = Column(Integer, nullable=False, default=0)

    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True, index=True)
    elapsed_seconds = Column(Integer, nullable=True)

    branch_name = Column(String(255), nullable=True)
    pr_number = Column(Integer, nullable=True)
    pr_url = Column(String(1000), nullable=True)
    final_summary = Column(Text, nullable=True)
    error = Column(Text, nullable=True)

    changed_files = Column(JSONB, nullable=False, default=list)

    # Full raw payloads for tracing/debugging UX
    system_prompt = Column(Text, nullable=True)
    initial_user_message = Column(Text, nullable=True)
    conversation = Column(JSONB, nullable=False, default=list)
    final_result = Column(JSONB, nullable=False, default=dict)

    installation = relationship("Installation")
    user = relationship("User")

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<AgentRun(id={self.id}, repo={self.repository}, "
            f"issue={self.issue_number}, status={self.status})>"
        )
