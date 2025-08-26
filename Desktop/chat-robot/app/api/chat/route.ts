import { NextRequest } from 'next/server';
import { llmService } from '@/lib/llm';
import { emotionAnalyzer } from '@/lib/emotion';
import { getPersona, saveMessage, createSession, checkRateLimit, getClientIp, filterSensitiveContent } from '@/lib/api-utils';
import { initDatabase } from '@/lib/postgres';

// 确保数据库初始化
initDatabase().then(() => {
  console.log('PostgreSQL数据库初始化成功');
}).catch((error) => {
  console.error('PostgreSQL数据库初始化失败:', error);
});

export async function POST(req: NextRequest) {
  // 设置SSE响应头
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // 创建转换流用于SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // 立即返回响应，保持连接打开
  const response = new Response(stream.readable, { headers });

  // 在后台处理请求
  processRequest(req, writer, encoder).catch(error => {
    console.error('聊天处理错误:', error);
    writer.write(encoder.encode(`data: ${JSON.stringify({
      error: '处理请求时发生错误',
      done: true
    })}\n\n`));
    writer.close();
  });

  return response;
}

async function processRequest(
  req: NextRequest,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  try {
    // 检查速率限制
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp)) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        error: '请求过于频繁，请稍后再试',
        done: true
      })}\n\n`));
      await writer.close();
      return;
    }

    const { personaId, message, sessionId } = await req.json();
    
    if (!personaId || !message) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        error: '缺少必要参数',
        done: true
      })}\n\n`));
      await writer.close();
      return;
    }

    // 过滤敏感内容
    const filteredMessage = filterSensitiveContent(message);
    
    // 获取人格配置
    const persona = await getPersona(personaId);
    if (!persona) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        error: '未找到指定人格',
        done: true
      })}\n\n`));
      await writer.close();
      return;
    }

    // 创建或使用现有会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await createSession(personaId, filteredMessage.slice(0, 50));
    }

    // 保存用户消息
    await saveMessage(currentSessionId, personaId, 'user', filteredMessage);

    // 获取AI响应
    const llmResponse = await llmService.getResponse(persona, filteredMessage);
    
    // 分析情绪
    const emotion = await emotionAnalyzer.analyze(llmResponse.content);
    const emoji = emotionAnalyzer.getEmoji(emotion, persona.emotionMap);

    // 保存AI消息
    await saveMessage(currentSessionId, personaId, 'assistant', llmResponse.content, emotion);

    // 流式发送响应
    await writer.write(encoder.encode(`data: ${JSON.stringify({
      content: llmResponse.content,
      emotion,
      emoji,
      sessionId: currentSessionId,
      done: true
    })}\n\n`));

    await writer.close();

  } catch (error) {
    console.error('聊天处理错误:', error);
    await writer.write(encoder.encode(`data: ${JSON.stringify({
      error: '处理请求时发生错误',
      done: true
    })}\n\n`));
    await writer.close();
  }
}