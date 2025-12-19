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
    PENDING: 'border-gray-500 bg-gray-100 text-gray-700',
    RUNNING: 'border-blue-500 bg-blue-100 text-blue-700',
    COMPLETED: 'border-green-500 bg-green-100 text-green-700',
    FAILED: 'border-red-500 bg-red-100 text-red-700',
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
