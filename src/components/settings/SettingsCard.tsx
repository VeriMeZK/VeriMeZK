import { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success' | 'info';
}

export function SettingsCard({
  title,
  description,
  children,
  variant = 'default',
}: SettingsCardProps) {
  const variants = {
    default: 'border-black/20 dark:border-white/20 bg-transparent',
    warning: 'border-black/30 dark:border-white/30 bg-black/5 dark:bg-white/5',
    danger: 'border-black/50 dark:border-white/50 bg-black/10 dark:bg-white/10',
    success: 'border-black/30 dark:border-white/30 bg-black/5 dark:bg-white/5',
    info: 'border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5',
  };

  return (
    <div className={`p-4 rounded-lg border ${variants[variant]}`}>
      <div className="mb-3">
        <h3 className="font-semibold text-black dark:text-white mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      </div>
      {children}
    </div>
  );
}
