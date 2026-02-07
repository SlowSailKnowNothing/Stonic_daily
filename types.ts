export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  messages: Message[];
  summary?: string;
  tags?: string[];
  lastModified: number;
}

export interface AppSettings {
  apiKey: string;
  userName: string;
  obsidianFolderHandle?: FileSystemDirectoryHandle | null; // For direct save
  systemPrompt: string;
}

export interface ExportOptions {
  includeFrontmatter: boolean;
  exportFormat: 'markdown' | 'json';
  dateRange: 'single' | 'range' | 'all';
  startDate?: string;
  endDate?: string;
}

export const DEFAULT_SYSTEM_PROMPT = `You are a Stoic mentor and philosopher. Your role is to help the user practice Stoicism through daily reflection. 
1. Be concise, calm, and insightful.
2. Draw upon the wisdom of Marcus Aurelius, Seneca, and Epictetus, but speak naturally, not just quoting.
3. If it is morning, encourage "Premeditatio Malorum" (visualizing challenges) and setting virtuous intentions.
4. If it is evening, guide a review of the day: what went well, what didn't, and what can be improved.
5. Focus on the dichotomy of control: help the user distinguish between what is up to them and what is not.
`;
