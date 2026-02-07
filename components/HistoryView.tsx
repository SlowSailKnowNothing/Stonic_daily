import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, FileArchive, FileText, CheckSquare, Square } from 'lucide-react';
import * as StorageUtils from '../utils/storageUtils';
import * as ExportUtils from '../utils/exportUtils';
import { DailyEntry } from '../types';

interface HistoryViewProps {
  onSelectDate: (date: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelectDate }) => {
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    setEntries(StorageUtils.loadEntries());
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const toggleDateSelection = (dateStr: string) => {
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    setSelectedDates(newSelected);
  };

  const handleBulkExportZip = () => {
    const selectedEntries = Array.from(selectedDates)
        .map(date => entries[date])
        .filter(Boolean);
    if (selectedEntries.length > 0) {
        ExportUtils.exportBatchZip(selectedEntries, true);
        setSelectedDates(new Set()); // Clear selection
    }
  };

  const handleBulkExportMerged = () => {
    const selectedEntries = Array.from(selectedDates)
        .map(date => entries[date])
        .filter(Boolean);
    if (selectedEntries.length > 0) {
        ExportUtils.exportBatchMerged(selectedEntries, true);
        setSelectedDates(new Set());
    }
  };

  const renderCalendar = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-transparent" />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry = entries[dateStr];
      const isSelected = selectedDates.has(dateStr);

      days.push(
        <div 
          key={dateStr} 
          className={`h-24 border border-stone-100 p-2 relative group transition-colors ${entry ? 'bg-white hover:bg-stone-50 cursor-pointer' : 'bg-stone-50 opacity-50'}`}
          onClick={() => {
              if (entry && viewMode === 'list') return; // Should not happen in calendar view logic but safety
              if (entry) onSelectDate(dateStr);
          }}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${entry ? 'text-stone-800' : 'text-stone-400'}`}>{d}</span>
            {entry && (
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleDateSelection(dateStr);
                    }}
                    className="text-stone-300 hover:text-stone-600"
                 >
                     {isSelected ? <CheckSquare size={16} className="text-stone-800" /> : <Square size={16} />}
                 </button>
            )}
          </div>
          {entry && (
            <div className="mt-2 text-xs text-stone-500 line-clamp-3">
              {entry.messages.length} exchanges
            </div>
          )}
        </div>
      );
    }

    return (
        <div className="grid grid-cols-7 gap-px bg-stone-200 border border-stone-200 rounded-lg overflow-hidden">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="bg-stone-100 p-2 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">
                     {day}
                 </div>
             ))}
             {days}
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white p-6 overflow-y-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-serif font-bold text-stone-800">History & Reflection</h2>
            <p className="text-stone-500 text-sm">Review past dialogues.</p>
        </div>
        
        {selectedDates.size > 0 && (
            <div className="flex gap-2 bg-stone-800 text-stone-50 px-4 py-2 rounded-lg items-center shadow-lg animate-in fade-in slide-in-from-top-4">
                <span className="text-sm font-medium">{selectedDates.size} selected</span>
                <div className="h-4 w-px bg-stone-600 mx-2"></div>
                <button 
                    onClick={handleBulkExportZip}
                    className="flex items-center gap-1 hover:text-stone-300 text-xs"
                    title="Download as Zip"
                >
                    <FileArchive size={14} /> ZIP
                </button>
                <button 
                    onClick={handleBulkExportMerged}
                    className="flex items-center gap-1 hover:text-stone-300 text-xs"
                    title="Merge into one Markdown file"
                >
                    <FileText size={14} /> Merge
                </button>
            </div>
        )}
      </header>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-1 hover:bg-stone-100 rounded-full"><ChevronLeft /></button>
            <span className="text-lg font-medium text-stone-700">
                {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-stone-100 rounded-full"><ChevronRight /></button>
        </div>
      </div>

      {renderCalendar()}
    </div>
  );
};

export default HistoryView;
