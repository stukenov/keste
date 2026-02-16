import { useEffect, useRef, useState } from 'react';
import { debounce } from '../utils/performance';

interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onSave: () => Promise<void>;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  enabled = true,
  interval = 30000, // 30 seconds default
  onSave,
  onError,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  // Debounced save function
  const debouncedSave = useRef(
    debounce(async () => {
      if (!enabled || !isDirtyRef.current) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave();
        setLastSaveTime(Date.now());
        isDirtyRef.current = false;
      } catch (error) {
        const err = error as Error;
        setSaveError(err);
        onError?.(err);
      } finally {
        setIsSaving(false);
      }
    }, 1000)
  ).current;

  // Mark as dirty (data has changed)
  const markDirty = () => {
    isDirtyRef.current = true;
  };

  // Force immediate save
  const forceSave = async () => {
    if (!enabled) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave();
      setLastSaveTime(Date.now());
      isDirtyRef.current = false;
    } catch (error) {
      const err = error as Error;
      setSaveError(err);
      onError?.(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
      return;
    }

    saveIntervalRef.current = setInterval(() => {
      if (isDirtyRef.current) {
        debouncedSave();
      }
    }, interval);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [enabled, interval, debouncedSave]);

  // Save before unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
        forceSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled]);

  return {
    isSaving,
    lastSaveTime,
    saveError,
    markDirty,
    forceSave,
  };
}
