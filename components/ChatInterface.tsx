import React, { useState, useEffect, useRef } from 'react';
import { Send, Moon, Sun, Loader2, Sparkles, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, DailyEntry, AppSettings } from '../types';
import { GeminiService } from '../services/geminiService';
import * as StorageUtils from '../utils/storageUtils';
import * as ExportUtils from '../utils/exportUtils';

interface ChatInterfaceProps {
  date: string;
  settings: AppSettings;
  onEntryUpdate: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ date, settings, onEntryUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load initial data
  useEffect(() => {
    const entry = StorageUtils.getEntry(date);
    if (entry) {
      setMessages(entry.messages);
    } else {
      setMessages([]);
    }
  }, [date]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveCurrentState = (msgs: Message[]) => {
    const entry: DailyEntry = {
      date: date,
      messages: msgs,
      lastModified: Date.now()
    };
    StorageUtils.saveEntry(entry);
    onEntryUpdate();
  };

  const handleSendMessage = async (text: string = inputText) => {
    if ((!text.trim()) || isLoading || !settings.apiKey) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    saveCurrentState(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const gemini = new GeminiService(settings.apiKey);
      const streamResult = await gemini.createChatStream(
        updatedMessages.slice(0, -1), // History excluding current new message
        settings.systemPrompt,
        text
      );

      let fullResponse = '';
      const botMsgId = (Date.now() + 1).toString();
      
      // Temporary state for streaming
      setMessages(prev => [
        ...prev, 
        { id: botMsgId, role: 'model', content: '', timestamp: Date.now() }
      ]);

      for await (const chunk of streamResult) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullResponse += chunkText;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, content: fullResponse } : msg
          ));
        }
      }

      // Final save
      const finalMessages = updatedMessages.concat({
        id: botMsgId,
        role: 'model',
        content: fullResponse,
        timestamp: Date.now()
      });
      setMessages(finalMessages);
      saveCurrentState(finalMessages);

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'model', content: "I apologize, but I'm having trouble connecting to my thoughts right now. Please check your API Key.", timestamp: Date.now() }
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const triggerMorning = () => handleSendMessage("Let's begin the morning preparation. Guide me through Premeditatio Malorum.");
  const triggerEvening = () => handleSendMessage("It is time for the evening review. Let's reflect on today's actions.");

  const handleCopy = () => {
    const entry = StorageUtils.getEntry(date) || { date, messages: messages, lastModified: Date.now() };
    ExportUtils.copyToClipboard(entry, true);
    // Could add toast here
  };

  if (!settings.apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-stone-600">
        <Sparkles className="w-12 h-12 mb-4 text-stone-400" />
        <h2 className="text-xl font-serif font-bold mb-2">Welcome, Traveler</h2>
        <p className="max-w-md">To begin your journey, please enter your Gemini API Key in the settings menu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <header className="flex-none p-4 border-b border-stone-200 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-lg font-serif font-bold text-stone-800">
            {date === StorageUtils.getTodayDateString() ? 'Today\'s Session' : date}
          </h1>
          <span className="text-xs text-stone-500 uppercase tracking-widest">Stoic Reflection</span>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleCopy}
            title="Copy to Obsidian format"
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
          >
            <Copy size={18} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-70">
            <p className="text-stone-500 font-serif italic text-center">"The happiness of your life depends upon the quality of your thoughts."</p>
            <div className="flex gap-4">
              <button 
                onClick={triggerMorning}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-300 transition-all text-sm font-medium"
              >
                <Sun size={16} /> Morning Prep
              </button>
              <button 
                onClick={triggerEvening}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-300 transition-all text-sm font-medium"
              >
                <Moon size={16} /> Evening Review
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-stone-800 text-stone-50 rounded-br-none' 
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-sm'
              }`}
            >
              <ReactMarkdown 
                className="prose prose-stone prose-sm max-w-none"
                components={{
                  p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-stone-400" size={16} />
                <span className="text-xs text-stone-400">Reflecting...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Write your reflection..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white resize-none h-[50px] max-h-[120px]"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
