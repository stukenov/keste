import { useState } from 'react';
import { MessageSquare, Reply, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import type { Comment, CellComment } from '../core-ts/comment-types';

interface CommentThreadProps {
  cellComment: CellComment;
  currentUser: string;
  onAddReply: (parentId: string, content: string) => void;
  onEditComment: (commentId: string, newContent: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolve: () => void;
  onUnresolve: () => void;
}

export function CommentThread({
  cellComment,
  currentUser,
  onAddReply,
  onEditComment,
  onDeleteComment,
  onResolve,
  onUnresolve,
}: CommentThreadProps) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState('');

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;
    onAddReply(parentId, replyText);
    setReplyText('');
    setReplyTo(null);
  };

  const handleEditComment = (commentId: string) => {
    if (!editText.trim()) return;
    onEditComment(commentId, editText);
    setEditText('');
    setEditingId(null);
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
    setReplyTo(null);
  };

  const startReply = (commentId: string) => {
    setReplyTo(commentId);
    setReplyText('');
    setEditingId(null);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Organize comments into threads
  const rootComments = cellComment.comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) =>
    cellComment.comments.filter(c => c.parentId === parentId);

  const renderComment = (comment: Comment, level: number = 0) => {
    const isEditing = editingId === comment.id;
    const isReplying = replyTo === comment.id;
    const replies = getReplies(comment.id);
    const isAuthor = comment.author === currentUser;

    return (
      <div key={comment.id} className={level > 0 ? 'ml-6 mt-2' : 'mb-3'}>
        {isEditing ? (
          <div className="bg-muted/50 rounded-lg p-3">
            <Textarea
              value={editText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditText(e.target.value)}
              className="min-h-[60px] mb-2"
              placeholder="Edit comment..."
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingId(null)}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(comment.timestamp)}
                  {comment.edited && ' (edited)'}
                </span>
              </div>
              {isAuthor && (
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => startEdit(comment)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap mb-2">{comment.content}</p>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => startReply(comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
        )}

        {isReplying && (
          <div className="ml-6 mt-2 bg-muted/50 rounded-lg p-3">
            <Textarea
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
              className="min-h-[60px] mb-2"
              placeholder="Write a reply..."
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleAddReply(comment.id)}>
                <Check className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {replies.map(reply => renderComment(reply, level + 1))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="font-semibold text-sm">
            Cell {String.fromCharCode(65 + (cellComment.col - 1))}{cellComment.row}
          </span>
        </div>
        <Button
          size="sm"
          variant={cellComment.resolved ? 'ghost' : 'default'}
          onClick={cellComment.resolved ? onUnresolve : onResolve}
        >
          {cellComment.resolved ? 'Reopen' : 'Resolve'}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3">
        {rootComments.map(comment => renderComment(comment))}
      </ScrollArea>

      {!replyTo && !editingId && (
        <div className="p-3 border-t">
          <Textarea
            value={replyText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
            className="min-h-[80px] mb-2"
            placeholder="Add a comment..."
          />
          <Button
            size="sm"
            onClick={() => {
              if (!replyText.trim()) return;
              // Add root comment
              onAddReply('', replyText);
              setReplyText('');
            }}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Comment
          </Button>
        </div>
      )}
    </div>
  );
}
