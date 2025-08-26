import { NextRequest, NextResponse } from 'next/server';
import { emotionAnalyzer } from '@/lib/emotion';
import { getPersona, checkRateLimit, getClientIp } from '@/lib/api-utils';
import { initDatabase } from '@/lib/postgres';

// 确保数据库初始化
initDatabase().then(() => {
  console.log('PostgreSQL数据库初始化成功');
}).catch((error) => {
  console.error('PostgreSQL数据库初始化失败:', error);
});

export async function POST(req: NextRequest) {
  try {
    // 检查速率限制
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    const { text, personaId } = await req.json();
    
    if (!text) {
      return NextResponse.json(
        { error: '缺少文本参数' },
        { status: 400 }
      );
    }

    // 获取人格配置（如果有的话）
    let personaEmotionMap = {};
    if (personaId) {
      const persona = await getPersona(personaId);
      if (persona) {
        personaEmotionMap = persona.emotionMap;
      }
    }

    // 分析情绪
    const useModel = process.env.SENTIMENT_API_KEY !== undefined;
    const emotion = await emotionAnalyzer.analyze(text, useModel);
    const emoji = emotionAnalyzer.getEmoji(emotion, personaEmotionMap);

    return NextResponse.json({
      emotion,
      confidence: 0.9, // 模拟置信度
      emoji
    });

  } catch (error) {
    console.error('情绪分析失败:', error);
    return NextResponse.json(
      { error: '情绪分析失败' },
      { status: 500 }
    );
  }
}