import { Streamdown } from 'streamdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { IssueComment } from '@/types/api';

interface IssueCommentCardProps {
  comment: IssueComment;
}

export const IssueCommentCard: React.FC<IssueCommentCardProps> = ({ comment }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      <div className="absolute top-0 bottom-0 left-5 -z-10 w-0.5 bg-black/20" />

      {/* Avatar */}
      <div className="z-10 flex-none">
        <Avatar className="h-10 w-10 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <AvatarImage src={comment.avatar_url as string} alt={comment.author} />
          <AvatarFallback className="bg-[var(--metis-pastel-2)] text-xs font-bold text-black">
            {comment.author.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Comment Box */}
      <div className="min-w-0 flex-1 pb-8">
        <div className="relative rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Arrow */}
          <div className="absolute top-5 -left-[7px] h-3.5 w-3.5 -rotate-45 transform border-t-2 border-l-2 border-black bg-[var(--metis-pastel-1)]" />

          {/* Header */}
          <div className="relative z-0 flex items-center justify-between rounded-t-md border-b-2 border-black bg-[var(--metis-pastel-1)] px-4 py-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-black">{comment.author}</span>
              <span className="text-xs text-black/60"> {formatDate(comment.created_at)}</span>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-x-auto rounded-b-lg bg-white p-4 text-sm leading-relaxed">
            <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-black prose-pre:text-gray-50 max-w-none">
              <Streamdown isAnimating={false}>{comment.body}</Streamdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
