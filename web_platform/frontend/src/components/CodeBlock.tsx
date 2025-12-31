'use client';

/**
 * Semantic Syntax Highlighter
 * Auto-detects language and applies intelligent color coding
 * Based on code semantics, not just patterns
 */

export interface HighlightedCode {
  html: string;
  language: string;
  theme: 'dark' | 'light';
}

export interface Token {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'class' | 'variable' | 'operator' | 'punctuation' | 'text';
  value: string;
}

// Color palettes for dark and light themes
const COLOR_PALETTE = {
  dark: {
    keyword: '#a78bfa',      // Purple - control flow
    string: '#86efac',       // Green - text data
    number: '#fbbf24',       // Amber - numeric data
    comment: '#6b7280',      // Gray - documentation
    function: '#60a5fa',     // Blue - actions/methods
    class: '#f472b6',        // Pink - types/classes
    variable: '#e5e7eb',     // Light gray - names
    operator: '#fca5a5',     // Red - operators
    punctuation: '#9ca3af',  // Medium gray - syntax
  },
  light: {
    keyword: '#7c3aed',      // Purple
    string: '#16a34a',       // Green
    number: '#b45309',       // Amber
    comment: '#9ca3af',      // Gray
    function: '#2563eb',     // Blue
    class: '#ec4899',        // Pink
    variable: '#1f2937',     // Dark gray
    operator: '#dc2626',     // Red
    punctuation: '#6b7280',  // Medium gray
  },
};

// Language-specific keywords
const KEYWORDS = {
  typescript: {
    keywords: ['type', 'interface', 'enum', 'const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'implements', 'import', 'export', 'from', 'default', 'new', 'this', 'super', 'static', 'public', 'private', 'protected', 'readonly', 'abstract'],
    types: ['string', 'number', 'boolean', 'any', 'void', 'never', 'unknown', 'null', 'undefined'],
    functions: ['useState', 'useEffect', 'useCallback', 'useRef', 'useMemo', 'useContext', 'useReducer', 'console', 'fetch', 'async', 'then', 'catch', 'finally'],
    classes: ['React', 'Promise', 'Error', 'Array', 'Object', 'Map', 'Set', 'Date'],
  },
  javascript: {
    keywords: ['var', 'let', 'const', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'default', 'break', 'continue', 'new', 'this', 'super', 'class', 'extends', 'import', 'export', 'from', 'yield', 'try', 'catch', 'finally', 'throw'],
    types: ['null', 'undefined', 'true', 'false'],
    functions: ['console', 'log', 'fetch', 'then', 'catch', 'finally', 'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every'],
    classes: ['Promise', 'Error', 'Array', 'Object', 'Date', 'RegExp'],
  },
  python: {
    keywords: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'pass', 'break', 'continue', 'yield', 'lambda', 'async', 'await', 'and', 'or', 'not', 'in', 'is'],
    types: ['int', 'str', 'float', 'bool', 'list', 'dict', 'tuple', 'set', 'None', 'True', 'False'],
    functions: ['print', 'len', 'range', 'map', 'filter', 'enumerate', 'zip', 'sorted', 'reversed', 'sum', 'min', 'max', 'open', 'isinstance'],
    classes: ['Exception', 'ValueError', 'TypeError', 'KeyError', 'IndexError'],
  },
  csharp: {
    keywords: ['public', 'private', 'protected', 'internal', 'static', 'async', 'await', 'const', 'class', 'struct', 'interface', 'enum', 'namespace', 'using', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'default', 'return', 'new', 'this', 'base', 'virtual', 'override', 'abstract', 'sealed', 'partial'],
    types: ['int', 'string', 'bool', 'double', 'float', 'decimal', 'long', 'short', 'byte', 'char', 'object', 'dynamic', 'var', 'null'],
    functions: ['Console', 'WriteLine', 'Write', 'ReadLine', 'ToString', 'Parse', 'Convert', 'Task'],
    classes: ['Exception', 'ArgumentException', 'List', 'Dictionary', 'Enumerable', 'Linq'],
  },
};

/**
 * Detect programming language from code
 */
export function detectLanguage(code: string): string {
  if (code.includes('import React') || code.includes('from react') || code.includes('.tsx') || code.includes('useState')) {
    return 'typescript';
  }
  if (code.includes('const ') && code.includes('=>') && code.includes('import')) {
    return 'javascript';
  }
  if (code.includes('def ') || code.includes('import ') && code.includes(':')) {
    return 'python';
  }
  if (code.includes('using ') || code.includes('namespace ') || code.includes('public class')) {
    return 'csharp';
  }
  if (code.includes('fn ') || code.includes('pub ') || code.includes('let ')) {
    return 'rust';
  }
  if (code.includes('class ') && code.includes('public function')) {
    return 'php';
  }
  
  return 'javascript'; // default
}

/**
 * Tokenize code into semantic tokens
 */
