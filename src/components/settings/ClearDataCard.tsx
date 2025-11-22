interface ClearDataCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  variant?: 'warning' | 'danger';
}

export function ClearDataCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  variant = 'warning',
}: ClearDataCardProps) {
  const variants = {
    warning: {
      border: 'border-black/30 dark:border-white/30',
      bg: 'bg-black/5 dark:bg-white/5',
      text: 'text-black dark:text-white',
      button:
        'text-black dark:text-white border-2 border-black/30 dark:border-white/30 hover:bg-black/10 dark:hover:bg-white/10',
    },
    danger: {
      border: 'border-black/50 dark:border-white/50',
      bg: 'bg-black/10 dark:bg-white/10',
      text: 'text-black dark:text-white',
      button: 'text-white dark:text-black bg-black dark:bg-white hover:opacity-80',
    },
  };

  const style = variants[variant];

  return (
    <div className={`p-4 rounded-lg border ${style.border} ${style.bg}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`text-xl ${style.text} mt-0.5`} aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-black dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all ${style.button}`}
      >
        {buttonText}
      </button>
    </div>
  );
}
