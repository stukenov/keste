import { useState } from 'react';
import { MessageSquare, Filter, CheckCircle2, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { CommentThread } from './CommentThread';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { CellComment, CommentFilter } from '../core-ts/comment-types';

interface CommentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comments: CellComment[];
  currentUser: string;
  sheets: Array<{ id: string; name: string }>;
  selectedCommentId?: string;
  onAddComment: (cellComment: CellComment, parentId: string, content: string) => void;
  onEditComment: (cellComment: CellComment, commentId: string, newContent: string) => void;
  onDeleteComment: (cellComment: CellComment, commentId: string) => void;
  onResolveComment: (cellCommentId: string) => void;
  onUnresolveComment: (cellCommentId: string) => void;
  onNavigateToCell: (sheetId: string, row: number, col: number) => void;
}

export function CommentPanel({
  open,
  onOpenChange,
  comments,
  currentUser,
  sheets,
  selectedCommentId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolveComment,
  onUnresolveComment,
  onNavigateToCell,
}: CommentPanelProps) {
  const [selectedComment, setSelectedComment] = useState<CellComment | null>(null);
  const [filter, setFilter] = useState<CommentFilter>({
    showResolved: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-select comment if provided
  useState(() => {
    if (selectedCommentId) {
      const comment = comments.find(c => c.id === selectedCommentId);
      if (comment) setSelectedComment(comment);
    }
  });

  // Filter comments
  const filteredComments = comments.filter(cellComment => {
    // Filter by resolved status
    if (!filter.showResolved && cellComment.resolved) return false;

    // Filter by sheet
    if (filter.sheetId && cellComment.sheetId !== filter.sheetId) return false;

    // Filter by author
    if (filter.author) {
      const hasAuthor = cellComment.comments.some(c =>
        c.author.toLowerCase().includes(filter.author!.toLowerCase())
      );
      if (!hasAuthor) return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContent = cellComment.comments.some(c =>
        c.content.toLowerCase().includes(query)
      );
      const matchesAuthor = cellComment.comments.some(c =>
        c.author.toLowerCase().includes(query)
      );
      if (!matchesContent && !matchesAuthor) return false;
    }

    return true;
  });

  const getCellRef = (row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + (col - 1));
    return `${colLetter}${row}`;
  };

  const getSheetName = (sheetId: string) => {
    return sheets.find(s => s.id === sheetId)?.name || 'Unknown';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] p-0">
        {selectedComment ? (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedComment(null)}
                  >
                    ← Back
                  </Button>
                </SheetTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onNavigateToCell(
                      selectedComment.sheetId,
                      selectedComment.row,
                      selectedComment.col
                    );
                  }}
                >
                  Go to cell
                </Button>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              <CommentThread
                cellComment={selectedComment}
                currentUser={currentUser}
                onAddReply={(parentId, content) =>
                  onAddComment(selectedComment, parentId, content)
                }
                onEditComment={(commentId, newContent) =>
                  onEditComment(selectedComment, commentId, newContent)
                }
                onDeleteComment={(commentId) =>
                  onDeleteComment(selectedComment, commentId)
                }
                onResolve={() => onResolveComment(selectedComment.id)}
                onUnresolve={() => onUnresolveComment(selectedComment.id)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({filteredComments.length})
              </SheetTitle>
            </SheetHeader>

            {/* Filters */}
            <div className="p-4 space-y-3 border-b">
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="flex gap-2">
                <Select
                  value={filter.sheetId || 'all'}
                  onValueChange={(value) =>
                    setFilter({ ...filter, sheetId: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All sheets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sheets</SelectItem>
                    {sheets.map(sheet => (
                      <SelectItem key={sheet.id} value={sheet.id}>
                        {sheet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant={filter.showResolved ? 'secondary' : 'ghost'}
                  onClick={() =>
                    setFilter({ ...filter, showResolved: !filter.showResolved })
                  }
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {filter.showResolved ? 'Hide' : 'Show'} resolved
                </Button>
              </div>
            </div>

            {/* Comment list */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {filteredComments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No comments found</p>
                  </div>
                ) : (
                  filteredComments.map(cellComment => {
                    const lastComment =
                      cellComment.comments[cellComment.comments.length - 1];
                    return (
                      <button
                        key={cellComment.id}
                        onClick={() => setSelectedComment(cellComment)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {getSheetName(cellComment.sheetId)} -{' '}
                              {getCellRef(cellComment.row, cellComment.col)}
                            </span>
                            {cellComment.resolved ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {cellComment.comments.length}
                          </span>
                        </div>
                        {lastComment && (
                          <div className="text-xs">
                            <span className="font-medium">
                              {lastComment.author}:
                            </span>{' '}
                            <span className="text-muted-foreground line-clamp-2">
                              {lastComment.content}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
