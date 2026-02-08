"""Celery tasks package.

Imports all task modules to register them with Celery worker.
"""

from app.tasks.agent_review_task import process_pr_review_with_agent
from app.tasks.summary_task import process_pr_summary_with_agent

__all__ = [
    "process_pr_review_with_agent",
    "process_pr_summary_with_agent",
]
