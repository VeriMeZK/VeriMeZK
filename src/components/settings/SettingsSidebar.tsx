import type { SettingsSection } from '@/hooks/useSettingsNavigation';
import type { SectionConfig } from '@/constants/settings';

interface SettingsSidebarProps {
  sections: SectionConfig[];
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

export function SettingsSidebar({
  sections,
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <nav className="space-y-1" role="navigation" aria-label="Settings navigation">
      {sections.map(section => {
        const IconComponent = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              isActive
                ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-md'
                : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <IconComponent className="text-xl" aria-hidden="true" />
            <span>{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
