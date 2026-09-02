import React from 'react';

/**
 * Parses markdown-style bold (**text**), italic (*text*), and line breaks (\n)
 * into safe React nodes.
 */
export function formatRichText(text?: string | null): React.ReactNode {
  if (!text) return text;
  if (typeof text !== 'string') return text;

  // Split by bold (**...**) syntax
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className="font-extrabold text-inherit">
          {boldContent}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Global keyboard shortcut listener for Admin inputs/textareas.
 * Enables pressing Ctrl+B (or Cmd+B) on any highlighted text in the admin portal
 * to wrap or unwrap it with markdown bold asterisks (**...**).
 */
export function setupAdminRichTextShortcuts(): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Only run for text, search, url inputs and textareas
        if (target.tagName === 'INPUT') {
          const inputType = (target as HTMLInputElement).type;
          if (inputType && !['text', 'search', 'url'].includes(inputType)) {
            return;
          }
        }

        e.preventDefault();
        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;
        const value = target.value;
        const selectedText = value.substring(start, end);

        let newText = '';
        let newStart = start;
        let newEnd = end;

        // 1. If selection itself starts and ends with **
        if (selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length >= 4) {
          const unwrapped = selectedText.slice(2, -2);
          newText = value.substring(0, start) + unwrapped + value.substring(end);
          newStart = start;
          newEnd = start + unwrapped.length;
        } 
        // 2. If surrounding text has **
        else if (
          start >= 2 &&
          end <= value.length - 2 &&
          value.substring(start - 2, start) === '**' &&
          value.substring(end, end + 2) === '**'
        ) {
          newText = value.substring(0, start - 2) + selectedText + value.substring(end + 2);
          newStart = start - 2;
          newEnd = start - 2 + selectedText.length;
        } 
        // 3. Wrap selection with **
        else {
          const wrapped = `**${selectedText}**`;
          newText = value.substring(0, start) + wrapped + value.substring(end);
          newStart = start + 2;
          newEnd = end + 2;
        }

        // Set value via native prototype setter so React picks up the onChange/input event
        const proto = target.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(target, newText);
        } else {
          target.value = newText;
        }

        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));

        // Restore selection
        setTimeout(() => {
          target.focus();
          target.setSelectionRange(newStart, newEnd);
        }, 0);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}
