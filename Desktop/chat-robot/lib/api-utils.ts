import { NextRequest } from 'next/server';
import { 
  getAllPersonas as getAllPersonasPG, 
  getPersona as getPersonaPG,
  saveMessage as saveMessagePG,
  createSession as createSessionPG
} from './postgres';
import { initDatabase } from './postgres';
import { Persona } from '@/types';

// 速率限制器
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '900000'); // 15分钟
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100');

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limitInfo = rateLimitMap.get(ip);

  if (!limitInfo || now - limitInfo.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (limitInfo.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limitInfo.count++;
  rateLimitMap.set(ip, limitInfo);
  return true;
}

// 获取客户端IP
export function getClientIp(req: NextRequest): string {
  return (
    req.ip ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    'unknown'
  );
}

// 敏感词过滤
export function filterSensitiveContent(text: string): string {
  const sensitiveWords = [
    // 这里可以添加敏感词列表
    '违法', '违规', '攻击', '暴力', '仇恨'
  ];

  let filteredText = text;
  sensitiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });

  return filteredText;
}

// 获取人格数据
export async function getPersona(personaId: string): Promise<Persona | null> {
  return getPersonaPG(personaId);
}

// 获取所有人格
export async function getAllPersonas(): Promise<Persona[]> {
  return getAllPersonasPG();
}

// 保存消息到数据库
export async function saveMessage(
  sessionId: string,
  personaId: string,
  role: 'user' | 'assistant',
  content: string,
  emotion?: string
): Promise<void> {
  return saveMessagePG(sessionId, personaId, role, content, emotion);
}

// 创建新会话
export async function createSession(personaId: string, title: string = '新对话'): Promise<string> {
  return createSessionPG(personaId, title);
}