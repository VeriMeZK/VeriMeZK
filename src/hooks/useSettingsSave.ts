import { useState, useCallback } from 'react';

export function useSettingsSave() {
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(async (callback?: () => void | Promise<void>) => {
    setIsSaving(true);
    try {
      // Simulate save delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

      if (callback) {
        await callback();
      }
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    isSaving,
    save,
  };
}
