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

export const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  onRowClick,
}) => {
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
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 flex flex-col min-h-0 rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Header */}
        <div className="flex-none flex items-center justify-between border-b-2 border-black bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={cn(
                'flex items-center gap-2 text-sm font-black transition-colors hover:text-black',
                statusFilter === 'OPEN' ? 'text-black' : 'text-gray-500'
              )}
            >
              <CircleDot className="h-4 w-4" />
              {openCount} Open
            </button>
            <button
              onClick={() => setStatusFilter('CLOSED')}
              className={cn(
                'flex items-center gap-2 text-sm font-black transition-colors hover:text-black',
                statusFilter === 'CLOSED' ? 'text-black' : 'text-gray-500'
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              {closedCount} Closed
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto w-full">
          {paginatedIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onRowClick(issue.issue_number)}
              className="group flex items-start gap-3 border-b-2 border-black p-4 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="pt-1">
                {issue.status === 'OPEN' ? (
                  <CircleDot className="h-4 w-4 text-green-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-black text-base text-black group-hover:text-blue-600 transition-colors">
                    {issue.title}
                  </h3>
                  <div className="flex gap-1 flex-wrap">
                    {issue.labels.map((label) => (
                      <LabelBadge key={label} label={label} />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                  <span className="font-bold text-black">#{issue.issue_number}</span>
                  <span>opened {formatRelativeTime(issue.created_at)}</span>
                  <span>by</span>
                  <span className="font-bold text-black hover:text-blue-600 hover:underline cursor-pointer">
                    {issue.author}
                  </span>
                </div>
              </div>
              {issue.comments_count > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 pt-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{issue.comments_count}</span>
                </div>
              )}
            </div>
          ))}
          {paginatedIssues.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-bold">
              No {statusFilter.toLowerCase()} issues found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex-none flex justify-center py-2">
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
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
    </div>
  );
};
