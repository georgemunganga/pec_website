import { useState, useEffect } from 'react';
import { AccountLayout } from '@/components/AccountLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userAPI, profileAPI } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Upload, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/queryKeys';

interface ProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  loyaltyPoints?: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        const payload = response?.data || response;
        setProfile(payload);
        setFormData(prev => ({
          ...prev,
          name: payload?.name || '',
          email: payload?.email || '',
          phone: payload?.phone || '',
        }));
        if (payload?.avatarUrl) {
          setAvatarPreview(payload.avatarUrl);
        }
      } catch (error) {
        toast.error('Unable to load profile information');
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await userAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword) {
      toast.error('Enter your current and new password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      await profileAPI.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('Password updated successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const uploaded = await profileAPI.uploadAvatar(file);
      const url = uploaded?.url || uploaded?.avatarUrl || URL.createObjectURL(file);
      setAvatarPreview(url);
      toast.success('Avatar updated');
    } catch (error) {
      toast.error('Could not upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your personal information and security</p>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border space-y-8">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              {isUploadingAvatar && <p className="text-sm text-muted-foreground">Uploading avatar...</p>}
              {profile?.loyaltyPoints !== undefined && (
                <div className="rounded-2xl bg-secondary/30 px-4 py-3">
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  <p className="text-2xl font-semibold text-foreground">{profile.loyaltyPoints}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="submit" className="rounded-full" disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="rounded-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="rounded-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="rounded-full"
                  required
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="rounded-full" disabled={isSavingPassword}>
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
  const queryClient = useQueryClient();
