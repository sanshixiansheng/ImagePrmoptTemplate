'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAppContext } from '@/contexts/app';

interface UserProfile {
  email: string;
  name: string;
  avatar_url: string | null;
}

export function ProfilePanel() {
  const t = useTranslations('profile');
  const { data: session } = useSession();
  const { user: contextUser } = useAppContext();

  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    name: '',
    avatar_url: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/profile');
        const data = await response.json();

        if (data.code === 1000 && data.data) {
          setProfile({
            email: data.data.email || session?.user?.email || '',
            name: data.data.name || contextUser?.name || '',
            avatar_url: data.data.avatar_url || null,
          });
        } else {
          // Use session data as fallback
          setProfile({
            email: session?.user?.email || '',
            name: contextUser?.name || session?.user?.name || '',
            avatar_url: null,
          });
        }
      } catch (error) {
        console.error('[ProfilePanel] Failed to fetch profile:', error);
        // Use session data as fallback
        setProfile({
          email: session?.user?.email || '',
          name: contextUser?.name || session?.user?.name || '',
          avatar_url: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, contextUser]);

  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error(t('errors.name_required'));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name.trim(),
          avatar_url: profile.avatar_url,
        }),
      });

      const data = await response.json();

      if (data.code === 1000) {
        toast.success(t('save_success'));
        // Refresh session to update user info
        window.location.reload();
      } else {
        toast.error(data.message || t('save_failed'));
      }
    } catch (error) {
      console.error('[ProfilePanel] Failed to save profile:', error);
      toast.error(t('save_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('errors.invalid_image'));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('errors.image_too_large'));
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.code === 1000 && data.data?.avatar_url) {
        setProfile({ ...profile, avatar_url: data.data.avatar_url });
        toast.success(t('avatar_upload_success'));
      } else {
        toast.error(data.message || t('avatar_upload_failed'));
      }
    } catch (error) {
      console.error('[ProfilePanel] Failed to upload avatar:', error);
      toast.error(t('avatar_upload_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-200">
          {t('email_label')}
        </Label>
        <Input
          id="email"
          type="email"
          value={profile.email}
          disabled
          className="bg-slate-800 border-slate-700 text-slate-300 cursor-not-allowed"
        />
        <p className="text-xs text-slate-400">{t('email_readonly_hint')}</p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-200">
          {t('name_label')}
        </Label>
        <Input
          id="name"
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          disabled={isLoading || isSaving}
          className="bg-slate-800 border-slate-700 text-white focus:border-violet-500 focus:ring-violet-500"
          placeholder={t('name_placeholder')}
        />
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <Label className="text-slate-200">{t('avatar_label')}</Label>
        <div className="flex items-center gap-4">
          {/* Avatar Preview */}
          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-slate-400">
                {(profile.name || profile.email || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isLoading || isSaving}
              className="hidden"
            />
            <Label
              htmlFor="avatar-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('uploading')}
                </>
              ) : (
                t('change_avatar')
              )}
            </Label>
            <p className="text-xs text-slate-400 mt-1">{t('avatar_hint')}</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <Button
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="bg-violet-500 hover:bg-violet-600 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('save_changes')
          )}
        </Button>
      </div>
    </div>
  );
}
