'use client';

import React, { useState } from 'react';
import { useProgressStore } from '../hooks/useProgressStore';
import { useSettingsStore, type Theme, type FontSize } from '../hooks/useSettingsStore';
import { changePassword } from '../utils/api';

export function SettingsView() {
  const { userId, reset } = useProgressStore();
  const { theme, fontSize, showTimer, soundEffects, setTheme, setFontSize, setShowTimer, setSoundEffects } = useSettingsStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will clear all your session history.')) {
      reset();
      localStorage.removeItem('userId');
      setShowConfirm(false);
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = { userId, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hapasat-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    reset();
    window.location.reload();
  };

  const cycleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const cycleFontSize = () => {
    const sizes: FontSize[] = ['small', 'medium', 'large'];
    setFontSize(sizes[(sizes.indexOf(fontSize) + 1) % sizes.length]);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-2">Manage your preferences and account</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Appearance */}
        <SettingSection title="Appearance">
          <CycleSetting
            label="Theme"
            description="App color theme"
            value={theme === 'light' ? 'Light' : 'Dark'}
            note={theme === 'dark' ? 'Full dark mode coming soon' : undefined}
            onClick={cycleTheme}
          />
          <CycleSetting
            label="Font Size"
            description="Scale text size across the app"
            value={fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
            onClick={cycleFontSize}
          />
        </SettingSection>

        {/* Test Preferences */}
        <SettingSection title="Test Preferences">
          <ToggleSetting
            label="Show Timer"
            description="Display countdown timer during quizzes and tests"
            value={showTimer}
            onChange={setShowTimer}
          />
          <ToggleSetting
            label="Sound Effects"
            description="Play audio cues for timer warnings and expiry"
            value={soundEffects}
            onChange={setSoundEffects}
          />
        </SettingSection>

        {/* Account */}
        <SettingSection title="Account">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">User ID</p>
                <p className="text-sm text-gray-600 mt-1 break-all">{userId || 'Not set'}</p>
              </div>
            </div>

            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-600">Download your sessions as JSON</p>
              </div>
              <span>↓</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-gray-900">Log Out</p>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection title="Security">
          <ChangePasswordForm />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Danger Zone" variant="danger">
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium text-red-900">Clear All Data</p>
              <p className="text-sm text-red-700">Permanently delete all session history</p>
            </div>
            <span className="text-red-600">⚠️</span>
          </button>
        </SettingSection>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Data?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete all your session history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-900">
                Cancel
              </button>
              <button onClick={handleClearData} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Interactive controls ─────────────────────────────────────────────────────

interface ToggleSettingProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleSetting({ label, description, value, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

interface CycleSettingProps {
  label: string;
  description?: string;
  value: string;
  note?: string;
  onClick: () => void;
}

function CycleSetting({ label, description, value, note, onClick }: CycleSettingProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
        {note && <p className="text-xs text-amber-600 mt-0.5">{note}</p>}
      </div>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      >
        {value}
        <span className="text-gray-400 text-xs">▾</span>
      </button>
    </div>
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">Password changed successfully.</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors">
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}

function SettingSection({ title, children, variant = 'default' }: SettingSectionProps) {
  const bgColor = variant === 'danger' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200';
  return (
    <div className={`${bgColor} border rounded-lg p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${variant === 'danger' ? 'text-red-900' : 'text-gray-900'}`}>{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
