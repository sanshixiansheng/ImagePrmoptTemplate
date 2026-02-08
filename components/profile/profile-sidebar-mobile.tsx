'use client';

import { cn } from '@/lib/utils';
import {
  User,
  CreditCard,
  Zap,
  Key,
  ChevronDown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ProfileSidebarMobile({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const t = useTranslations('profile');
  const [isOpen, setIsOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { id: 'profile', label: t('sidebar.profile'), icon: User },
    { id: 'billing', label: t('sidebar.billing'), icon: CreditCard },
    { id: 'credits', label: t('sidebar.credits'), icon: Zap },
    { id: 'api-keys', label: t('sidebar.api_keys'), icon: Key },
  ];

  const activeItem = sidebarItems.find((item) => item.id === activeSection) || sidebarItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg text-foreground"
      >
        <div className="flex items-center gap-3">
          <ActiveIcon className="h-5 w-5 text-primary" />
          <span className="font-medium">{activeItem.label}</span>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setIsOpen(false);
                }}
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
        </div>
      )}
    </div>
  );
}
