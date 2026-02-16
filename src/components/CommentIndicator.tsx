import { MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import type { CellComment } from '../core-ts/comment-types';

interface CommentIndicatorProps {
  cellComment: CellComment;
  onClick: () => void;
}

export function CommentIndicator({ cellComment, onClick }: CommentIndicatorProps) {
  const commentCount = cellComment.comments.length;
  const hasUnresolved = !cellComment.resolved;
  const lastComment = cellComment.comments[cellComment.comments.length - 1];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`absolute top-0 right-0 w-0 h-0 border-t-8 border-r-8 ${
            hasUnresolved
              ? 'border-t-orange-500 border-r-orange-500'
              : 'border-t-muted border-r-muted'
          } hover:border-t-orange-600 hover:border-r-orange-600 transition-colors cursor-pointer`}
          style={{
            borderTopColor: hasUnresolved ? 'rgb(249 115 22)' : 'rgb(228 228 231)',
            borderRightColor: hasUnresolved ? 'rgb(249 115 22)' : 'rgb(228 228 231)',
          }}
        >
          <span className="sr-only">View comments</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1 font-semibold">
            <MessageSquare className="h-3 w-3" />
            <span>
              {commentCount} comment{commentCount !== 1 ? 's' : ''}
            </span>
          </div>
          {lastComment && (
            <div className="text-xs">
              <div className="font-medium">{lastComment.author}:</div>
              <div className="text-muted-foreground line-clamp-2">
                {lastComment.content}
              </div>
            </div>
          )}
          {hasUnresolved && (
            <div className="text-xs text-orange-500 font-medium">Unresolved</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
