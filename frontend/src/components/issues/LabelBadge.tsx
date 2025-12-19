import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LabelBadgeProps {
  label: string;
  className?: string;
}

export const LabelBadge: React.FC<LabelBadgeProps> = ({
  label,
  className,
}) => {
  // hash function to generate consistent colors for labels
  const getColorForLabel = (str: string) => {
    const colors = [
      { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-700' },
      { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' },
      { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-700' },
      { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' },
      { border: 'border-teal-500', bg: 'bg-teal-100', text: 'text-teal-700' },
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const color = getColorForLabel(label);

  return (
    <Badge
      variant="neutral"
      className={cn(
        'border font-medium text-xs',
        color.border,
        color.bg,
        color.text,
        className
      )}
    >
      {label}
    </Badge>
  );
};
