import React, { useMemo, useState } from 'react';
import { FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { ReviewCommentWithContext } from '@/types/api';
import { AnalyticsCommentSheet } from '@/components/dashboard/analytics/AnalyticsCommentSheet';

interface AnalyticsIssuesTabProps {
  selectedRepository: string | null;
  comments: ReviewCommentWithContext[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (nextPage: number) => void;
  loading: boolean;
  error: string | null;
}

const severityRank = {
  CRITICAL: 4,
  ERROR: 3,
  WARNING: 2,
  INFO: 1,
} as const;

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

export const AnalyticsIssuesTab: React.FC<AnalyticsIssuesTabProps> = ({
  selectedRepository,
  comments,
  page,
  pageSize,
  total,
  onPageChange,
  loading,
  error,
}) => {
  const [selectedComment, setSelectedComment] = useState<ReviewCommentWithContext | null>(null);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const timeDiff =
        new Date(b.comment.created_at).getTime() - new Date(a.comment.created_at).getTime();
      if (timeDiff !== 0) return timeDiff;
      return severityRank[b.comment.severity] - severityRank[a.comment.severity];
    });
  }, [comments]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getDisplayTitle = (item: ReviewCommentWithContext): string => {
    const title = item.comment.title?.trim();
    if (title) return title;
    return 'Untitled finding';
  };

  const renderPaginationNumbers = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={page === i}
              onClick={() => onPageChange(i)}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={page === 1}
            onClick={() => onPageChange(1)}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        items.push(<PaginationEllipsis key="ellipsis-1" />);
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={page === i}
              onClick={() => onPageChange(i)}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis-2" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => onPageChange(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <>
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="font-black">Recent AI Detected Issues</CardTitle>
          <CardDescription className="font-medium text-black/60">
            Latest code quality and security findings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-black bg-white hover:bg-transparent">
                <TableHead className="font-black text-black">Severity</TableHead>
                <TableHead className="font-black text-black">Title</TableHead>
                <TableHead className="font-black text-black">File</TableHead>
                <TableHead className="font-black text-black">Time</TableHead>
                <TableHead className="text-right font-black text-black">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedRepository && (
                <TableRow className="border-b-2 border-black/10 bg-white">
                  <TableCell colSpan={5} className="py-8 text-center font-medium text-black/60">
                    Select a repository to view AI detected issues.
                  </TableCell>
                </TableRow>
              )}
              {selectedRepository && loading && (
                <TableRow className="border-b-2 border-black/10 bg-white">
                  <TableCell colSpan={5} className="py-8 text-center font-medium text-black/60">
                    Loading recent review comments...
                  </TableCell>
                </TableRow>
              )}
              {selectedRepository && !loading && error && (
                <TableRow className="border-b-2 border-black/10 bg-white">
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center font-medium text-[var(--metis-red)]"
                  >
                    Failed to load issues: {error}
                  </TableCell>
                </TableRow>
              )}
              {selectedRepository && !loading && !error && sortedComments.length === 0 && (
                <TableRow className="border-b-2 border-black/10 bg-white">
                  <TableCell colSpan={5} className="py-8 text-center font-medium text-black/60">
                    No AI findings yet for this repository.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                !error &&
                sortedComments.map((item) => (
                  <TableRow
                    key={item.comment.id}
                    className="cursor-pointer border-b-2 border-black/10 bg-white transition-colors hover:bg-[var(--metis-pastel-2)]"
                    onClick={() => setSelectedComment(item)}
                  >
                    <TableCell>
                      <Badge
                        variant="neutral"
                        className={`border-2 font-bold ${severityClass(item.comment.severity)}`}
                      >
                        {item.comment.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-black">{getDisplayTitle(item)}</TableCell>
                    <TableCell className="font-mono text-xs text-black/70">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        <span>{item.comment.file_path}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-black/60">
                      {formatRelativeTime(item.comment.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="neutral"
                        className="border-2 border-black bg-white font-bold text-black"
                      >
                        {item.review.review_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedRepository && !loading && !error && totalPages > 0 && (
        <div className="flex flex-none justify-center py-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {renderPaginationNumbers()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  className={
                    page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AnalyticsCommentSheet
        selectedComment={selectedComment}
        open={selectedComment !== null}
        onOpenChange={(open) => !open && setSelectedComment(null)}
      />
    </>
  );
};
