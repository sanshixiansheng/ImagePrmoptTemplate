'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSidebar } from '@/components/profile/profile-sidebar';
import { ProfileSidebarMobile } from '@/components/profile/profile-sidebar-mobile';
import { ProfileContent } from '@/components/profile/profile-content';
import { authEventBus } from '@/lib/auth-event';

export function Profile() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState('settings');
  const [activeSection, setActiveSection] = useState('profile');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      // Not logged in, redirect to home with login trigger
      router.push('/?login=required');
      return;
    }

    setIsLoggedIn(true);
    setIsCheckingAuth(false);
  }, [session, status, router]);

  // Listen for login events
  useEffect(() => {
    const unsubscribe = authEventBus.subscribe((event) => {
      if (event.type === 'login-expired' || event.type === 'unauthorized') {
        router.push('/?login=required');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  // Loading state
  if (isCheckingAuth || !isLoggedIn) {
    return (
      <div className="container md:max-w-7xl py-8 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-8">
      {/* Secondary Tabs */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto bg-transparent border-none gap-6 p-0">
              <TabsTrigger
                value="activity"
                className="data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-violet-500 text-slate-300 hover:text-white rounded-none px-0 py-4 border-b-2 border-transparent transition-all"
              >
                {t('profile.tabs.activity')}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-violet-500 text-slate-300 hover:text-white rounded-none px-0 py-4 border-b-2 border-transparent transition-all"
              >
                {t('profile.tabs.settings')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'settings' ? (
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <ProfileSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            {/* Mobile Sidebar */}
            <ProfileSidebarMobile
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            {/* Content Panel */}
            <main className="flex-1 min-w-0">
              <ProfileContent activeSection={activeSection} />
            </main>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t('profile.tabs.activity')}
            </h3>
            <p className="text-sm text-slate-300 max-w-md">
              Activity feed will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
