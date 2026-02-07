import { DailyEntry, Message } from '../types';
import JSZip from 'jszip';
import saveAs from 'file-saver';

const formatMarkdown = (entry: DailyEntry, includeFrontmatter: boolean): string => {
  const { date, messages } = entry;
  
  let content = '';

  if (includeFrontmatter) {
    content += `---\n`;
    content += `date: ${date}\n`;
    content += `type: stoic-reflection\n`;
    content += `tags: [stoicism, review, diary]\n`;
    content += `---\n\n`;
  }

  content += `# Stoic Reflection - ${date}\n\n`;

  messages.forEach(msg => {
    const roleName = msg.role === 'user' ? 'Me' : 'Stoic Guide';
    content += `**${roleName}**: ${msg.content}\n\n`;
  });

  return content;
};

export const exportSingleEntry = (entry: DailyEntry, includeFrontmatter: boolean) => {
  const markdown = formatMarkdown(entry, includeFrontmatter);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${entry.date}-Stoic.md`);
};

export const copyToClipboard = async (entry: DailyEntry, includeFrontmatter: boolean): Promise<boolean> => {
    const markdown = formatMarkdown(entry, includeFrontmatter);
    try {
        await navigator.clipboard.writeText(markdown);
        return true;
    } catch (err) {
        console.error('Failed to copy', err);
        return false;
    }
}

export const exportBatchZip = async (entries: DailyEntry[], includeFrontmatter: boolean) => {
  const zip = new JSZip();

  entries.forEach(entry => {
    const markdown = formatMarkdown(entry, includeFrontmatter);
    zip.file(`${entry.date}-Stoic.md`, markdown);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `stoic-diary-export-${new Date().toISOString().split('T')[0]}.zip`);
};

export const exportBatchMerged = (entries: DailyEntry[], includeFrontmatter: boolean) => {
  // Sort entries by date
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  let mergedContent = '';
  
  // Overall Frontmatter if needed
  if (includeFrontmatter) {
      mergedContent += `---\n`;
      mergedContent += `type: stoic-reflection-summary\n`;
      mergedContent += `exported_at: ${new Date().toISOString()}\n`;
      mergedContent += `---\n\n`;
  }

  sorted.forEach(entry => {
    mergedContent += `## ${entry.date}\n\n`;
    entry.messages.forEach(msg => {
        const roleName = msg.role === 'user' ? 'Me' : 'Stoic Guide';
        mergedContent += `**${roleName}**: ${msg.content}\n\n`;
    });
    mergedContent += `---\n\n`;
  });

  const blob = new Blob([mergedContent], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `stoic-diary-merged-${new Date().toISOString().split('T')[0]}.md`);
};