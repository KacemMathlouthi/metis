"""Celery application configuration.

Configures Celery with Redis broker, result backend, retry policies,
and monitoring. Includes signal handlers for task lifecycle logging.
"""

from celery import Celery, Task
from celery.signals import task_failure, task_postrun, task_prerun, task_retry

from app.core.config import settings

celery_app = Celery(
    "metis",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    # Task Serialization (Security)
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # Task Execution
    task_acks_late=True,  # Acknowledge after completion (requeue if worker crashes)
    task_reject_on_worker_lost=True,  # Requeue lost tasks
    worker_prefetch_multiplier=1,  # Fair distribution for long-running tasks
    # Worker Management
    worker_max_tasks_per_child=100,  # Prevent memory leaks (restart after 100 tasks)
    worker_disable_rate_limits=False,
    # Time Limits
    task_time_limit=settings.CELERY_TASK_TIME_LIMIT,  # Hard limit
    task_soft_time_limit=settings.CELERY_TASK_SOFT_TIME_LIMIT,  # Warning
    # Result Backend
    result_expires=3600,  # Results stored for 1 hour
    result_backend_transport_options={"master_name": "mymaster"},
    # Timezone
    timezone="UTC",
    enable_utc=True,
)


# Base Task Class with Retry Logic
class BaseTask(Task):
    """Base task with automatic retry and error handling."""

    autoretry_for = (Exception,)  # Retry on any exception
    retry_kwargs = {"max_retries": 3}
    retry_backoff = True  # Exponential backoff
    retry_backoff_max = 600  # Cap backoff at 10 minutes
    retry_jitter = True  # Add randomness to prevent thundering herd

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Called when task fails after all retries."""
        print(f"Task {task_id} failed: {exc}")

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Called when task is retried."""
        print(f"Task {task_id} retry {self.request.retries}/{self.max_retries}: {exc}")

    def on_success(self, retval, task_id, args, kwargs):
        """Called when task succeeds."""
        print(f"Task {task_id} succeeded")


# Task lifecycle signals for observability
@task_prerun.connect
def task_prerun_handler(task_id, task, **kwargs):
    """Log task start."""
    print(f"Task started: {task.name} [{task_id}]")


@task_postrun.connect
def task_postrun_handler(task_id, task, **kwargs):
    """Log task completion."""
    print(f"Task finished: {task.name} [{task_id}]")


@task_retry.connect
def task_retry_handler(sender, **kwargs):
    """Log task retry."""
    print(f"Task retrying: {sender.name}")


@task_failure.connect
def task_failure_handler(sender, task_id, exception, **kwargs):
    """Log task failure."""
    print(f"Task failed: {sender.name} [{task_id}] - {exception}")


# Import tasks to register them with Celery
# This must be at the end to avoid circular imports
from app.tasks import agent_review_task, background_agent_task, summary_task  # noqa: F401, E402
