'use client';

import { useTranslations } from 'next-intl';
import { CreditCard } from 'lucide-react';

export function BillingPanel() {
  const t = useTranslations('profile.billing');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <CreditCard className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{t('coming_soon_title')}</h3>
      <p className="text-sm text-slate-300 max-w-md">{t('coming_soon_description')}</p>
    </div>
  );
}
