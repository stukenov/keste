import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Edit2, BookmarkPlus } from 'lucide-react';
import type { NamedRange } from '../core-ts/formula-types';

interface NameManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namedRanges: NamedRange[];
  sheets: Array<{ id: string; name: string }>;
  onCreateRange: (range: Omit<NamedRange, 'id' | 'createdAt'>) => void;
  onUpdateRange: (id: string, range: Partial<NamedRange>) => void;
  onDeleteRange: (id: string) => void;
  onNavigateToRange?: (range: NamedRange) => void;
}

export function NameManager({
  open,
  onOpenChange,
  namedRanges,
  sheets,
  onCreateRange,
  onUpdateRange,
  onDeleteRange,
  onNavigateToRange,
}: NameManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRange, setFormRange] = useState('');
  const [formSheetId, setFormSheetId] = useState<string>('workbook');
  const [formComment, setFormComment] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormRange('');
    setFormSheetId('workbook');
    setFormComment('');
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!formName || !formRange) return;

    onCreateRange({
      name: formName,
      range: formRange,
      sheetId: formSheetId === 'workbook' ? undefined : formSheetId,
      comment: formComment,
    });

    resetForm();
  };

  const handleUpdate = () => {
    if (!editingId) return;

    onUpdateRange(editingId, {
      name: formName,
      range: formRange,
      sheetId: formSheetId === 'workbook' ? undefined : formSheetId,
      comment: formComment,
    });

    resetForm();
  };

  const handleEdit = (range: NamedRange) => {
    setEditingId(range.id);
    setFormName(range.name);
    setFormRange(range.range);
    setFormSheetId(range.sheetId || 'workbook');
    setFormComment(range.comment || '');
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this named range?')) {
      onDeleteRange(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            Name Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create/Edit Form */}
          {isCreating ? (
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold">
                {editingId ? 'Edit Named Range' : 'Create New Named Range'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="range-name">Name</Label>
                  <Input
                    id="range-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="MyRange"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="range-ref">Range</Label>
                  <Input
                    id="range-ref"
                    value={formRange}
                    onChange={(e) => setFormRange(e.target.value)}
                    placeholder="A1:B10 or Sheet2!A1:B10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="range-scope">Scope</Label>
                  <Select value={formSheetId} onValueChange={setFormSheetId}>
                    <SelectTrigger id="range-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workbook">Workbook</SelectItem>
                      {sheets.map((sheet) => (
                        <SelectItem key={sheet.id} value={sheet.id}>
                          {sheet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="range-comment">Comment (optional)</Label>
                  <Input
                    id="range-comment"
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Description"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
                <Button size="sm" onClick={editingId ? handleUpdate : handleCreate}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Named Range
            </Button>
          )}

          {/* Named Ranges List */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Named Ranges ({namedRanges.length})</h3>
            <ScrollArea className="h-[300px] border rounded-lg">
              {namedRanges.length > 0 ? (
                <div className="p-2 space-y-2">
                  {namedRanges.map((range) => {
                    const scopeSheet = sheets.find((s) => s.id === range.sheetId);
                    const scopeLabel = scopeSheet ? scopeSheet.name : 'Workbook';

                    return (
                      <div
                        key={range.id}
                        className="p-3 border rounded hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm">{range.name}</h4>
                              <span className="text-xs px-2 py-0.5 bg-muted rounded">
                                {scopeLabel}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground mt-1">
                              {range.range}
                            </p>
                            {range.comment && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {range.comment}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {onNavigateToRange && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onNavigateToRange(range)}
                                title="Navigate to range"
                              >
                                <BookmarkPlus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(range)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDelete(range.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No named ranges defined yet
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
