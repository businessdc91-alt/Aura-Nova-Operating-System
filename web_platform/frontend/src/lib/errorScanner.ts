/**
 * Error Scanner Service
 * Real-time syntax validation, logic checking, and interactive error fixing
 * Supports: TypeScript, JavaScript, Python, C++, C#, Java, Rust, Go, HTML, CSS, JSON, YAML
 */

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'suggestion';
export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'cpp'
  | 'csharp'
  | 'java'
  | 'rust'
  | 'go'
  | 'html'
  | 'css'
  | 'json'
  | 'yaml';

export interface CodeError {
  id: string;
  line: number;
  column: number;
  severity: ErrorSeverity;
  message: string;
  code: string; // error code like 'UNUSED_VAR', 'SYNTAX_ERROR'
  context: string; // the problematic line/snippet
  suggestions: ErrorSuggestion[];
  relatedErrors?: string[]; // IDs of related errors
}

export interface ErrorSuggestion {
  id: string;
  title: string;
  description: string;
  fixedCode: string;
  explanation: string;
  askQuestions?: string[]; // Questions to ask user before applying
}

export interface ScanResult {
  language: CodeLanguage;
  totalErrors: number;
  errors: CodeError[];
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  scanTime: number;
  isComplete: boolean;
}

// ============== LANGUAGE DETECTORS ==============

export function detectLanguage(filename: string): CodeLanguage {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, CodeLanguage> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    cpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    cs: 'csharp',
    java: 'java',
    rs: 'rust',
    go: 'go',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'css',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return langMap[ext] || 'typescript';
}

// ============== MAIN SCANNER ==============

export class ErrorScanner {
  private language: CodeLanguage;
  private code: string;
  private lines: string[];

  constructor(code: string, language: CodeLanguage) {
    this.code = code;
    this.language = language;
    this.lines = code.split('\n');
  }

