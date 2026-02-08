'use client';

import { useTranslations } from 'next-intl';
import { Key } from 'lucide-react';

export function ApiKeysPanel() {
  const t = useTranslations('profile.api_keys');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Key className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{t('coming_soon_title')}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{t('coming_soon_description')}</p>
    </div>
  );
}
