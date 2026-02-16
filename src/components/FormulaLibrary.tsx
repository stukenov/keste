import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Code2 } from 'lucide-react';
import { FORMULA_FUNCTIONS, searchFunctions, type FormulaFunction } from '../core-ts/formula-types';

interface FormulaLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertFormula?: (formula: string) => void;
}

export function FormulaLibrary({ open, onOpenChange, onInsertFormula }: FormulaLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<FormulaFunction | null>(null);

  const filteredFunctions = searchQuery
    ? searchFunctions(searchQuery)
    : [];

  const handleInsert = (fn: FormulaFunction) => {
    onInsertFormula?.(`=${fn.name}()`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Formula Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search functions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchQuery ? (
            // Search Results
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredFunctions.length > 0 ? (
                  filteredFunctions.map((fn) => (
                    <div
                      key={fn.name}
                      className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedFunction(fn)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{fn.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{fn.description}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsert(fn);
                          }}
                          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          Insert
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No functions found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            // Category Tabs
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="date">Date</TabsTrigger>
                <TabsTrigger value="lookup">Lookup</TabsTrigger>
                <TabsTrigger value="statistical">Stats</TabsTrigger>
                <TabsTrigger value="logical">Logical</TabsTrigger>
                <TabsTrigger value="math">Math</TabsTrigger>
              </TabsList>

              {Object.entries(FORMULA_FUNCTIONS).map(([category, functions]) => (
                <TabsContent key={category} value={category}>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
                      {functions.map((fn) => (
                        <div
                          key={fn.name}
                          className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => setSelectedFunction(fn)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{fn.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {fn.description}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInsert(fn);
                              }}
                              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                            >
                              Insert
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Function Details */}
          {selectedFunction && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">{selectedFunction.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{selectedFunction.description}</p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-semibold">Syntax:</span>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono">
                    {selectedFunction.syntax}
                  </code>
                </div>
                <div>
                  <span className="text-xs font-semibold">Example:</span>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono">
                    {selectedFunction.example}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
