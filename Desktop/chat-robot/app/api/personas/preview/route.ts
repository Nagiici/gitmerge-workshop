import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/lib/llm';
import { emotionAnalyzer } from '@/lib/emotion';
import { filterSensitiveContent } from '@/lib/api-utils';
import { ToneConfig } from '@/types';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { persona, message, options = {} } = await request.json();
    
    if (!persona || !message) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 过滤敏感内容
    const filteredMessage = filterSensitiveContent(message);
    
    // 构建完整的人格配置
    const fullPersona = {
      ...persona,
      emotionMap: persona.reactionMap || persona.emotionMap
    };

    const startTime = Date.now();
    
    // 获取AI响应
    const llmResponse = await llmService.getResponse(fullPersona, filteredMessage);
    
    const responseTime = Date.now() - startTime;
    
    // 分析情绪
    const emotion = await emotionAnalyzer.analyze(llmResponse.content);
    const emoji = emotionAnalyzer.getEmoji(emotion, fullPersona.emotionMap);

    // 计算统计指标
    const metrics = calculateMetrics(llmResponse.content, responseTime);
    
    // 计算一致性得分
    const adherenceScore = calculateAdherenceScore(llmResponse.content, persona);

    const result = {
      content: llmResponse.content,
      emotion,
      emoji,
      metrics: {
        ...metrics,
        adherenceScore,
        responseTime,
        cost: estimateCost(llmResponse.content)
      },
      reactionTag: emotion
    };

    logger.info('人格预览请求完成', { personaId: persona.id, responseTime });
    return NextResponse.json(result);
  } catch (error) {
    logger.error('人格预览失败', { error });
    return NextResponse.json(
      { error: '预览失败' },
      { status: 500 }
    );
  }
}

function calculateMetrics(content: string, responseTime: number) {
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const emojis = content.match(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu) || [];
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  return {
    tokenCount: Math.ceil(content.length / 4), // 粗略估算
    wordCount: words.length,
    emojiCount: emojis.length,
    paragraphCount: paragraphs.length,
    responseTime
  };
}

function calculateAdherenceScore(content: string, persona: any): number {
  let score = 1.0;
  
  // 基于语气配置评分
  const tone = persona.tone as ToneConfig;
  if (tone) {
    // 检查正式度
    const formalWords = ['您', '请', '谢谢', '抱歉'];
    const informalWords = ['哈哈', '嘻嘻', '呀', '啊'];
    const formalCount = formalWords.reduce((count, word) => count + (content.split(word).length - 1), 0);
    const informalCount = informalWords.reduce((count, word) => count + (content.split(word).length - 1), 0);
    
    const actualFormality = formalCount > informalCount ? 0.8 : 0.2;
    const expectedFormality = tone.formal;
    score *= 1 - Math.abs(actualFormality - expectedFormality) * 0.5;
  }

  // 检查禁忌词
  if (persona.donts) {
    const donts = Array.isArray(persona.donts) ? persona.donts : [];
    donts.forEach((dont: string) => {
      if (content.toLowerCase().includes(dont.toLowerCase())) {
        score *= 0.7; // 使用禁忌词降低得分
      }
    });
  }

  // 检查鼓励词
  if (persona.dos) {
    const dos = Array.isArray(persona.dos) ? persona.dos : [];
    let dosFound = 0;
    dos.forEach((doItem: string) => {
      if (content.toLowerCase().includes(doItem.toLowerCase())) {
        dosFound++;
      }
    });
    if (dos.length > 0) {
      score *= 0.8 + (dosFound / dos.length) * 0.2; // 使用鼓励词提高得分
    }
  }

  return Math.max(0, Math.min(1, score));
}

function estimateCost(content: string): number {
  // 粗略的成本估算，基于token数
  const tokens = Math.ceil(content.length / 4);
  const costPerToken = 0.00001; // 假设每token 0.01分钱
  return tokens * costPerToken;
}