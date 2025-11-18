export function InfoTip() {
  return (
    <div
      className="p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20"
      role="note"
    >
      <p className="text-sm text-black dark:text-white">
        <strong>💡 Tip:</strong> Export your data before clearing to create a backup that you can
        restore later.
      </p>
    </div>
  );
}
