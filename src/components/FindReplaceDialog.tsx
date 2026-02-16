import { useState } from 'react';
import { Search, Replace, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { FindReplaceOptions, FindResult } from '../core-ts/data-management-types';

interface FindReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFind: (options: FindReplaceOptions) => FindResult[];
  onReplace: (findResult: FindResult, options: FindReplaceOptions) => void;
  onReplaceAll: (options: FindReplaceOptions) => void;
  onNavigateToResult: (result: FindResult) => void;
}

export function FindReplaceDialog({
  open,
  onOpenChange,
  onFind,
  onReplace,
  onReplaceAll,
  onNavigateToResult,
}: FindReplaceDialogProps) {
  const [mode, setMode] = useState<'find' | 'replace'>('find');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [searchFormulas, setSearchFormulas] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [results, setResults] = useState<FindResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const options: FindReplaceOptions = {
    findText,
    replaceText,
    matchCase,
    matchWholeWord,
    searchFormulas,
    useRegex,
  };

  const handleFind = () => {
    const foundResults = onFind(options);
    setResults(foundResults);
    setCurrentResultIndex(0);

    if (foundResults.length > 0) {
      onNavigateToResult(foundResults[0]);
    }
  };

  const handleNext = () => {
    if (results.length === 0) {
      handleFind();
      return;
    }

    const nextIndex = (currentResultIndex + 1) % results.length;
    setCurrentResultIndex(nextIndex);
    onNavigateToResult(results[nextIndex]);
  };

  const handlePrevious = () => {
    if (results.length === 0) {
      handleFind();
      return;
    }

    const prevIndex = currentResultIndex === 0 ? results.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    onNavigateToResult(results[prevIndex]);
  };

  const handleReplace = () => {
    if (results.length === 0) return;

    const currentResult = results[currentResultIndex];
    onReplace(currentResult, options);

    // Re-find after replace
    handleFind();
  };

  const handleReplaceAll = () => {
    onReplaceAll(options);
    handleFind();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const columnLabel = (col: number) => String.fromCharCode(64 + col);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find & Replace
          </DialogTitle>
          <DialogDescription>
            Search and replace text in your spreadsheet
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="find">Find</TabsTrigger>
            <TabsTrigger value="replace">Replace</TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Find</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search text..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button onClick={handleFind} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            {results.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {currentResultIndex + 1} of {results.length} results
                </span>
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={results.length === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={results.length === 0}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Current result */}
            {results.length > 0 && results[currentResultIndex] && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <div className="font-medium mb-1">Current match:</div>
                <div className="text-muted-foreground">
                  Cell {columnLabel(results[currentResultIndex].col)}{results[currentResultIndex].row}:{' '}
                  {results[currentResultIndex].value}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="matchCase"
                  checked={matchCase}
                  onCheckedChange={(checked) => setMatchCase(checked as boolean)}
                />
                <label
                  htmlFor="matchCase"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Match case
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="matchWholeWord"
                  checked={matchWholeWord}
                  onCheckedChange={(checked) => setMatchWholeWord(checked as boolean)}
                />
                <label
                  htmlFor="matchWholeWord"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Match whole word
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="searchFormulas"
                  checked={searchFormulas}
                  onCheckedChange={(checked) => setSearchFormulas(checked as boolean)}
                />
                <label
                  htmlFor="searchFormulas"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Search in formulas
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useRegex"
                  checked={useRegex}
                  onCheckedChange={(checked) => setUseRegex(checked as boolean)}
                />
                <label
                  htmlFor="useRegex"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Use regular expressions
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="replace" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Find</label>
              <Input
                placeholder="Search text..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Replace with</label>
              <Input
                placeholder="Replacement text..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Navigation */}
            {results.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {currentResultIndex + 1} of {results.length} results
                </span>
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={results.length === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={results.length === 0}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Replace buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReplace}
                disabled={results.length === 0}
                className="flex-1"
              >
                <Replace className="mr-2 h-4 w-4" />
                Replace
              </Button>
              <Button
                variant="outline"
                onClick={handleReplaceAll}
                disabled={!findText}
                className="flex-1"
              >
                <Replace className="mr-2 h-4 w-4" />
                Replace All
              </Button>
            </div>

            {/* Options */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="matchCase2"
                  checked={matchCase}
                  onCheckedChange={(checked) => setMatchCase(checked as boolean)}
                />
                <label
                  htmlFor="matchCase2"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Match case
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="matchWholeWord2"
                  checked={matchWholeWord}
                  onCheckedChange={(checked) => setMatchWholeWord(checked as boolean)}
                />
                <label
                  htmlFor="matchWholeWord2"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Match whole word
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="searchFormulas2"
                  checked={searchFormulas}
                  onCheckedChange={(checked) => setSearchFormulas(checked as boolean)}
                />
                <label
                  htmlFor="searchFormulas2"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Search in formulas
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useRegex2"
                  checked={useRegex}
                  onCheckedChange={(checked) => setUseRegex(checked as boolean)}
                />
                <label
                  htmlFor="useRegex2"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Use regular expressions
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button onClick={handleFind}>
            <Search className="mr-2 h-4 w-4" />
            Find All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