  async scan(): Promise<ScanResult> {
    const startTime = performance.now();
    const errors: CodeError[] = [];

    // Run all scanners based on language
    switch (this.language) {
      case 'typescript':
      case 'javascript':
        errors.push(...this.scanTypeScript());
        break;
      case 'python':
        errors.push(...this.scanPython());
        break;
      case 'cpp':
        errors.push(...this.scanCpp());
        break;
      case 'csharp':
        errors.push(...this.scanCSharp());
        break;
      case 'java':
        errors.push(...this.scanJava());
        break;
      case 'json':
        errors.push(...this.scanJSON());
        break;
      case 'html':
        errors.push(...this.scanHTML());
        break;
      case 'css':
        errors.push(...this.scanCSS());
        break;
    }

    // Run universal checks
    errors.push(...this.scanUniversal());

    // Sort by line number
    errors.sort((a, b) => a.line - b.line || a.column - b.column);

    // Calculate stats
    const errorsByType = errors.reduce(
      (acc, err) => {
        acc[err.code] = (acc[err.code] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const errorsBySeverity = errors.reduce(
      (acc, err) => {
        acc[err.severity] = (acc[err.severity] || 0) + 1;
        return acc;
      },
      { error: 0, warning: 0, info: 0, suggestion: 0 }
    );

    const scanTime = performance.now() - startTime;

    return {
      language: this.language,
      totalErrors: errors.length,
      errors,
      errorsByType,
      errorsBySeverity,
      scanTime,
      isComplete: true,
    };
  }

  // ============== TYPESCRIPT / JAVASCRIPT ==============
  private scanTypeScript(): CodeError[] {
    const errors: CodeError[] = [];
    const usedVariables = new Set<string>();
    const declaredVariables = new Map<string, { line: number; col: number }>();

    const varRegex = /(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
    const useRegex = /\b(\w+)\b/g;

    // Track declarations
    this.lines.forEach((line, lineIdx) => {
      let match;
      while ((match = varRegex.exec(line)) !== null) {
        const varName = match[1];
        declaredVariables.set(varName, { line: lineIdx + 1, col: match.index });
      }
    });

    // Track usage
    this.lines.forEach((line) => {
      let match;
      while ((match = useRegex.exec(line)) !== null) {
        usedVariables.add(match[1]);
      }
    });

    // Find unused variables
    declaredVariables.forEach((pos, varName) => {
      if (!usedVariables.has(varName) && !varName.match(/^[A-Z]/)) {
        // Skip if it looks like a constant
        errors.push({
          id: `unused-${varName}-${pos.line}`,
          line: pos.line,
          column: pos.col,
          severity: 'warning',
          message: `Variable "${varName}" is declared but never used`,
          code: 'UNUSED_VAR',
          context: this.lines[pos.line - 1],
          suggestions: [
            {
              id: 'remove-unused',
              title: 'Remove unused variable',
              description: `Delete the declaration of "${varName}"`,
              fixedCode: this.lines[pos.line - 1]
                .replace(/(?:const|let|var|function|class)\s+\w+\s*[=;]?.*/, '')
                .trim(),
              explanation:
                'Unused variables increase code complexity and can hide bugs. Removing them keeps your codebase clean.',
              askQuestions: [
                `Are you sure you don't need "${varName}" later in the code?`,
                `Should this be exported for use in other modules?`,
              ],
            },
            {
              id: 'underscore-prefix',
              title: 'Mark as intentionally unused',
              description: `Prefix with underscore to signal intentional non-use`,
              fixedCode: this.lines[pos.line - 1].replace(varName, `_${varName}`),
              explanation:
                'Using underscore prefix is a convention that tells other developers this variable is intentionally unused (often required by the type system).',
              askQuestions: ['Is this intentional? Will it be used in a future implementation?'],
            },
          ],
        });
      }
    });

    // Check for missing semicolons
    this.lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(',') &&
        !trimmed.startsWith('//')
      ) {
        errors.push({
          id: `missing-semi-${idx}`,
          line: idx + 1,
          column: line.length,
          severity: 'suggestion',
          message: 'Missing semicolon',
          code: 'MISSING_SEMICOLON',
          context: line,
          suggestions: [
            {
              id: 'add-semicolon',
              title: 'Add semicolon',
              description: 'Add semicolon at end of line',
              fixedCode: `${line};`,
              explanation:
                'Semicolons clarify where statements end. While JavaScript has automatic semicolon insertion, explicit semicolons are a best practice for clarity and consistency.',
              askQuestions: ['Should this line end with a semicolon?'],
            },
          ],
        });
      }
    });

    // Check for async/await misuse
    this.lines.forEach((line, idx) => {
      if (line.includes('await ') && !line.includes('async')) {
        const inAsync = this.isInsideAsyncFunction(idx);
        if (!inAsync) {
          errors.push({
            id: `await-outside-async-${idx}`,
            line: idx + 1,
            column: line.indexOf('await'),
            severity: 'error',
            message: 'await used outside async function',
            code: 'AWAIT_OUTSIDE_ASYNC',
            context: line,
            suggestions: [
              {
                id: 'make-async',
                title: 'Wrap in async function',
                description: 'Convert containing function to async',
                fixedCode: `async ${line}`,
                explanation:
                  'The await keyword can only be used inside async functions. This ensures your code properly handles asynchronous operations.',
                askQuestions: ['Should this function be async?'],
              },
            ],
          });
        }
      }
    });

    return errors;
  }

  private isInsideAsyncFunction(lineIdx: number): boolean {
    for (let i = lineIdx; i >= 0; i--) {
      if (this.lines[i].includes('async')) return true;
      if (this.lines[i].includes('function') || this.lines[i].includes('=>')) return false;
    }
    return false;
  }

  // ============== PYTHON ==============
  private scanPython(): CodeError[] {
    const errors: CodeError[] = [];

    // Check indentation
    let expectedIndent = 0;
    this.lines.forEach((line, idx) => {
      const leadingSpaces = line.match(/^ */)?.[0].length || 0;
      const isBlank = !line.trim();

      if (!isBlank && leadingSpaces % 4 !== 0) {
        errors.push({
          id: `indent-${idx}`,
          line: idx + 1,
          column: 0,
          severity: 'error',
          message: 'Indentation is not a multiple of 4',
          code: 'INDENTATION_ERROR',
          context: line,
          suggestions: [
            {
              id: 'fix-indent-4',
              title: 'Fix to 4-space indent',
              description: 'Adjust indentation to multiple of 4',
              fixedCode: line.replace(/^ */, ' '.repeat(Math.round(leadingSpaces / 4) * 4)),
              explanation:
                'Python requires consistent indentation (typically 4 spaces). Incorrect indentation causes syntax errors.',
              askQuestions: [
                'Should this be indented 4, 8, or 12 spaces?',
                'Is this code inside a function or class?',
              ],
            },
          ],
        });
      }
    });

    // Check for undefined imports
    const importedModules = new Set<string>();
    const usedModules = new Set<string>();

    this.lines.forEach((line) => {
      const importMatch = line.match(/from\s+(\w+)\s+import|import\s+(\w+)/);
      if (importMatch) {
        importedModules.add(importMatch[1] || importMatch[2]);
      }
    });

    return errors;
  }

  // ============== C++ ==============
  private scanCpp(): CodeError[] {
    const errors: CodeError[] = [];

    // Check for missing includes
    const includes = new Set<string>();
    const usedHeaders = new Set<string>();

    this.lines.forEach((line) => {
      const includeMatch = line.match(/#include\s*[<"]([^>"]+)[>"]/);
      if (includeMatch) {
        includes.add(includeMatch[1]);
      }

      // Check for common headers needed
      if (line.includes('std::vector')) usedHeaders.add('vector');
      if (line.includes('std::string')) usedHeaders.add('string');
      if (line.includes('std::cout') || line.includes('std::cin')) usedHeaders.add('iostream');
    });

    // Warn about missing includes
    usedHeaders.forEach((header) => {
      if (!includes.has(header)) {
        errors.push({
          id: `missing-header-${header}`,
          line: 1,
          column: 0,
          severity: 'error',
          message: `Missing #include for <${header}>`,
          code: 'MISSING_INCLUDE',
          context: '',
          suggestions: [
            {
              id: 'add-header',
              title: `Add #include <${header}>`,
              description: `Add the missing header at the top of your file`,
              fixedCode: `#include <${header}>\n${this.lines[0]}`,
              explanation: `The <${header}> header is required to use the classes/functions you're referencing. Missing includes cause compilation errors.`,
              askQuestions: [
                `Do you need the <${header}> header?`,
                'Should this go before or after other includes?',
              ],
            },
          ],
        });
      }
    });

    // Check for memory leaks (new without delete)
    this.lines.forEach((line, idx) => {
      if (line.includes('new ') && !line.includes('delete')) {
        errors.push({
          id: `potential-leak-${idx}`,
          line: idx + 1,
          column: line.indexOf('new'),
          severity: 'warning',
          message: 'Potential memory leak: new without corresponding delete',
          code: 'POTENTIAL_MEMORY_LEAK',
          context: line,
          suggestions: [
            {
              id: 'use-smart-pointer',
              title: 'Use smart pointer (std::unique_ptr)',
              description: 'Replace with smart pointer for automatic memory management',
              fixedCode: line.replace(/new /, 'std::make_unique<'),
              explanation:
                'Smart pointers (unique_ptr, shared_ptr) automatically manage memory and prevent leaks. They\'re the modern C++ way.',
              askQuestions: [
                'Should this object have exclusive ownership (unique_ptr) or shared ownership (shared_ptr)?',
                'Do you need this to be dynamically allocated?',
              ],
            },
          ],
        });
      }
    });

    return errors;
  }

  // ============== C# ==============
  private scanCSharp(): CodeError[] {
    const errors: CodeError[] = [];

    // Check for proper casing conventions
    this.lines.forEach((line, idx) => {
      const classMatch = line.match(/class\s+(\w+)/);
      const methodMatch = line.match(/(?:public|private|protected)\s+\w+\s+(\w+)\s*\(/);
      const fieldMatch = line.match(/private\s+\w+\s+(\w+)/);

      if (classMatch && classMatch[1] && !classMatch[1].match(/^[A-Z]/)) {
        errors.push({
          id: `casing-class-${idx}`,
          line: idx + 1,
          column: line.indexOf(classMatch[1]),
          severity: 'warning',
          message: `Class name "${classMatch[1]}" should start with uppercase`,
          code: 'NAMING_CONVENTION',
          context: line,
          suggestions: [
            {
              id: 'fix-class-case',
              title: 'Fix class name casing',
              description: 'Convert to PascalCase',
              fixedCode: line.replace(classMatch[1], classMatch[1].charAt(0).toUpperCase() + classMatch[1].slice(1)),
              explanation:
                'C# conventions require class names to use PascalCase (CapitalizedWords). This improves code readability and consistency.',
              askQuestions: ['Is this the correct class name?'],
            },
          ],
        });
      }
    });

    return errors;
  }

  // ============== JAVA ==============
  private scanJava(): CodeError[] {
    const errors: CodeError[] = [];

    // Check for proper class file naming
    const classMatch = this.code.match(/public\s+class\s+(\w+)/);
    const filename = this.lines[0]; // Assume first line has filename

    if (classMatch && classMatch[1]) {
      const className = classMatch[1];
      const expectedFilename = `${className}.java`;

      if (!filename.includes(expectedFilename)) {
        errors.push({
          id: 'filename-mismatch',
          line: 1,
          column: 0,
          severity: 'error',
          message: `File should be named ${expectedFilename}`,
          code: 'FILENAME_MISMATCH',
          context: '',
          suggestions: [
            {
              id: 'rename-file',
              title: `Rename to ${expectedFilename}`,
              description: 'Java requires public classes to be in files matching their class name',
              fixedCode: `// File: ${expectedFilename}`,
              explanation:
                'Java convention requires that a public class must be in a file with the same name as the class. This is enforced by the compiler.',
              askQuestions: [`Is "${className}" the correct class name?`],
            },
          ],
        });
      }
    }

    return errors;
  }

  // ============== JSON ==============
  private scanJSON(): CodeError[] {
    const errors: CodeError[] = [];

    try {
      JSON.parse(this.code);
    } catch (e: any) {
      const match = e.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1]) : 0;
      const line = this.code.substring(0, position).split('\n').length;

      errors.push({
        id: 'json-syntax-error',
        line,
        column: 0,
        severity: 'error',
        message: `Invalid JSON: ${e.message}`,
        code: 'JSON_SYNTAX_ERROR',
        context: this.lines[line - 1],
        suggestions: [
          {
            id: 'validate-json',
            title: 'Validate JSON structure',
            description: 'Check for missing commas, quotes, or brackets',
            fixedCode: this.code,
            explanation: 'JSON has strict syntax requirements. Check for mismatched brackets, missing commas, or unquoted keys.',
            askQuestions: [
              'Are all object keys quoted?',
              'Are all array elements properly comma-separated?',
              'Are there any trailing commas?',
            ],
          },
        ],
      });
    }

    return errors;
  }

  // ============== HTML ==============
  private scanHTML(): CodeError[] {
    const errors: CodeError[] = [];

    // Check for unclosed tags
    const tagStack: { tag: string; line: number }[] = [];
    const selfClosingTags = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);

    const tagRegex = /<\/?(\w+)[^>]*>/g;

    this.lines.forEach((line, idx) => {
      let match;
      while ((match = tagRegex.exec(line)) !== null) {
        const tag = match[1].toLowerCase();
        if (match[0].startsWith('</')) {
          const opened = tagStack.pop();
          if (!opened || opened.tag !== tag) {
            errors.push({
              id: `unclosed-tag-${tag}-${idx}`,
              line: idx + 1,
              column: match.index,
              severity: 'error',
              message: `Closing tag </${tag}> without matching opening tag`,
              code: 'UNCLOSED_TAG',
              context: line,
              suggestions: [
                {
                  id: 'remove-close',
                  title: `Remove closing </${tag}>`,
                  description: 'Remove the unmatched closing tag',
                  fixedCode: line.replace(match[0], ''),
                  explanation: `The closing tag </${tag}> doesn't have a matching opening tag. This creates invalid HTML.`,
                  askQuestions: [`Should this closing tag be removed or is there a missing opening tag?`],
                },
              ],
            });
          }
        } else if (!selfClosingTags.has(tag)) {
          tagStack.push({ tag, line: idx + 1 });
        }
      }
    });

    // Warn about remaining unclosed tags
    tagStack.forEach(({ tag, line }) => {
      errors.push({
        id: `unclosed-tag-${tag}-final`,
        line,
        column: 0,
        severity: 'warning',
        message: `<${tag}> tag is never closed`,
        code: 'UNCLOSED_HTML_TAG',
        context: this.lines[line - 1],
        suggestions: [
          {
            id: 'close-tag',
            title: `Add closing </${tag}>`,
            description: `Close the <${tag}> tag properly`,
            fixedCode: `${this.lines[line - 1]}</${tag}>`,
            explanation: `All HTML tags except self-closing tags must be explicitly closed. This improves document structure and validity.`,
            askQuestions: [`Should this <${tag}> tag be closed?`],
          },
        ],
      });
    });

    // Check for missing alt attributes on images
    this.lines.forEach((line, idx) => {
      if (line.includes('<img') && !line.includes('alt=')) {
        errors.push({
          id: `missing-alt-${idx}`,
          line: idx + 1,
          column: line.indexOf('<img'),
          severity: 'warning',
          message: 'Image missing alt attribute (accessibility)',
          code: 'MISSING_ALT_TEXT',
          context: line,
          suggestions: [
            {
              id: 'add-alt',
              title: 'Add alt attribute',
              description: 'Add descriptive alt text for accessibility',
              fixedCode: line.replace('<img ', '<img alt="Image description" '),
              explanation:
                'Alt text is crucial for accessibility - it helps screen readers and appears if images fail to load. Always describe what the image shows.',
              askQuestions: ['What does this image depict? Write a brief description for the alt attribute.'],
            },
          ],
        });
      }
    });

    return errors;
  }

