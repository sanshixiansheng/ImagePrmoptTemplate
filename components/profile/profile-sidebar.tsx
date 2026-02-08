'use client';

import { cn } from '@/lib/utils';
import {
  User,
  CreditCard,
  Zap,
  Key,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ProfileSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const t = useTranslations('profile');

  const sidebarItems: SidebarItem[] = [
    { id: 'profile', label: t('sidebar.profile'), icon: User },
    { id: 'billing', label: t('sidebar.billing'), icon: CreditCard },
    { id: 'credits', label: t('sidebar.credits'), icon: Zap },
    { id: 'api-keys', label: t('sidebar.api_keys'), icon: Key },
  ];

  return (
    <aside className="w-56 shrink-0 hidden md:block">
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
