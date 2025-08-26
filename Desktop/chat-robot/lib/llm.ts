import OpenAI from 'openai';
import { Persona } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export interface LLMResponse {
  content: string;
  emotion?: string;
}

export class LLMService {
  private async callOpenAI(persona: Persona, message: string): Promise<LLMResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: persona.systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        stream: true,
        max_tokens: 500,
      });

      let fullContent = '';
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;
      }

      return { content: fullContent };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  }

  private async callLocalLLM(persona: Persona, message: string): Promise<LLMResponse> {
    // 本地LLM实现（可替换为实际本地模型调用）
    const response = await fetch(process.env.LOCAL_LLM_URL || 'http://localhost:8080/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.LOCAL_LLM_MODEL || 'local-model',
        messages: [
          { role: 'system', content: persona.systemPrompt },
          { role: 'user', content: message }
        ],
        stream: true,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || '';
              fullContent += content;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    return { content: fullContent };
  }

  async getResponse(persona: Persona, message: string): Promise<LLMResponse> {
    if (process.env.OPENAI_API_KEY) {
      return this.callOpenAI(persona, message);
    } else if (process.env.LOCAL_LLM_URL) {
      return this.callLocalLLM(persona, message);
    } else {
      // 模拟响应（用于开发测试）
      return this.getMockResponse(persona, message);
    }
  }

  private async getMockResponse(persona: Persona, message: string): Promise<LLMResponse> {
    // 模拟不同人格的响应
    const responses: Record<string, string> = {
      gentle: '你好！很高兴和你聊天。今天过得怎么样？😊',
      sassy: '哦？又来一个聊天的。说吧，我听着呢。😏',
      academic: '您好。这是一个学术性的对话开始。请问您有什么问题需要探讨？🧠',
      healing: '嗨～欢迎来到这里！希望你今天心情很好呢～ 💖'
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      content: responses[persona.id] || '你好！很高兴为你服务。',
      emotion: 'happy'
    };
  }
}

export const llmService = new LLMService();