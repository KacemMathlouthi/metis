import { CircleDot, MessageSquare, CheckCircle2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import type { IssueWithAgent } from '@/types/api';
import { LabelBadge } from './LabelBadge';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface IssuesTableProps {
  issues: IssueWithAgent[];
  onRowClick: (issueNumber: number) => void;
}

const ITEMS_PER_PAGE = 10;

export const IssuesTable: React.FC<IssuesTableProps> = ({ issues, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'CLOSED'>('OPEN');

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredIssues = issues.filter((issue) => issue.status === statusFilter);
  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIssues = filteredIssues.slice(startIndex, endIndex);

  const openCount = issues.filter((i) => i.status === 'OPEN').length;
  const closedCount = issues.filter((i) => i.status === 'CLOSED').length;

  const renderPaginationNumbers = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
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
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis-1" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis-2" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
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
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="flex flex-none items-center justify-between border-b-2 border-black bg-[var(--metis-pastel-1)] px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={cn(
                'flex items-center gap-2 text-sm font-black transition-colors hover:text-black',
                statusFilter === 'OPEN' ? 'text-black' : 'text-black/60'
              )}
            >
              <CircleDot className="h-4 w-4" />
              {openCount} Open
            </button>
            <button
              onClick={() => setStatusFilter('CLOSED')}
              className={cn(
                'flex items-center gap-2 text-sm font-black transition-colors hover:text-black',
                statusFilter === 'CLOSED' ? 'text-black' : 'text-black/60'
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              {closedCount} Closed
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full flex-1 overflow-y-auto">
          {paginatedIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onRowClick(issue.issue_number)}
              className="group flex cursor-pointer items-start gap-3 border-b-2 border-black p-4 transition-colors last:border-0 hover:bg-[var(--metis-pastel-1)]"
            >
              <div className="pt-1">
                {issue.status === 'OPEN' ? (
                  <CircleDot className="h-4 w-4 text-green-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-black transition-colors group-hover:text-[var(--metis-orange)]">
                    {issue.title}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map((label) => (
                      <LabelBadge key={label} label={label} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-black/60">
                  <span className="font-bold text-black">#{issue.issue_number}</span>
                  <span>opened {formatRelativeTime(issue.created_at)}</span>
                  <span>by</span>
                  <span className="cursor-pointer font-bold text-black hover:text-[var(--metis-orange)] hover:underline">
                    {issue.author}
                  </span>
                </div>
              </div>
              {issue.comments_count > 0 && (
                <div className="flex items-center gap-1 pt-1 text-xs font-bold text-black/60">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{issue.comments_count}</span>
                </div>
              )}
            </div>
          ))}
          {paginatedIssues.length === 0 && (
            <div className="p-8 text-center font-bold text-black/60">
              No {statusFilter.toLowerCase()} issues found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-none justify-center py-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {renderPaginationNumbers()}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={
                  currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
