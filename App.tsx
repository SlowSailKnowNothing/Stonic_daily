import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Book, Calendar, Settings, Menu, X } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import HistoryView from './components/HistoryView';
import SettingsPanel from './components/SettingsPanel';
import * as StorageUtils from './utils/storageUtils';
import { AppSettings } from './types';

// Simple custom router for single-page feel without URL hash nav unless needed
type View = 'chat' | 'history' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('chat');
  const [selectedDate, setSelectedDate] = useState<string>(StorageUtils.getTodayDateString());
  const [settings, setSettings] = useState<AppSettings>(StorageUtils.loadSettings());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [triggerUpdate, setTriggerUpdate] = useState(0); // Hack to force refresh history when chat updates

  useEffect(() => {
    // If no API key, force settings on first load
    if (!settings.apiKey) {
      setCurrentView('settings');
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageUtils.saveSettings(newSettings);
    if (currentView === 'settings' && newSettings.apiKey) {
        setCurrentView('chat');
    }
  };

  const handleEntryUpdate = () => {
    setTriggerUpdate(prev => prev + 1);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setCurrentView('chat');
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        if (view === 'chat') setSelectedDate(StorageUtils.getTodayDateString());
        setSidebarOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-stone-200 text-stone-900 font-medium' 
          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-stone-100 font-sans text-stone-900 overflow-hidden">
      
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md text-stone-800"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-stone-50 border-r border-stone-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 mt-2 px-4">
            <h1 className="font-serif text-2xl font-bold text-stone-800">Stoic Diary</h1>
            <p className="text-xs text-stone-500 mt-1">Reflect. Prepare. Endure.</p>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem view="chat" icon={Book} label="Daily Session" />
            <NavItem view="history" icon={Calendar} label="History" />
            <NavItem view="settings" icon={Settings} label="Settings" />
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {currentView === 'chat' && (
          <ChatInterface 
            date={selectedDate} 
            settings={settings} 
            onEntryUpdate={handleEntryUpdate}
          />
        )}
        {currentView === 'history' && (
          <HistoryView onSelectDate={handleDateSelect} />
        )}
        {currentView === 'settings' && (
          <SettingsPanel settings={settings} onSave={handleSaveSettings} />
        )}
      </main>
    </div>
  );
}

export default App;
