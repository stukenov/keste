import { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, Loader2, Plus, Clock, FolderOpen } from 'lucide-react';
import { readXlsxToModel } from '../core-ts/read_xlsx';
import { readKstToModel } from '../core-ts/read_kst';
import type { WorkbookModel } from '../core-ts/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface DropzoneProps {
  onFileLoad: (workbook: WorkbookModel) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface RecentFile {
  name: string;
  path: string;
  lastOpened: number;
  type: 'xlsx' | 'kst';
}

function Dropzone({ onFileLoad, onError, loading, setLoading }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // Load recent files from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('keste_recent_files');
    if (stored) {
      try {
        const files = JSON.parse(stored) as RecentFile[];
        setRecentFiles(files.slice(0, 5)); // Show max 5 recent files
      } catch (e) {
        console.error('Failed to load recent files:', e);
      }
    }
  }, []);

  // Save recent file to localStorage
  const addToRecentFiles = useCallback((file: File, filePath?: string) => {
    const recentFile: RecentFile = {
      name: file.name,
      path: filePath || file.name,
      lastOpened: Date.now(),
      type: file.name.endsWith('.kst') ? 'kst' : 'xlsx',
    };

    const stored = localStorage.getItem('keste_recent_files');
    let files: RecentFile[] = stored ? JSON.parse(stored) : [];
    
    // Remove duplicate if exists
    files = files.filter(f => f.path !== recentFile.path);
    
    // Add new file at the beginning
    files.unshift(recentFile);
    
    // Keep only last 10 files
    files = files.slice(0, 10);
    
    localStorage.setItem('keste_recent_files', JSON.stringify(files));
    setRecentFiles(files.slice(0, 5));
  }, []);

  const handleFile = useCallback(
    async (file: File, filePath?: string) => {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.kst')) {
        onError('Please select an .xlsx or .kst file');
        return;
      }

      setLoading(true);
      try {
        let workbook: WorkbookModel;

        if (file.name.endsWith('.kst')) {
          // Read .kst file (SQLite format) via Tauri
          if (!filePath) {
            onError('File path is required for .kst files');
            return;
          }
          workbook = await readKstToModel(filePath);
        } else {
          // Read .xlsx file (Excel format)
          const buffer = await file.arrayBuffer();
          workbook = await readXlsxToModel(buffer);
        }

        addToRecentFiles(file, filePath);
        onFileLoad(workbook);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to parse file');
      } finally {
        setLoading(false);
      }
    },
    [onFileLoad, onError, setLoading, addToRecentFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // For file input, we need to get the full path - but web doesn't have it
        // Use file.name as fallback, or webkitRelativePath if available
        const path = (file as any).path || file.name;
        handleFile(file, path);
      }
    },
    [handleFile]
  );

  const handleOpenFile = useCallback(async () => {
    try {
      // Use Tauri file dialog
      const { invoke } = await import('@tauri-apps/api/tauri');
      const filePath = await invoke<string>('choose_open_file');
      
      // Fetch file from path
      const response = await fetch(`file://${filePath}`);
      const blob = await response.blob();
      const fileName = filePath.split(/[/\\]/).pop() || 'file';
      const file = new File([blob], fileName);
      
      handleFile(file, filePath);
    } catch (err) {
      if (err !== 'No file selected') {
        onError(err instanceof Error ? err.message : 'Failed to open file');
      }
    }
  }, [handleFile, onError]);

  const handleRecentFileClick = useCallback(
    async (file: RecentFile) => {
      if (!file.path) {
        onError('File path is unavailable. Please locate the file manually.');
        return;
      }

      try {
        if (file.type === 'kst') {
          const placeholderFile = new File([], file.name);
          await handleFile(placeholderFile, file.path);
        } else {
          const response = await fetch(`file://${file.path}`);
          if (!response.ok) {
            throw new Error('Failed to access the recent file');
          }
          const blob = await response.blob();
          const recentFile = new File([blob], file.name);
          await handleFile(recentFile, file.path);
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to open recent file');
      }
    },
    [handleFile, onError]
  );

  const handleNewSpreadsheet = useCallback(() => {
    // Create empty workbook
    const emptyWorkbook: WorkbookModel = {
      id: crypto.randomUUID(),
      sheets: [{
        id: 'sheet1',
        name: 'Sheet1',
        sheetId: 1,
        cells: new Map(),
        mergedRanges: [],
        rowProps: new Map(),
        colProps: new Map(),
      }],
      sharedStrings: [],
      numFmts: new Map(),
      styles: [],
      definedNames: [],
    };
    onFileLoad(emptyWorkbook);
  }, [onFileLoad]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-xl shadow-lg">
              <FileSpreadsheet className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Keste
          </h1>
          <p className="text-lg text-slate-600 mb-1">
            Modern Spreadsheet Editor
          </p>
          <p className="text-xs text-slate-500">
            Powered by SQLite • Work offline • Your data, your control
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg cursor-pointer group"
                  onClick={handleNewSpreadsheet}>
              <CardContent className="p-5 text-center">
                <motion.div
                  className="bg-gradient-to-br from-emerald-400/20 to-teal-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-emerald-400/30 group-hover:to-teal-500/30 transition-all"
                  whileHover={{ rotate: 5 }}
                >
                  <Plus className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="font-semibold text-base mb-1">New Spreadsheet</h3>
                <p className="text-xs text-muted-foreground">
                  Start with a blank workbook
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <Card className={`border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-105 shadow-xl'
              : 'border-slate-300 hover:border-primary/50'
          }`}>
            <CardContent
              className="p-5"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-xs font-medium text-slate-900">Processing...</p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-slate-400" />
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-0.5">Import File</p>
                    <p className="text-xs text-muted-foreground mb-2">or drag & drop</p>
                  </div>
                  <label htmlFor="file-input">
                    <Button variant="outline" size="sm" className="cursor-pointer text-xs h-8" asChild>
                      <span>
                        <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.kst"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <p className="text-xs text-slate-500">
                    .xlsx or .kst files
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Files */}
        {recentFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <h3 className="font-semibold text-xs">Последние файлы</h3>
                </div>
                <div className="space-y-0.5">
                  {recentFiles.slice(0, 3).map((file, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      onClick={() => handleRecentFileClick(file)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/50 transition-colors text-left group"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {new Date(file.lastOpened).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                        file.type === 'kst' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {file.type.toUpperCase()}
                      </div>
                    </motion.button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenFile}
                  className="w-full mt-2 text-[11px] h-7"
                >
                  <FolderOpen className="w-3 h-3 mr-1" />
                  Открыть другой файл
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Dropzone;
