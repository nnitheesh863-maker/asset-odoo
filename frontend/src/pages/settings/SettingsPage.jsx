import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  Bell,
  Moon,
  Sun,
  Shield,
  Info,
  Save,
  Mail,
  Smartphone,
  Monitor,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
];

function ToggleSwitch({ enabled, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    appName: 'AssetFlow',
    emailNotifications: true,
    pushNotifications: true,
    language: 'en',
    twoFactorAuth: false,
  });
  const [sessions] = useState([
    { id: 1, device: 'Chrome on Windows', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'Safari on iPhone', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Firefox on MacOS', lastActive: '3 days ago', current: false },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
      } catch {
        // use defaults
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Settings" subtitle="Configure your application preferences" icon={Settings}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary flex items-center gap-2">
          {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </PageHeader>

      <div className="max-w-3xl space-y-6">
        {/* General Settings */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-400" />
            General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Application Name</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => updateSetting('appName', e.target.value)}
                className="input max-w-md"
              />
            </div>
            <div>
              <label className="label">Language</label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="input max-w-md"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-400" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Receive email updates about your assets</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={settings.emailNotifications}
                onChange={(val) => updateSetting('emailNotifications', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                  <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Receive push notifications in browser</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={settings.pushNotifications}
                onChange={(val) => updateSetting('pushNotifications', val)}
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-gray-400" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                  {darkMode ? (
                    <Moon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                  </p>
                </div>
              </div>
              <ToggleSwitch enabled={darkMode} onChange={toggleTheme} />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" />
            Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={settings.twoFactorAuth}
                onChange={(val) => updateSetting('twoFactorAuth', val)}
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Active Sessions</h4>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gray-200 dark:bg-gray-700 p-2">
                        <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.device}
                          {session.current && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" /> Current
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last active: {session.lastActive}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1">
                        <LogOut className="h-3 w-3" />
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-400" />
            About
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Application Name</span>
              <span className="font-medium text-gray-900 dark:text-white">{settings.appName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Version</span>
              <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Build</span>
              <span className="font-medium text-gray-900 dark:text-white">2026.07.1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Framework</span>
              <span className="font-medium text-gray-900 dark:text-white">React 18 + Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
