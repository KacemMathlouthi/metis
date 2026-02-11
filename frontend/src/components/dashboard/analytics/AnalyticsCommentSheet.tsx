import React from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ReviewCommentWithContext } from '@/types/api';

interface AnalyticsCommentSheetProps {
  selectedComment: ReviewCommentWithContext | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(diffMs / day);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function severityClass(severity: ReviewCommentWithContext['comment']['severity']): string {
  if (severity === 'CRITICAL' || severity === 'ERROR') {
    return 'border-[var(--metis-red)] bg-[var(--metis-pastel-red)] text-[var(--metis-red)]';
  }
  if (severity === 'WARNING') {
    return 'border-[var(--metis-orange-light)] bg-[var(--metis-pastel-2)] text-[var(--metis-orange-dark)]';
  }
  return 'border-[var(--metis-orange)] bg-[var(--metis-pastel-1)] text-[var(--metis-orange)]';
}

function getDisplayTitle(item: ReviewCommentWithContext): string {
  const title = item.comment.title?.trim();
  if (title) return title;
  return 'Untitled finding';
}

function toGitHubCommentUrl(item: ReviewCommentWithContext): string | null {
  const id = item.comment.github_comment_id;
  if (!id) return null;
  return `https://github.com/${item.review.repository}/pull/${item.review.pr_number}#discussion_r${id}`;
}

export const AnalyticsCommentSheet: React.FC<AnalyticsCommentSheetProps> = ({
  selectedComment,
  open,
  onOpenChange,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l-2 border-black bg-[var(--metis-pastel-1)] p-0 sm:max-w-2xl"
      >
        {selectedComment && (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b-2 border-black bg-white">
              <div className="flex items-start justify-between gap-3 pr-10">
                <div>
                  <SheetTitle className="text-xl font-black">AI Issue Details</SheetTitle>
                  <SheetDescription className="text-black/60">
                    {selectedComment.review.repository} • PR #{selectedComment.review.pr_number}
                  </SheetDescription>
                </div>
                <Button
                  asChild
                  variant="neutral"
                  className="shrink-0 gap-2 border-2 border-black font-bold"
                >
                  <a
                    href={`https://github.com/${selectedComment.review.repository}/blob/${selectedComment.review.commit_sha}/${selectedComment.comment.file_path}#L${selectedComment.comment.line_number}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open File
                  </a>
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="neutral"
                    className={`border-2 font-bold ${severityClass(selectedComment.comment.severity)}`}
                  >
                    {selectedComment.comment.severity}
                  </Badge>
                  <Badge
                    variant="neutral"
                    className="border-2 border-black bg-white font-bold text-black"
                  >
                    {selectedComment.comment.category}
                  </Badge>
                  <Badge
                    variant="neutral"
                    className="border-2 border-black bg-white font-bold text-black"
                  >
                    {selectedComment.review.review_status}
                  </Badge>
                </div>

                <div className="font-mono text-xs text-black/70">
                  {selectedComment.comment.file_path}:{selectedComment.comment.line_number}
                  {selectedComment.comment.line_end ? `-${selectedComment.comment.line_end}` : ''}
                </div>
                <div className="mt-1 text-xs text-black/60">
                  Detected {formatRelativeTime(selectedComment.comment.created_at)}
                </div>
              </div>

              <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="mb-2 text-lg font-black">{getDisplayTitle(selectedComment)}</h4>
                <h4 className="mb-3 text-sm font-black tracking-wider uppercase">
                  Issue Description
                </h4>
                <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-black prose-pre:text-gray-50 max-w-none">
                  <Streamdown isAnimating={false}>
                    {selectedComment.comment.comment_text}
                  </Streamdown>
                </div>
                <div className="mt-3 font-mono text-[11px] text-black/60">
                  commit: {selectedComment.review.commit_sha}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {toGitHubCommentUrl(selectedComment) && (
                  <Button
                    asChild
                    variant="neutral"
                    className="gap-2 border-2 border-black font-bold"
                  >
                    <a
                      href={toGitHubCommentUrl(selectedComment) || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="h-4 w-4" />
                      View on GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
