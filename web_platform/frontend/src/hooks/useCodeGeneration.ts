'use client';

import { useState, useCallback, useRef } from 'react';
import { LocalModel } from '@/lib/modelRegistry';
import { ModelRegistryService } from '@/lib/modelRegistry';

export interface CodeGenerationRequest {
  projectName: string;
  description: string;
  framework: string;
  targetType: string;
  activeModel?: LocalModel | null;
}

export interface GeneratedFile {
  id: string;
  filename: string;
  language: string;
  description: string;
  content: string;
}

export interface CodeGenerationResponse {
  success: boolean;
  files: GeneratedFile[];
  reasoning: {
    why: string;
    bestPractices: string[];
    nextSteps: string[];
  };
  modelUsed: string;
  latency: number;
  error?: string;
}

/**
 * Hook for generating code using active model
 * Tries local model first, falls back to cloud APIs
 */
export function useCodeGeneration() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CodeGenerationResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(
    async (request: CodeGenerationRequest): Promise<CodeGenerationResponse> => {
      setLoading(true);
      setError(null);

      const startTime = performance.now();

      try {
        // Check if active model is healthy and try local first
        if (request.activeModel) {
          ModelRegistryService.recordSession(request.activeModel.id);

          try {
            const localResponse = await callLocalModel(
              request.activeModel,
              request
            );

            if (localResponse) {
              const latency = performance.now() - startTime;
              setResponse({ ...localResponse, latency });
              return { ...localResponse, latency };
            }
          } catch (localError: any) {
            console.warn('Local model failed, falling back to cloud:', localError.message);
            // Continue to cloud fallback
          }
        }

        // Fall back to cloud API
        const cloudResponse = await callCloudAPI(request);
        const latency = performance.now() - startTime;
        setResponse({ ...cloudResponse, latency });
        return { ...cloudResponse, latency };
      } catch (err: any) {
        const error = new Error(err.message || 'Code generation failed');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return { generate, loading, response, error, reset };
}

/**
 * Call local model (LM Studio or Ollama)
 */
async function callLocalModel(
  model: LocalModel,
  request: CodeGenerationRequest
): Promise<CodeGenerationResponse | null> {
  try {
    // Build the prompt with context
    const fullPrompt = buildCodePrompt(request);

    const endpoint = model.platform === 'lm-studio'
      ? `${model.endpoint}/v1/completions`
      : `${model.endpoint}/api/generate`;

    if (model.platform === 'lm-studio') {
      // LM Studio API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          max_tokens: 4000,
          temperature: 0.7,
          top_p: 0.9,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.text || '';

      return parseGeneratedContent(content, request, model.friendlyName);
    } else if (model.platform === 'ollama') {
      // Ollama API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.response || '';

      return parseGeneratedContent(content, request, model.friendlyName);
    }

    return null;
  } catch (error: any) {
    console.warn('Local model call failed:', error.message);
    throw error;
  }
}

/**
 * Call cloud APIs as fallback (Gemini)
 */
async function callCloudAPI(
  request: CodeGenerationRequest
): Promise<CodeGenerationResponse> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskType: 'generate',
        prompt: buildCodePrompt(request),
        context: `Framework: ${request.framework}, Target: ${request.targetType}`,
        complexity: request.description.length > 500 ? 'complex' : 'moderate',
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloud API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content || '';

    return parseGeneratedContent(content, request, data.modelUsed || 'gemini-1.5-pro');
  } catch (error: any) {
    throw new Error(`Cloud API failed: ${error.message}`);
  }
}

/**
 * Build a comprehensive code generation prompt
 */
function buildCodePrompt(request: CodeGenerationRequest): string {
  return `You are an expert software engineer. Generate production-ready code for the following specification:

Project Name: ${request.projectName}
Framework: ${request.framework}
Target Type: ${request.targetType}

Description:
${request.description}

Requirements:
1. Generate clean, well-documented code
2. Include comprehensive error handling
3. Add type definitions (TypeScript/generics)
4. Include unit test cases
5. Follow SOLID principles and best practices
6. Use appropriate design patterns
7. Add JSDoc comments for IDE intellisense

Output Format:
For each file, use this format:
--- FILE: filename.ext ---
[file content]
---

Generate at least 3 files:
1. Main implementation file
2. Test suite with 95%+ coverage
3. Type definitions or configuration`;
}

/**
 * Parse generated content into structured files
 */
function parseGeneratedContent(
  content: string,
  request: CodeGenerationRequest,
  modelName: string
): CodeGenerationResponse {
  const files: GeneratedFile[] = [];
  const fileMatches = content.split('--- FILE:');

  for (let i = 1; i < fileMatches.length; i++) {
    const match = fileMatches[i];
    const lines = match.split('\n');
    const filename = lines[0].trim().split('---')[0].trim();
    const fileContent = lines.slice(1).join('\n').split('---')[0].trim();

    const language = getLanguageFromFilename(filename, request.framework);

    files.push({
      id: `file-${i}`,
      filename,
      language,
      description: `Generated file: ${filename}`,
      content: fileContent,
    });
  }

  // If parsing didn't work well, generate fallback
  if (files.length === 0) {
    files.push(
      {
        id: '1',
        filename: `${request.projectName}.${getExtensionForFramework(request.framework)}`,
        language: getLanguageForFramework(request.framework),
        description: 'Main implementation',
        content: content,
      }
    );
  }

  return {
    success: true,
    files,
    reasoning: {
      why: 'Generated based on your specification using best practices and design patterns',
      bestPractices: [
        'Implemented error handling and validation',
        'Used TypeScript/generics for type safety',
        'Followed framework conventions and patterns',
        'Added comprehensive documentation',
        'Designed for scalability and maintainability',
      ],
      nextSteps: [
        'Review and customize the generated code',
        'Run tests to verify functionality',
        'Integrate with your build system',
        'Deploy to your development environment',
      ],
    },
    modelUsed: modelName,
    latency: 0,
  };
}

/**
 * Get file extension based on framework
 */
function getExtensionForFramework(framework: string): string {
  const extensions: Record<string, string> = {
    react: 'tsx',
    vue: 'vue',
    svelte: 'svelte',
    unity: 'cs',
    unreal: 'h',
  };
  return extensions[framework] || 'ts';
}

/**
 * Get language for syntax highlighting
 */
function getLanguageForFramework(framework: string): string {
  const languages: Record<string, string> = {
    react: 'typescript',
    vue: 'vue',
    svelte: 'svelte',
    unity: 'csharp',
    unreal: 'cpp',
  };
  return languages[framework] || 'typescript';
}

/**
 * Get language from filename
 */
function getLanguageFromFilename(filename: string, framework: string): string {
  if (filename.includes('.tsx') || filename.includes('.ts')) return 'typescript';
  if (filename.includes('.jsx') || filename.includes('.js')) return 'javascript';
  if (filename.includes('.cs')) return 'csharp';
  if (filename.includes('.cpp') || filename.includes('.h')) return 'cpp';
  if (filename.includes('.py')) return 'python';
  if (filename.includes('.vue')) return 'vue';
  if (filename.includes('.svelte')) return 'svelte';
  if (filename.includes('.json')) return 'json';
  return getLanguageForFramework(framework);
}
