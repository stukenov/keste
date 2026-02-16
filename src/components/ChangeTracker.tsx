import { useState } from 'react';
import { History, Check, X, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import type { Change, ChangeFilter, ChangeTrackingState } from '../core-ts/comment-types';

interface ChangeTrackerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackingState: ChangeTrackingState;
  sheets: Array<{ id: string; name: string }>;
  onToggleTracking: () => void;
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
  onAcceptAllChanges: () => void;
  onRejectAllChanges: () => void;
  onNavigateToChange: (change: Change) => void;
}

export function ChangeTracker({
  open,
  onOpenChange,
  trackingState,
  sheets,
  onToggleTracking,
  onAcceptChange,
  onRejectChange,
  onAcceptAllChanges,
  onRejectAllChanges,
  onNavigateToChange,
}: ChangeTrackerProps) {
  const [filter, setFilter] = useState<ChangeFilter>({
    status: 'pending',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter changes
  const filteredChanges = trackingState.changes.filter(change => {
    // Filter by status
    if (filter.status) {
      if (filter.status === 'pending' && (change.accepted || change.rejected)) return false;
      if (filter.status === 'accepted' && !change.accepted) return false;
      if (filter.status === 'rejected' && !change.rejected) return false;
    }

    // Filter by sheet
    if (filter.sheetId && change.sheetId !== filter.sheetId) return false;

    // Filter by author
    if (filter.author && !change.author.toLowerCase().includes(filter.author.toLowerCase())) {
      return false;
    }

    // Filter by type
    if (filter.type && filter.type.length > 0 && !filter.type.includes(change.type)) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = change.description.toLowerCase().includes(query);
      const matchesAuthor = change.author.toLowerCase().includes(query);
      if (!matchesDescription && !matchesAuthor) return false;
    }

    return true;
  });

  const getSheetName = (sheetId: string) => {
    return sheets.find(s => s.id === sheetId)?.name || 'Unknown';
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

  const getChangeTypeLabel = (type: Change['type']) => {
    const labels: Record<Change['type'], string> = {
      'cell-value': 'Cell Value',
      'cell-style': 'Cell Style',
      'insert-row': 'Insert Row',
      'delete-row': 'Delete Row',
      'insert-column': 'Insert Column',
      'delete-column': 'Delete Column',
      'other': 'Other',
    };
    return labels[type];
  };

  const getChangeTypeColor = (type: Change['type']) => {
    const colors: Record<Change['type'], string> = {
      'cell-value': 'bg-blue-500',
      'cell-style': 'bg-purple-500',
      'insert-row': 'bg-green-500',
      'delete-row': 'bg-red-500',
      'insert-column': 'bg-green-500',
      'delete-column': 'bg-red-500',
      'other': 'bg-gray-500',
    };
    return colors[type];
  };

  const pendingCount = trackingState.changes.filter(
    c => !c.accepted && !c.rejected
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Change Tracking
                {pendingCount > 0 && (
                  <Badge variant="secondary">{pendingCount} pending</Badge>
                )}
              </SheetTitle>
              <Button
                size="sm"
                variant={trackingState.enabled ? 'secondary' : 'ghost'}
                onClick={onToggleTracking}
              >
                {trackingState.enabled ? 'Disable' : 'Enable'} Tracking
              </Button>
            </div>
          </SheetHeader>

          {!trackingState.enabled ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="text-muted-foreground">
                <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-semibold mb-2">Change Tracking Disabled</p>
                <p className="text-sm">
                  Enable change tracking to monitor and review all modifications
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="p-4 space-y-3 border-b">
                <Input
                  placeholder="Search changes..."
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
                    <SelectTrigger className="w-[140px]">
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

                  <Select
                    value={filter.status || 'all'}
                    onValueChange={(value) =>
                      setFilter({
                        ...filter,
                        status: value === 'all' ? undefined : (value as any),
                      })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pendingCount > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={onAcceptAllChanges}
                      className="flex-1"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Accept All
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={onRejectAllChanges}
                      className="flex-1"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reject All
                    </Button>
                  </div>
                )}
              </div>

              {/* Change list */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {filteredChanges.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No changes found</p>
                    </div>
                  ) : (
                    filteredChanges
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map(change => (
                        <div
                          key={change.id}
                          className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${getChangeTypeColor(change.type)}`}
                              />
                              <span className="text-xs font-medium">
                                {getChangeTypeLabel(change.type)}
                              </span>
                              {change.accepted && (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-600"
                                >
                                  Accepted
                                </Badge>
                              )}
                              {change.rejected && (
                                <Badge
                                  variant="outline"
                                  className="text-red-600 border-red-600"
                                >
                                  Rejected
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(change.timestamp)}
                            </span>
                          </div>

                          <p className="text-sm mb-2">{change.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {change.author}
                              </div>
                              <div>{getSheetName(change.sheetId)}</div>
                            </div>

                            {!change.accepted && !change.rejected && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => onNavigateToChange(change)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-green-600 hover:text-green-700"
                                  onClick={() => onAcceptChange(change.id)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-red-600 hover:text-red-700"
                                  onClick={() => onRejectChange(change.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
