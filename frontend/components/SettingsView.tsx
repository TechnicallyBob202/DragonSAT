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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your preferences and account</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Appearance */}
        <SettingSection title="Appearance">
          <SelectSetting
            label="Theme"
            description="App color theme"
            value={theme}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            onChange={(v) => setTheme(v as Theme)}
          />
          <SelectSetting
            label="Font Size"
            description="Scale text size across the app"
            value={fontSize}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
            onChange={(v) => setFontSize(v as FontSize)}
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
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">User ID</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">{userId || 'Not set'}</p>
              </div>
            </div>

            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download your sessions as JSON</p>
              </div>
              <span className="text-gray-500 dark:text-gray-400">↓</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Log Out</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sign out of your account</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Clear All Data?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete all your session history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-900 dark:text-white">
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

interface SelectSettingProps {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectSetting({ label, description, value, options, onChange }: SelectSettingProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleSetting({ label, description, value, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
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
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>}
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-sm text-green-700 dark:text-green-300">Password changed successfully.</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
  const style =
    variant === 'danger'
      ? 'bg-red-50 border-red-200'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  const titleStyle =
    variant === 'danger' ? 'text-red-900' : 'text-gray-900 dark:text-white';
  return (
    <div className={`${style} border rounded-lg p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${titleStyle}`}>{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
