export function parseDescriptionMarkdown(text: string | null | undefined): string {
  if (!text?.trim()) {
    return '';
  }

  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/^[\-\*] (.+)$/gm, '• $1')
    .replace(/\n/g, '<br>');
}

export function wrapDescriptionSelection(
  value: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string
): { value: string; selectionStart: number; selectionEnd: number } {
  const selectedText = value.substring(start, end);
  let newText: string;

  if (prefix === '- ' && suffix === '') {
    if (selectedText.includes('\n')) {
      newText = selectedText
        .split('\n')
        .map((line) => {
          if (line.trim() === '') {
            return line;
          }
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return line;
          }
          return `- ${line}`;
        })
        .join('\n');
    } else {
      newText = `${prefix}${selectedText}${suffix}`;
    }
  } else {
    newText = `${prefix}${selectedText}${suffix}`;
  }

  const nextValue = value.substring(0, start) + newText + value.substring(end);
  const selectionStart = start + prefix.length;
  const selectionEnd = selectionStart + selectedText.length;

  return { value: nextValue, selectionStart, selectionEnd };
}