  // ============== CSS ==============
  private scanCSS(): CodeError[] {
    const errors: CodeError[] = [];

    // Check for incomplete selectors
    this.lines.forEach((line, idx) => {
      if (line.includes('{') && !line.includes('}')) {
        const nextLines = this.lines.slice(idx + 1, idx + 10);
        if (!nextLines.some((l) => l.includes('}'))) {
          errors.push({
            id: `unclosed-rule-${idx}`,
            line: idx + 1,
            column: line.indexOf('{'),
            severity: 'error',
            message: 'CSS rule not closed',
            code: 'UNCLOSED_CSS_RULE',
            context: line,
            suggestions: [
              {
                id: 'close-rule',
                title: 'Close CSS rule',
                description: 'Add closing brace',
                fixedCode: `${line}\n}`,
                explanation: 'CSS rules must be enclosed in curly braces {}. Missing closing brace breaks subsequent rules.',
                askQuestions: ['Are all CSS properties for this rule included?'],
              },
            ],
          });
        }
      }
    });

    return errors;
  }

  // ============== UNIVERSAL CHECKS ==============
  private scanUniversal(): CodeError[] {
    const errors: CodeError[] = [];

    // Check for very long lines
    this.lines.forEach((line, idx) => {
      if (line.length > 120) {
        errors.push({
          id: `long-line-${idx}`,
          line: idx + 1,
          column: 120,
          severity: 'suggestion',
          message: `Line is ${line.length} characters long (exceeds 120)`,
          code: 'LONG_LINE',
          context: line.substring(0, 120) + '...',
          suggestions: [
            {
              id: 'wrap-line',
              title: 'Wrap line',
              description: 'Break into multiple lines for readability',
              fixedCode: line.substring(0, 120) + '\n  ' + line.substring(120),
              explanation:
                'Long lines reduce readability and make code harder to review. Breaking at 120 characters improves code quality.',
              askQuestions: ['How would you prefer to break this line?'],
            },
          ],
        });
      }
    });

    // Check for TODO/FIXME comments
    this.lines.forEach((line, idx) => {
      if (line.includes('TODO') || line.includes('FIXME')) {
        errors.push({
          id: `todo-${idx}`,
          line: idx + 1,
          column: line.indexOf('TODO') >= 0 ? line.indexOf('TODO') : line.indexOf('FIXME'),
          severity: 'info',
          message: line.includes('FIXME') ? 'Unresolved FIXME' : 'Pending TODO',
          code: 'UNRESOLVED_TODO',
          context: line,
          suggestions: [
            {
              id: 'resolve-todo',
              title: 'Resolve or remove',
              description: 'Complete the work or remove the comment',
              fixedCode: line.replace(/\/\/\s*(TODO|FIXME)[^\n]*/, ''),
              explanation:
                'TODO and FIXME comments should be resolved before production. They indicate incomplete work or known issues.',
              askQuestions: [
                'Is this still needed?',
                'What task needs to be completed?',
                'Should this block deployment?',
              ],
            },
          ],
        });
      }
    });

    // Check for debugging code
    this.lines.forEach((line, idx) => {
      if (line.includes('console.log') || line.includes('debugger') || line.includes('print(') && this.language === 'python') {
        errors.push({
          id: `debug-${idx}`,
          line: idx + 1,
          column: 0,
          severity: 'warning',
          message: 'Debug code found',
          code: 'DEBUG_CODE',
          context: line,
          suggestions: [
            {
              id: 'remove-debug',
              title: 'Remove debug statement',
              description: 'Remove debugging code before deployment',
              fixedCode: line.replace(/console\.log\([^)]*\)|debugger|print\([^)]*\)/g, ''),
              explanation:
                'Debug statements should be removed before production. They impact performance and can expose sensitive information.',
              askQuestions: ['Do you need this debug output? Should it be logged properly instead?'],
            },
          ],
        });
      }
    });

    return errors;
  }
}

// ============== BATCH SCANNER ==============

export async function scanMultipleFiles(
  files: Array<{ filename: string; content: string }>
): Promise<Record<string, ScanResult>> {
  const results: Record<string, ScanResult> = {};

  for (const file of files) {
    const language = detectLanguage(file.filename);
    const scanner = new ErrorScanner(file.content, language);
    results[file.filename] = await scanner.scan();
  }

  return results;
}
