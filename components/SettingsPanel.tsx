import React, { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6">Settings</h2>

        {/* API Key Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-6">
          <h3 className="text-lg font-medium text-stone-800 mb-2">Gemini API Key</h3>
          <p className="text-sm text-stone-500 mb-4">
            Your key is stored locally in your browser. It is never sent to any server other than Google's API.
          </p>
          <input
            type="password"
            value={localSettings.apiKey}
            onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
            placeholder="Enter your Gemini API Key"
            className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-stone-400 focus:outline-none"
          />
          {!localSettings.apiKey && (
            <div className="flex items-center gap-2 mt-2 text-amber-600 text-xs">
              <AlertTriangle size={12} />
              <span>Required for the diary to function.</span>
            </div>
          )}
        </div>

        {/* System Prompt Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-6">
          <h3 className="text-lg font-medium text-stone-800 mb-2">Stoic Persona</h3>
          <p className="text-sm text-stone-500 mb-4">
            Customize how the AI mentor behaves.
          </p>
          <textarea
            value={localSettings.systemPrompt}
            onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
            rows={8}
            className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-stone-400 focus:outline-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-all ${
              saved ? 'bg-green-600' : 'bg-stone-800 hover:bg-stone-700'
            }`}
          >
            <Save size={18} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-stone-200 text-center text-xs text-stone-400">
            <p>Stoic Diary v1.0.0 • Local First • Private</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
