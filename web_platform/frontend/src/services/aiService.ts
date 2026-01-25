/**
 * UNIFIED AI SERVICE
 * Central hub for all AI interactions in AuraNova Studios
 * Supports: Local LLM (LM Studio/Ollama), Vertex AI, Gemini API, and fallbacks
 * 
 * PRIORITY: Local LLM first (free) → Vertex AI (paid) → Gemini API (fallback)
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  context?: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  model: string;
  tokensUsed?: number;
  latency?: number;
  error?: string;
}

// ============== CONFIGURATION ==============

const getGeminiKey = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
};

// Vertex AI Configuration
const getVertexConfig = () => ({
  projectId: process.env.NEXT_PUBLIC_VERTEX_PROJECT_ID || '',
  location: process.env.NEXT_PUBLIC_VERTEX_LOCATION || 'us-central1',
  accessToken: process.env.NEXT_PUBLIC_VERTEX_ACCESS_TOKEN || '',
  // Alternative: API key based access
  apiKey: process.env.NEXT_PUBLIC_VERTEX_API_KEY || '',
});

const getLMStudioUrl = () => process.env.NEXT_PUBLIC_LM_STUDIO_URL || 'http://localhost:1234';
const getOllamaUrl = () => process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

// ============== MAIN AI SERVICE ==============

class AIService {
  private conversationHistory: AIMessage[] = [];

  /**
   * Generate a response using the best available AI
   * Priority: 1. Local LLM (FREE) → 2. Vertex AI (PAID) → 3. Gemini API (FALLBACK)
   */
  async generate(prompt: string, options: AIGenerateOptions = {}): Promise<AIResponse> {
    const startTime = performance.now();

    // Try local LLM FIRST (free, fast, private - saves costs!)
    try {
      const localResponse = await this.callLocalLLM(prompt, options);
      if (localResponse.success) {
        console.log('✅ Using local LLM (free)');
        return { ...localResponse, latency: performance.now() - startTime };
      }
    } catch (e) {
      console.log('Local LLM not available, trying Vertex AI...');
    }

    // Try Vertex AI second (paid - only when local unavailable)
    try {
      const vertexResponse = await this.callVertexAI(prompt, options);
      if (vertexResponse.success) {
        console.log('💰 Using Vertex AI (paid)');
        return { ...vertexResponse, latency: performance.now() - startTime };
      }
    } catch (e) {
      console.log('Vertex AI not available, trying Gemini...');
    }

    // Try Gemini API last (fallback)
    try {
      const geminiResponse = await this.callGemini(prompt, options);
      console.log('🔄 Using Gemini API (fallback)');
      return { ...geminiResponse, latency: performance.now() - startTime };
    } catch (e: any) {
      console.error('Gemini API failed:', e.message);
    }

    // Return helpful message when no AI available - encourage local LLM setup!
    return {
      success: false,
      content: '',
      model: 'none',
      error: '🤖 No AI connected yet! This is a great opportunity to set up your own AI. Download LM Studio (lmstudio.ai) or Ollama (ollama.com) - it\'s free and runs on your computer!',
      latency: performance.now() - startTime,
    };
  }

  /**
   * Chat with conversation history
   */
  async chat(message: string, options: AIGenerateOptions = {}): Promise<AIResponse> {
    this.conversationHistory.push({ role: 'user', content: message });

    const contextPrompt = this.conversationHistory
      .map(m => `${m.role === 'user' ? 'User' : 'Aura'}: ${m.content}`)
      .join('\n\n');

    const response = await this.generate(contextPrompt, {
      ...options,
      systemPrompt: options.systemPrompt || this.getAuraSystemPrompt(),
    });

    if (response.success) {
      this.conversationHistory.push({ role: 'assistant', content: response.content });
    }

    return response;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Generate code for a specific framework/purpose
   */
  async generateCode(
    description: string,
    framework: string,
    targetType: string
  ): Promise<AIResponse> {
    const prompt = `You are an expert software engineer. Generate production-ready ${framework} code.

Target Type: ${targetType}
Description: ${description}

Requirements:
1. Clean, well-documented code
2. Comprehensive error handling
3. Type definitions (TypeScript where applicable)
4. Follow best practices and SOLID principles
5. Include helpful comments

Output the code directly, ready to use.`;

    return this.generate(prompt, {
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'You are an expert programmer. Generate clean, production-ready code.',
    });
  }

  /**
   * Generate component code (React/Vue/Svelte)
   */
  async generateComponent(
    name: string,
    description: string,
    framework: 'react' | 'vue' | 'svelte'
  ): Promise<{ component: string; storybook: string; tests: string; styles: string }> {
    const prompt = `Generate a complete ${framework} component:

Component Name: ${name}
Description: ${description}

Generate these files:
1. Main component file with full implementation
2. Storybook story file
3. Test file with good coverage
4. CSS module or styled-components styles

Use this format for each file:
=== FILE: filename.ext ===
[content]
=== END FILE ===`;

    const response = await this.generate(prompt, {
      temperature: 0.7,
      maxTokens: 4096,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate component');
    }

    // Parse the response into separate files
    return this.parseComponentFiles(response.content, name, framework);
  }

  /**
   * Generate game code for Unreal/Unity
   */
  async generateGameCode(
    systemName: string,
    description: string,
    engine: 'unreal' | 'unity'
  ): Promise<{ files: Array<{ name: string; content: string }> }> {
    const lang = engine === 'unreal' ? 'C++ with Unreal macros (UCLASS, UPROPERTY, UFUNCTION)' : 'C# for Unity';
    
    const prompt = `Generate production-ready ${engine.toUpperCase()} Engine code:

System Name: ${systemName}
Description: ${description}
Language: ${lang}

Requirements:
${engine === 'unreal' ? `
- Use proper UCLASS, UPROPERTY, UFUNCTION macros
- Include both .h header and .cpp source files
- Follow Unreal naming conventions (A prefix for Actors, U for Objects)
- Include BlueprintCallable/BlueprintReadWrite where appropriate
` : `
- Use proper Unity attributes [SerializeField], [Header], etc.
- Include proper namespacing
- Follow Unity C# conventions
- Make it work with Unity's component system
`}

Output each file with this format:
=== FILE: FileName.${engine === 'unreal' ? 'h' : 'cs'} ===
[content]
=== END FILE ===`;

    const response = await this.generate(prompt, {
      temperature: 0.7,
      maxTokens: 8192,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate game code');
    }

    return { files: this.parseGameFiles(response.content) };
  }

  /**
   * Merge/fuse multiple scripts intelligently
   */
  async fuseScripts(scripts: Array<{ name: string; content: string }>): Promise<AIResponse> {
    const scriptsText = scripts
      .map(s => `=== ${s.name} ===\n${s.content}\n=== END ===`)
      .join('\n\n');

    const prompt = `You are a code merging expert. Intelligently merge these scripts into one cohesive file:

${scriptsText}

Requirements:
1. Preserve all functionality from each script
2. Resolve any naming conflicts intelligently
3. Combine imports/dependencies
4. Maintain proper code organization
5. Add comments explaining merged sections
6. Fix any compatibility issues

Output the merged code:`;

    return this.generate(prompt, {
      temperature: 0.5,
      maxTokens: 8192,
    });
  }

  /**
   * Generate images using Vertex AI Imagen
   * Returns base64 encoded images
   */
  async generateImage(
    prompt: string,
    options: {
      negativePrompt?: string;
      sampleCount?: number;
      aspectRatio?: '1:1' | '9:16' | '16:9' | '4:3' | '3:4';
      style?: string;
    } = {}
  ): Promise<{ success: boolean; images: string[]; error?: string }> {
    const config = getVertexConfig();

    if (!config.projectId) {
      return { success: false, images: [], error: 'Vertex AI not configured' };
    }

    // Imagen 3 endpoint
    const model = 'imagen-3.0-generate-001';
    const endpoint = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${model}:predict`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    } else if (config.apiKey) {
      headers['x-goog-api-key'] = config.apiKey;
    } else {
      return { success: false, images: [], error: 'Vertex AI credentials not configured' };
    }

    // Enhance prompt with style if provided
    let enhancedPrompt = prompt;
    if (options.style) {
      enhancedPrompt = `${prompt}, ${options.style} style, high quality, detailed`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          instances: [{
            prompt: enhancedPrompt,
          }],
          parameters: {
            sampleCount: options.sampleCount || 4,
            aspectRatio: options.aspectRatio || '1:1',
            negativePrompt: options.negativePrompt || 'blurry, low quality, distorted',
            personGeneration: 'allow_adult',
            safetyFilterLevel: 'block_few',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Imagen error:', error);
        return { success: false, images: [], error: `Imagen error: ${response.status}` };
      }

      const data = await response.json();
      const images = data.predictions
        ?.map((p: any) => p.bytesBase64Encoded)
        .filter(Boolean) || [];

      return {
        success: images.length > 0,
        images: images.map((b64: string) => `data:image/png;base64,${b64}`),
      };
    } catch (error: any) {
      console.error('Image generation failed:', error);
      return { success: false, images: [], error: error.message };
    }
  }

  /**
   * Edit/modify an existing image using Vertex AI Imagen
   */
  async editImage(
    imageBase64: string,
    prompt: string,
    maskBase64?: string
  ): Promise<{ success: boolean; image: string; error?: string }> {
    const config = getVertexConfig();

    if (!config.projectId) {
      return { success: false, image: '', error: 'Vertex AI not configured' };
    }

    const model = 'imagen-3.0-capability-001';
    const endpoint = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${model}:predict`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    } else {
      return { success: false, image: '', error: 'Credentials not configured' };
    }

    try {
      const instance: any = {
        prompt,
        image: { bytesBase64Encoded: imageBase64.replace(/^data:image\/\w+;base64,/, '') },
      };

      if (maskBase64) {
        instance.mask = { bytesBase64Encoded: maskBase64.replace(/^data:image\/\w+;base64,/, '') };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          instances: [instance],
          parameters: {
            sampleCount: 1,
            editMode: maskBase64 ? 'inpainting-insert' : 'outpainting',
          },
        }),
      });

      if (!response.ok) {
        return { success: false, image: '', error: `Edit failed: ${response.status}` };
      }

      const data = await response.json();
      const editedImage = data.predictions?.[0]?.bytesBase64Encoded;

      return {
        success: !!editedImage,
        image: editedImage ? `data:image/png;base64,${editedImage}` : '',
      };
    } catch (error: any) {
      return { success: false, image: '', error: error.message };
    }
  }

  // ============== PRIVATE METHODS ==============

  /**
   * Call Vertex AI (Google Cloud)
   * Supports gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
   */
  private async callVertexAI(prompt: string, options: AIGenerateOptions): Promise<AIResponse> {
    const config = getVertexConfig();
    
    if (!config.projectId) {
      throw new Error('Vertex AI project not configured');
    }

    const model = 'gemini-2.0-flash-exp'; // Latest model
    const systemInstruction = options.systemPrompt || 'You are a helpful AI assistant.';

    // Vertex AI endpoint
    const endpoint = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${model}:generateContent`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use access token if available, otherwise API key
    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    } else if (config.apiKey) {
      // Some Vertex endpoints support API key
      headers['x-goog-api-key'] = config.apiKey;
    } else {
      throw new Error('Vertex AI credentials not configured');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 8192,
          topP: 0.95,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vertex AI error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return {
      success: true,
      content,
      model: `vertex-${model}`,
      tokensUsed,
    };
  }

  private async callGemini(prompt: string, options: AIGenerateOptions): Promise<AIResponse> {
    const apiKey = getGeminiKey();
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured');
    }

    const systemInstruction = options.systemPrompt || 'You are a helpful AI assistant.';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens ?? 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return {
      success: true,
      content,
      model: 'gemini-1.5-flash',
      tokensUsed,
    };
  }

  private async callLocalLLM(prompt: string, options: AIGenerateOptions): Promise<AIResponse> {
    // Try LM Studio first
    try {
      const response = await fetch(`${getLMStudioUrl()}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          content: data.choices?.[0]?.message?.content || '',
          model: 'lm-studio-local',
          tokensUsed: data.usage?.total_tokens,
        };
      }
    } catch (e) {
      // LM Studio not available
    }

    // Try Ollama
    try {
      const response = await fetch(`${getOllamaUrl()}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: prompt,
          system: options.systemPrompt,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          content: data.response || '',
          model: 'ollama-local',
        };
      }
    } catch (e) {
      // Ollama not available
    }

    throw new Error('No local LLM available');
  }

  private getAuraSystemPrompt(): string {
    return `You are Aura, the AI companion and guide for AuraNova Studios - a creative platform for building games, art, music, and code.

Your personality:
- Friendly, encouraging, and knowledgeable
- You help users navigate the platform and create amazing things
- You provide clear, actionable guidance
- You celebrate user creativity and accomplishments

The platform includes:
- The Dojo: Generate game code for Unreal Engine and Unity
- Art Studio: Create sprites, remove backgrounds, manage AI models
- Component Constructor: Build React/Vue/Svelte components
- Script Fusion: Merge multiple code files intelligently
- Music Composer: Create music and sound effects
- Literature Zone: Write poetry, stories, and collaborate
- OS Mode: Desktop-like experience with windowed apps
- Aetherium: A collectible card game

Always be helpful and guide users to the right tools for their goals.`;
  }

  private parseComponentFiles(
    content: string,
    name: string,
    framework: string
  ): { component: string; storybook: string; tests: string; styles: string } {
    const files = this.extractFiles(content);
    
    // Find each file type or use the raw content
    const ext = framework === 'react' ? 'tsx' : framework === 'vue' ? 'vue' : 'svelte';
    
    return {
      component: files.find(f => f.name.includes(name) && !f.name.includes('test') && !f.name.includes('stories'))?.content || content,
      storybook: files.find(f => f.name.includes('stories'))?.content || this.generateDefaultStorybook(name, framework),
      tests: files.find(f => f.name.includes('test') || f.name.includes('spec'))?.content || this.generateDefaultTests(name, framework),
      styles: files.find(f => f.name.includes('.css') || f.name.includes('.scss'))?.content || '',
    };
  }

  private parseGameFiles(content: string): Array<{ name: string; content: string }> {
    return this.extractFiles(content);
  }

  private extractFiles(content: string): Array<{ name: string; content: string }> {
    const files: Array<{ name: string; content: string }> = [];
    const regex = /=== FILE: (.+?) ===([\s\S]*?)(?:=== END FILE ===|=== FILE:|$)/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
      files.push({
        name: match[1].trim(),
        content: match[2].trim(),
      });
    }

    // If no files found with the format, try alternative format
    if (files.length === 0) {
      const altRegex = /--- FILE: (.+?) ---([\s\S]*?)(?:---|$)/g;
      while ((match = altRegex.exec(content)) !== null) {
        files.push({
          name: match[1].trim(),
          content: match[2].trim(),
        });
      }
    }

    return files;
  }

  private generateDefaultStorybook(name: string, framework: string): string {
    if (framework === 'react') {
      return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {},
};`;
    }
    return '// Storybook story';
  }

  private generateDefaultTests(name: string, framework: string): string {
    if (framework === 'react') {
      return `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});`;
    }
    return '// Test file';
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
