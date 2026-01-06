/**
 * GEMINI API SERVICE
 * Fallback cloud AI using platform owner's Gemini API key
 * Available to all users for core platform features
 */

export interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiChatRequest {
  messages: GeminiMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class GeminiService {
  private API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  }

  /**
   * Check if Gemini is available (always true since it's server-side)
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Send chat completion request to Gemini via secure API route
   * This keeps the admin API key server-side only
   */
  async chat(request: GeminiChatRequest): Promise<GeminiChatResponse> {
    try {
      // Call our secure API route (server-side only)
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages,
          temperature: request.temperature || 0.7,
          maxTokens: request.maxTokens || 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gemini API request failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('[Gemini] Chat error:', error);
      throw new Error(error.message || 'Failed to get Gemini response');
    }
  }

  /**
   * Stream chat completion (for real-time responses)
   */
  async *streamChat(request: GeminiChatRequest): AsyncGenerator<string> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const geminiMessages = this.convertToGeminiFormat(request.messages);

      const response = await fetch(
        `${this.API_ENDPOINT}/models/gemini-2.0-flash-exp:streamGenerateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxTokens || 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Gemini streaming failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove "data: " prefix
              const data = JSON.parse(jsonStr);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                yield text;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[Gemini] Stream error:', error);
      throw new Error(error.message || 'Failed to stream Gemini response');
    }
  }

  /**
   * Convert standard messages to Gemini format
   */
  private convertToGeminiFormat(messages: GeminiMessage[]): any[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  /**
   * Generate image description (vision capability)
   */
  async analyzeImage(imageUrl: string, prompt: string = 'Describe this image in detail'): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Fetch image as base64
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const base64 = await this.blobToBase64(imageBlob);

      const response = await fetch(
        `${this.API_ENDPOINT}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: imageBlob.type,
                      data: base64.split(',')[1], // Remove data URL prefix
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Image analysis failed');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not analyze image';
    } catch (error: any) {
      console.error('[Gemini] Image analysis error:', error);
      throw new Error(error.message || 'Failed to analyze image');
    }
  }

  /**
   * Helper: Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Generate code
   */
  async generateCode(prompt: string, language: string = 'typescript'): Promise<string> {
    const response = await this.chat({
      messages: [
        {
          role: 'user',
          content: `Generate ${language} code for: ${prompt}\n\nProvide only the code, no explanations.`,
        },
      ],
      temperature: 0.2, // Lower temp for more deterministic code
    });

    return response.content;
  }

  /**
   * Creative writing assistant
   */
  async createStory(prompt: string, style: string = 'fantasy'): Promise<string> {
    const response = await this.chat({
      messages: [
        {
          role: 'user',
          content: `Write a ${style} story based on: ${prompt}\n\nMake it engaging and creative.`,
        },
      ],
      temperature: 0.9, // Higher temp for more creativity
    });

    return response.content;
  }

  /**
   * AI companion personality response
   */
  async companionChat(
    companionName: string,
    personality: string,
    userMessage: string,
    conversationHistory: GeminiMessage[] = []
  ): Promise<string> {
    const systemPrompt = `You are ${companionName}, an AI companion with the following personality: ${personality}.
Stay in character and be helpful, friendly, and engaging. Keep responses concise but meaningful.`;

    const messages: GeminiMessage[] = [
      { role: 'user', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await this.chat({
      messages,
      temperature: 0.8,
    });

    return response.content;
  }
}

export const geminiService = new GeminiService();
