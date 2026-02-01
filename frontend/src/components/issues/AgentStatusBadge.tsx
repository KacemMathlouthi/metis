import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AgentStatusBadgeProps {
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  className?: string;
}

export const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({
  status,
  className,
}) => {
  const colorMap = {
    PENDING: 'border-black/40 bg-white text-black/60',
    RUNNING: 'border-[var(--metis-orange)] bg-[var(--metis-pastel-1)] text-[var(--metis-orange)]',
    COMPLETED: 'border-[var(--metis-orange-dark)] bg-[var(--metis-pastel-2)] text-[var(--metis-orange-dark)]',
    FAILED: 'border-[var(--metis-red)] bg-[var(--metis-pastel-red)] text-[var(--metis-red)]',
  };

  return (
    <Badge
      variant="neutral"
      className={cn('border-2 font-bold', colorMap[status], className)}
    >
      {status}
    </Badge>
  );
};