function tokenizeCode(code: string, language: string): Token[] {
  const tokens: Token[] = [];
  const keywordSet = KEYWORDS[language as keyof typeof KEYWORDS] || KEYWORDS.javascript;
  
  // Regex patterns for tokenization
  const patterns = [
    { regex: /\/\/.*$/gm, type: 'comment' },
    { regex: /\/\*[\s\S]*?\*\//g, type: 'comment' },
    { regex: /(['"`])(?:\\.|(?!\1).)*\1/g, type: 'string' },
    { regex: /\b\d+\.?\d*([eE][+-]?\d+)?\b/g, type: 'number' },
    { regex: /\b(true|false|null|undefined)\b/g, type: 'keyword' },
    { regex: /\b[A-Z][a-zA-Z0-9]*\b/g, type: 'class' },
    { regex: /\b[a-zA-Z_]\w*(?=\s*\()/g, type: 'function' },
    { regex: /[+\-*/%=&|^!<>?:]+/g, type: 'operator' },
    { regex: /[{}()\[\];,]/g, type: 'punctuation' },
  ];

  let lastIndex = 0;
  const processedRanges: Array<[number, number]> = [];

  // Apply patterns
  for (const { regex, type } of patterns) {
    let match;
    while ((match = regex.exec(code)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;

      // Skip if already processed
      if (processedRanges.some(([s, e]) => s <= start && end <= e)) {
        continue;
      }

      // Add text before match
      if (start > lastIndex) {
        const text = code.substring(lastIndex, start);
        if (text.trim()) {
          tokens.push({ type: 'variable', value: text });
        }
      }

      tokens.push({ type: type as Token['type'], value: match[0] });
      processedRanges.push([start, end]);
      lastIndex = end;
    }
  }

  // Add remaining text
  if (lastIndex < code.length) {
    const remaining = code.substring(lastIndex);
    if (remaining.trim()) {
      tokens.push({ type: 'variable', value: remaining });
    }
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', value: code }];
}

/**
 * Main highlighter function
 */
export function highlightCode(code: string, theme: 'dark' | 'light' = 'dark'): HighlightedCode {
  const language = detectLanguage(code);
  const colors = COLOR_PALETTE[theme];
  
  const tokens = tokenizeCode(code, language);
  
  let html = '';
  for (const token of tokens) {
    const color = colors[token.type];
    const escapedValue = escapeHtml(token.value);
    
    if (token.type === 'text' || token.type === 'punctuation' || token.type === 'variable') {
      html += escapedValue;
    } else {
      html += `<span style="color: ${color};">${escapedValue}</span>`;
    }
  }

  return {
    html,
    language,
    theme,
  };
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * React component for syntax highlighting
 */
import React, { useMemo } from 'react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: 'dark' | 'light';
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language,
  theme = 'dark',
  showLineNumbers = true,
  maxHeight = '500px',
}: CodeBlockProps) {
  const highlighted = useMemo(() => {
    return highlightCode(code, theme);
  }, [code, theme]);

  const lines = code.split('\n');

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        theme === 'dark'
          ? 'bg-slate-950 border-slate-700'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-2 flex items-center justify-between ${
          theme === 'dark'
            ? 'bg-slate-900 border-b border-slate-700'
            : 'bg-slate-100 border-b border-slate-200'
        }`}
      >
        <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          {highlighted.language.toUpperCase()}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Copy
        </button>
      </div>

      {/* Code */}
      <div
        className="overflow-auto font-mono text-sm"
        style={{ maxHeight }}
      >
        <table className="w-full">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className={theme === 'dark' ? 'hover:bg-slate-900/30' : 'hover:bg-slate-50'}>
                {showLineNumbers && (
                  <td
                    className={`select-none px-3 py-1 text-right w-12 ${
                      theme === 'dark' ? 'bg-slate-950 text-slate-600' : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </td>
                )}
                <td
                  className={`px-4 py-1 whitespace-pre-wrap break-words ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-900'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: highlightLine(line, theme),
                  }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Highlight individual line
 */
function highlightLine(line: string, theme: 'dark' | 'light'): string {
  const colors = COLOR_PALETTE[theme];
  
  // Detect language from context (simplified)
  const language = 'javascript';

  // Simple regex-based highlighting for individual line
  let highlighted = escapeHtml(line);

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'class', 'if', 'else', 'return', 'async', 'await', 'import', 'export', 'default', 'from', 'type', 'interface'];
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    highlighted = highlighted.replace(regex, `<span style="color: ${colors.keyword}; font-weight: 600;">${keyword}</span>`);
  }

  // Strings
  highlighted = highlighted.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, (match) => `<span style="color: ${colors.string};">${match}</span>`);

  // Numbers
  highlighted = highlighted.replace(/\b\d+\.?\d*\b/g, (match) => `<span style="color: ${colors.number};">${match}</span>`);

  // Comments
  highlighted = highlighted.replace(/\/\/.*$/g, (match) => `<span style="color: ${colors.comment}; font-style: italic;">${match}</span>`);

  // Function calls
  highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, `<span style="color: ${colors.function};">$1</span>(`);

  return highlighted;
}

export default CodeBlock;
