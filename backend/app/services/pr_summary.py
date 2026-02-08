"""Utilities for safely composing PR description summaries."""

from __future__ import annotations

from dataclasses import dataclass


SUMMARY_START_MARKER = "<!-- metis:summary:start -->"
SUMMARY_END_MARKER = "<!-- metis:summary:end -->"


@dataclass(frozen=True)
class SummaryComposeResult:
    """Result of composing PR description with generated summary."""

    body: str
    inserted_new_block: bool
    replaced_existing_block: bool


def build_summary_block(summary_markdown: str) -> str:
    """Build managed summary block wrapped in marker comments."""
    content = summary_markdown.strip()
    return (
        f"{SUMMARY_START_MARKER}\n"
        "## Metis AI Summary\n\n"
        f"{content}\n"
        f"{SUMMARY_END_MARKER}"
    )


def compose_pr_description(
    existing_body: str | None,
    summary_markdown: str,
    mode: str = "append",
) -> SummaryComposeResult:
    """Compose final PR description using append/replace logic.

    Modes:
    - append: preserve existing body and append `\\n --- \\n{summary}`.
    - replace: replace entire description with summary markdown.
    """
    normalized_mode = (mode or "append").strip().lower()
    if normalized_mode not in {"append", "replace"}:
        raise ValueError(f"Invalid summary mode '{mode}'. Use 'append' or 'replace'.")

    summary = summary_markdown.strip()
    current = (existing_body or "").strip()

    if normalized_mode == "replace":
        return SummaryComposeResult(
            body=summary,
            inserted_new_block=not bool(current),
            replaced_existing_block=bool(current),
        )

    if current:
        return SummaryComposeResult(
            body=f"{current.rstrip()}\n --- \n{summary}",
            inserted_new_block=True,
            replaced_existing_block=False,
        )

    return SummaryComposeResult(
        body=summary,
        inserted_new_block=True,
        replaced_existing_block=False,
    )
