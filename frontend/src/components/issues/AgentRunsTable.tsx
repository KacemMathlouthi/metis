import { useState } from 'react';
import { Clock, Zap, Code, Bot, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import type { AgentRun } from '@/types/api';
import { AgentStatusBadge } from './AgentStatusBadge';

interface AgentRunsTableProps {
  agentRuns: AgentRun[];
  onRowClick: (agentRunId: string) => void;
}

const ITEMS_PER_PAGE = 25;

export const AgentRunsTable: React.FC<AgentRunsTableProps> = ({
  agentRuns,
  onRowClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '-';

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const totalPages = Math.ceil(agentRuns.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRuns = agentRuns.slice(startIndex, endIndex);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'RUNNING':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 flex flex-col min-h-0 rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Header */}
        <div className="flex-none flex items-center justify-between border-b-2 border-black bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-4 text-sm font-black text-black">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              {agentRuns.length} Runs
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto w-full">
          {paginatedRuns.map((run) => (
            <div
              key={run.id}
              onClick={() => onRowClick(run.id)}
              className="group flex items-start gap-3 border-b-2 border-black p-4 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="pt-1">
                {getStatusIcon(run.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-black text-base text-black group-hover:text-blue-600 transition-colors">
                    Agent Run for Issue #{run.issue_number}
                  </h3>
                  <AgentStatusBadge status={run.status} className="text-[10px] px-1.5 py-0" />
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-3 flex-wrap font-medium">
                  <span>started {formatRelativeTime(run.started_at)}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Iter {run.iteration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>{run.tokens_used.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    <span>{run.tool_calls_made} calls</span>
                  </div>
                </div>
                {run.custom_instructions && (
                  <div className="mt-1 text-xs text-gray-500 italic truncate max-w-2xl border-l-2 border-gray-300 pl-2">
                    "{run.custom_instructions}"
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                {run.pr_url ? (
                  <a
                    href={run.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-blue-600 hover:underline font-bold border-2 border-blue-200 bg-blue-50 px-2 py-1 rounded-md"
                  >
                    PR #{run.pr_number}
                  </a>
                ) : run.error ? (
                  <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md border-2 border-red-200">
                    Error
                  </span>
                ) : null}
              </div>
            </div>
          ))}
          {paginatedRuns.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-bold">
              No agent runs found.
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
