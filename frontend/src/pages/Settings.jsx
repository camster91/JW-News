import { Trash2, Download, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import useProgressStore from '../stores/progressStore';

function Settings() {
  const { clearAll } = useProgressStore();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all progress data? This cannot be undone.')) {
      clearAll();
      alert('All data has been cleared successfully.');
    }
  };

  const handleExportData = () => {
    const data = localStorage.getItem('jw-progress-storage');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jw-progress-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('No data to export.');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-content p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm opacity-90 mt-1">Customize your experience</p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-4 max-w-2xl">
        {/* Appearance */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Appearance</h2>

            <div className="divider my-2"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-base-content/70">
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Data Management</h2>

            <div className="divider my-2"></div>

            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="btn btn-outline w-full justify-start"
              >
                <Download className="w-5 h-5" />
                Export Progress Data
              </button>

              <div className="alert alert-warning">
                <span className="text-sm">
                  All your progress is stored locally on this device. Export regularly to backup your data.
                </span>
              </div>

              <button
                onClick={handleClearData}
                className="btn btn-error btn-outline w-full justify-start"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">About</h2>

            <div className="divider my-2"></div>

            <div className="space-y-2 text-sm">
              <p><strong>Version:</strong> 1.0.0 (Prototype)</p>
              <p><strong>Build:</strong> PWA (Progressive Web App)</p>
              <p className="text-base-content/70">
                This app helps you track your daily spiritual routine including
                daily text, Bible reading, and meeting preparation.
              </p>

              <div className="alert alert-info mt-4">
                <span className="text-sm">
                  💡 <strong>Tip:</strong> Install this app to your home screen for quick access!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <p className="text-xs text-base-content/60 text-center">
              This is an unofficial app and is not affiliated with or endorsed by
              Jehovah's Witnesses or the Watchtower Bible and Tract Society.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
