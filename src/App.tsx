import { useState } from 'react';
import Dropzone from './components/Dropzone';
import WorkbookViewer from './components/WorkbookViewer';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';
import type { WorkbookModel } from './core-ts/types';

function App() {
  const [workbook, setWorkbook] = useState<WorkbookModel | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileLoad = (wb: WorkbookModel) => {
    setWorkbook(wb);
    toast({
      title: "Success!",
      description: `Loaded ${wb.sheets.length} sheet(s) with ${wb.sheets.reduce((sum, s) => sum + s.cells.size, 0)} cells`,
    });
  };

  const handleError = (err: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: err,
    });
    setLoading(false);
  };

  const handleReset = () => {
    setWorkbook(null);
  };

  return (
    <>
      <div className="w-screen h-screen overflow-hidden">
        {!workbook ? (
          <Dropzone
            onFileLoad={handleFileLoad}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <WorkbookViewer workbook={workbook} onClose={handleReset} />
        )}
      </div>
      <Toaster />
    </>
  );
}

export default App;
