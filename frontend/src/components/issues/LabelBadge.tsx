import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LabelBadgeProps {
  label: string;
  className?: string;
}

export const LabelBadge: React.FC<LabelBadgeProps> = ({ label, className }) => {
  // hash function to generate consistent colors for labels
  const getColorForLabel = (str: string) => {
    const colors = [
      {
        border: 'border-[var(--metis-red)]',
        bg: 'bg-[var(--metis-pastel-red)]',
        text: 'text-[var(--metis-red)]',
      },
      {
        border: 'border-[var(--metis-orange-dark)]',
        bg: 'bg-[var(--metis-pastel-3)]',
        text: 'text-[var(--metis-orange-dark)]',
      },
      {
        border: 'border-[var(--metis-orange)]',
        bg: 'bg-[var(--metis-pastel-1)]',
        text: 'text-[var(--metis-orange)]',
      },
      {
        border: 'border-[var(--metis-yellow)]',
        bg: 'bg-[var(--metis-yellow)]',
        text: 'text-black',
      },
      {
        border: 'border-black',
        bg: 'bg-black',
        text: 'text-white',
      },
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
      className={cn('border-2 text-xs font-bold', color.border, color.bg, color.text, className)}
    >
      {label}
    </Badge>
  );
};
