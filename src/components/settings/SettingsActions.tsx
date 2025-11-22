import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/shared/Button';

interface SettingsActionsProps {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function SettingsActions({ hasChanges, isSaving, onSave, onCancel }: SettingsActionsProps) {
  if (!hasChanges) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 flex justify-end gap-3"
      >
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave} isLoading={isSaving}>
          Save Changes
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
