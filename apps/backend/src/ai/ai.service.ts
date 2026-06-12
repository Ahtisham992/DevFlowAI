import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';

interface OllamaResponse {
  message?: {
    content?: string;
  };
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async streamChat(
    userId: string,
    body: { conversationId?: string; message: string; model?: string },
    res: Response,
  ) {
    const { message, model = 'llama3' } = body;
    let { conversationId } = body;
    let conversationTitle = '';

    if (!conversationId) {
      conversationTitle = message.substring(0, 40) + '...';
      const conv = await this.prisma.conversation.create({
        data: { title: conversationTitle, model, userId },
      });
      conversationId = conv.id;
    } else {
      const conv = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conv) throw new NotFoundException('Conversation not found');
      if (conv.userId !== userId) throw new ForbiddenException();
    }

    await this.prisma.message.create({
      data: { role: 'user', content: message, conversationId },
    });

    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    // Context trimming: Keep only the last 10 messages to prevent token overflow
    const recentHistory = history.slice(-10);

    const messages = recentHistory.map((m) => ({ role: m.role, content: m.content }));
    messages.unshift({
      role: 'system',
      content:
        'You are DevFlow AI, a highly skilled and helpful senior software engineer. Provide clear, concise answers with accurate code examples when needed. Format your code blocks with the correct language identifiers.',
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send the conversation ID back immediately so the client can update its URL
    res.write(
      `data: ${JSON.stringify({ conversationId, title: conversationTitle })}\n\n`,
    );

    try {
      const ollamaRes = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true }),
      });

      if (!ollamaRes.body) throw new Error('No body in response');

      let assistantMessage = '';
      const reader = ollamaRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.trim() !== '');

        for (const line of lines) {
          try {
            const data = JSON.parse(line) as OllamaResponse;
            if (data.message && data.message.content) {
              const content = data.message.content;
              assistantMessage += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // Ignore partial JSON parsing errors in stream
          }
        }
      }

      await this.prisma.message.create({
        data: { role: 'assistant', content: assistantMessage, conversationId },
      });

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error('Ollama stream error:', error);
      res.write(
        `data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`,
      );
      res.end();
    }
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, model: true, updatedAt: true },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.userId !== userId) throw new ForbiddenException();

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
  async analyzeCode(code: string, model = 'llama3') {
    const prompt = `
You are an expert code reviewer. Analyze the following code.
Return ONLY valid JSON with this exact structure:
{
  "summary": "A brief summary of what the code does",
  "issues": [
    { "type": "bug", "description": "...", "line": 10 }
  ],
  "suggestions": ["..."],
  "complexity": "O(n)"
}
The 'type' for issues can be 'bug', 'security', 'performance', or 'style'.
If there are no issues, return an empty array for issues.
Do not wrap the JSON in Markdown backticks. Just output raw JSON.

Code to analyze:
${code}
`;

    try {
      const res = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          format: 'json',
          stream: false,
        }),
      });

      if (!res.ok) throw new Error('Ollama request failed');
      const data = await res.json();
      return JSON.parse(data.response);
    } catch (error) {
      console.error('Code analysis failed:', error);
      throw new Error('Failed to analyze code');
    }
  }

  async debugCode(code: string, errorMessage: string, model = 'llama3') {
    const prompt = `
You are an expert software engineer and debugger.
Analyze the following code and the associated error message.
Return ONLY valid JSON with this exact structure:
{
  "rootCause": "Explanation of why the error occurs",
  "solution": "High level description of how to fix it",
  "fixedCode": "The corrected code snippet"
}
Do not wrap the JSON in Markdown backticks. Just output raw JSON.

Code:
${code}

Error Message:
${errorMessage}
`;

    try {
      const res = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, format: 'json', stream: false }),
      });
      if (!res.ok) throw new Error('Ollama request failed');
      const data = await res.json();
      return JSON.parse(data.response);
    } catch (error) {
      console.error('Code debugging failed:', error);
      throw new Error('Failed to debug code');
    }
  }

  async generateDocs(code: string, model = 'llama3') {
    const prompt = `
You are a technical writer and senior developer.
Generate comprehensive markdown documentation for the following code.
Include:
- A high-level overview
- Parameters, arguments, and return types (if applicable)
- Examples of how to use it
Output ONLY the markdown documentation. Do not wrap in JSON.

Code:
${code}
`;

    try {
      const res = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false }),
      });
      if (!res.ok) throw new Error('Ollama request failed');
      const data = await res.json();
      return { documentation: data.response };
    } catch (error) {
      console.error('Docs generation failed:', error);
      throw new Error('Failed to generate documentation');
    }
  }

  async generateEmbeddings(text: string, model = 'nomic-embed-text') {
    try {
      const res = await fetch('http://127.0.0.1:11434/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: text }),
      });
      if (!res.ok) throw new Error('Ollama embeddings request failed');
      const data = await res.json();
      return { embedding: data.embedding };
    } catch (error) {
      console.error('Embeddings generation failed:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  async getModels() {
    try {
      const res = await fetch('http://127.0.0.1:11434/api/tags');
      const data = await res.json();
      return data.models || [];
    } catch {
      return [{ name: 'llama3:latest' }];
    }
  }
}
