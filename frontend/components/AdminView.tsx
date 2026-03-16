'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, deleteUser, resetUserPassword, updateUserRole } from '../utils/api';
const currentVersion = process.env.APP_VERSION || '1.0.0';

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: string;
  created_at: string;
  google_linked: number;
  has_password: number;
}

export function AdminView() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Reset password modal state
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const fetchUsers = useCallback(async () => {
    try {
      setError('');
      const data = await getUsers();
      if (data.success) {
        setUsers(data.users);
      }
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const data = await deleteUser(deleteTarget.id);
      if (data.success) {
        setActionMsg(`Deleted user "${deleteTarget.name}"`);
        setDeleteTarget(null);
        fetchUsers();
      }
    } catch {
      setError('Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || newPassword.length < 6) return;
    setResetLoading(true);
    try {
      const data = await resetUserPassword(resetTarget.id, newPassword);
      if (data.success) {
        setActionMsg(`Password reset for "${resetTarget.name}"`);
        setResetTarget(null);
        setNewPassword('');
      }
    } catch {
      setError('Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const data = await updateUserRole(user.id, newRole);
      if (data.success) {
        setActionMsg(`${user.name} is now ${newRole}`);
        fetchUsers();
      }
    } catch {
      setError('Failed to update role');
    }
  };

  const authMethod = (user: AdminUser) => {
    const methods: string[] = [];
    if (user.has_password) methods.push('Password');
    if (user.google_linked) methods.push('Google');
    return methods.join(' + ') || 'None';
  };

  // Clear action message after 3 seconds
  useEffect(() => {
    if (!actionMsg) return;
    const t = setTimeout(() => setActionMsg(''), 3000);
    return () => clearTimeout(t);
  }, [actionMsg]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Admin Console</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Manage users, roles, and credentials.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {actionMsg && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm">
          {actionMsg}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-left">
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Name</th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Username</th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Email</th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Auth</th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Role</th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Created</th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      {user.name}
                      {isSelf && <span className="ml-1 text-xs text-gray-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.username}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{authMethod(user)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        user.role === 'admin'
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {!isSelf && (
                          <button
                            onClick={() => handleToggleRole(user)}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                            title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                          >
                            {user.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                        )}
                        {user.has_password ? (
                          <button
                            onClick={() => { setResetTarget(user); setNewPassword(''); }}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            Reset PW
                          </button>
                        ) : null}
                        {!isSelf && (
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
          {users.length} user{users.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete User</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Permanently delete <strong>{deleteTarget.name}</strong> ({deleteTarget.username}) and all their session data? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary px-4 py-2 text-sm font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sponsor + Version Footer */}
      <VersionFooter />

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reset Password</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Set a new password for <strong>{resetTarget.name}</strong>.
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setResetTarget(null); setNewPassword(''); }}
                className="btn-secondary px-4 py-2 text-sm font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetLoading || newPassword.length < 6}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VersionFooter() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [checkError, setCheckError] = useState(false);

  useEffect(() => {
    fetch('https://api.github.com/repos/TechnicallyBob202/DragonSAT/tags?per_page=1')
      .then((res) => res.json())
      .then((tags) => {
        if (Array.isArray(tags) && tags.length > 0) {
          setLatestVersion(tags[0].name.replace(/^v/, ''));
        }
      })
      .catch(() => setCheckError(true));
  }, []);

  const isUpToDate = latestVersion && latestVersion === currentVersion;
  const updateAvailable = latestVersion && latestVersion !== currentVersion;

  return (
    <div className="mt-8 text-center space-y-2">
      <a
        href="https://github.com/sponsors/TechnicallyBob202"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
      >
        <span>💖</span>
        <span>Support DragonSAT</span>
      </a>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        <span>DragonSAT v{currentVersion}</span>
        {isUpToDate && (
          <span className="ml-2 text-green-500 dark:text-green-400">● Up to date</span>
        )}
        {updateAvailable && (
          <a
            href="https://github.com/TechnicallyBob202/DragonSAT/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-amber-500 dark:text-amber-400 hover:underline"
          >
            ● Update available (v{latestVersion})
          </a>
        )}
        {checkError && (
          <span className="ml-2 text-gray-400 dark:text-gray-600">● Could not check for updates</span>
        )}
      </div>
    </div>
  );
}
