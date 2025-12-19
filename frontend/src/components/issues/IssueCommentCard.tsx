import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { IssueComment } from '@/types/api';

interface IssueCommentCardProps {
  comment: IssueComment;
}

export const IssueCommentCard: React.FC<IssueCommentCardProps> = ({
  comment,
}) => {
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
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300 -z-10" />
      
      {/* Avatar */}
      <div className="flex-none z-10">
        <Avatar className="h-10 w-10 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
          <AvatarImage src={comment.avatar_url as string} alt={comment.author} />
          <AvatarFallback className="bg-yellow-200 text-black font-bold text-xs">
            {comment.author.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Comment Box */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="relative border-2 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Arrow */}
          <div className="absolute top-5 -left-[7px] w-3.5 h-3.5 bg-gray-100 border-l-2 border-t-2 border-black transform -rotate-45" />

          {/* Header */}
          <div className="relative flex items-center justify-between border-b-2 border-black bg-gray-100 px-4 py-2 rounded-t-md z-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-black">{comment.author}</span>
              <span className="text-gray-500 text-xs"> {formatDate(comment.created_at)}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 text-sm leading-relaxed overflow-x-auto bg-white rounded-b-lg">
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-50">
              <p className="whitespace-pre-wrap">{comment.body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
