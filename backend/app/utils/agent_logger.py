"""Structured file logging for agent operations."""

import logging
import json
from pathlib import Path
from datetime import datetime


def setup_agent_logger(agent_id: str, log_dir: str = "logs/agents") -> logging.Logger:
    """Set up file logger for agent execution.

    Args:
        agent_id: Agent ID for log file naming
        log_dir: Directory for log files

    Returns:
        Configured logger instance
    """
    # Create logs directory if it doesn't exist
    Path(log_dir).mkdir(parents=True, exist_ok=True)

    # Create logger
    logger_name = f"agent.{agent_id}"
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.DEBUG)

    # Remove existing handlers
    logger.handlers.clear()

    # File handler - detailed JSON logs
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = Path(log_dir) / f"{agent_id}_{timestamp}.log"

    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)

    # JSON formatter for structured logs
    class JSONFormatter(logging.Formatter):
        def format(self, record):
            log_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "level": record.levelname,
                "agent_id": agent_id,
                "message": record.getMessage(),
            }

            # Add extra fields if present
            if hasattr(record, "extra"):
                log_data.update(record.extra)

            return json.dumps(log_data)

    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)

    # Console handler - simple format for monitoring
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    logger.info(f"Agent logger initialized: {log_file}")

    return logger
