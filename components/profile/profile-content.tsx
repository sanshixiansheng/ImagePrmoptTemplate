'use client';

import { ProfilePanel } from './profile-panel';
import { BillingPanel } from './billing-panel';
import { CreditsPanel } from './credits-panel';
import { ApiKeysPanel } from './api-keys-panel';

export function ProfileContent({
  activeSection,
}: {
  activeSection: string;
}) {
  switch (activeSection) {
    case 'profile':
      return <ProfilePanel />;
    case 'billing':
      return <BillingPanel />;
    case 'credits':
      return <CreditsPanel />;
    case 'api-keys':
      return <ApiKeysPanel />;
    default:
      return <ProfilePanel />;
  }
}
