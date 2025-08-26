import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ToneConfig, FewShotExample } from '@/types';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    logger.info('获取人格列表请求');
    
    const searchParams = request.nextUrl.searchParams;
    const isPublic = searchParams.get('public');
    const userId = searchParams.get('userId');

    let where = {};
    if (isPublic === 'true') {
      where = { isPublic: true };
    } else if (userId) {
      where = { OR: [{ userId }, { isPublic: true }] };
    }

    const personas = await prisma.persona.findMany({
      where,
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        },
        metrics: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            sessions: true,
            messages: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedPersonas = personas.map(persona => ({
      ...persona,
      tags: JSON.parse(persona.tags),
      tone: JSON.parse(persona.tone) as ToneConfig,
      dos: persona.dos ? JSON.parse(persona.dos) : undefined,
      donts: persona.donts ? JSON.parse(persona.donts) : undefined,
      fewShots: persona.fewShots ? JSON.parse(persona.fewShots) as FewShotExample[] : undefined,
      reactionMap: JSON.parse(persona.reactionMap),
      versions: persona.versions.map(v => ({
        ...v,
        tags: JSON.parse(v.tags),
        tone: JSON.parse(v.tone) as ToneConfig,
        dos: v.dos ? JSON.parse(v.dos) : undefined,
        donts: v.donts ? JSON.parse(v.donts) : undefined,
        fewShots: v.fewShots ? JSON.parse(v.fewShots) as FewShotExample[] : undefined,
        reactionMap: JSON.parse(v.reactionMap)
      }))
    }));

    logger.info(`返回 ${formattedPersonas.length} 个人格数据`);
    return NextResponse.json({ personas: formattedPersonas });
  } catch (error) {
    logger.error('获取人格列表失败', { error });
    return NextResponse.json(
      { error: '获取人格列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.info('创建新人格请求');
    const data = await request.json();
    
    // 验证必需字段
    if (!data.name || !data.systemPrompt) {
      return NextResponse.json(
        { error: '名称和系统提示词是必需的' },
        { status: 400 }
      );
    }

    // 过滤敏感内容
    const filteredSystemPrompt = filterSensitiveContent(data.systemPrompt);
    
    const defaultTone: ToneConfig = {
      gentle: 0.5,
      direct: 0.5,
      academic: 0.5,
      healing: 0.5,
      humor: 0.5,
      formal: 0.5
    };

    const defaultReactionMap = {
      happy: '😊',
      thinking: '🤔',
      surprised: '😲',
      empathetic: '🥺',
      warning: '⚠️',
      comforting: '🤗',
      neutral: '🙂'
    };

    const persona = await prisma.persona.create({
      data: {
        name: data.name,
        avatar: data.avatar || '🤖',
        tags: JSON.stringify(data.tags || []),
        description: data.description,
        systemPrompt: filteredSystemPrompt,
        tone: JSON.stringify(data.tone || defaultTone),
        styleGuide: data.styleGuide,
        dos: data.dos ? JSON.stringify(data.dos) : null,
        donts: data.donts ? JSON.stringify(data.donts) : null,
        safetyAdapter: data.safetyAdapter,
        fewShots: data.fewShots ? JSON.stringify(data.fewShots) : null,
        reactionMap: JSON.stringify(data.reactionMap || defaultReactionMap),
        isPublic: data.isPublic || false,
        userId: data.userId
      }
    });

    // 创建初始版本
    await prisma.personaVersion.create({
      data: {
        personaId: persona.id,
        version: 1,
        name: persona.name,
        avatar: persona.avatar,
        tags: persona.tags,
        description: persona.description,
        systemPrompt: persona.systemPrompt,
        tone: persona.tone,
        styleGuide: persona.styleGuide,
        dos: persona.dos,
        donts: persona.donts,
        safetyAdapter: persona.safetyAdapter,
        fewShots: persona.fewShots,
        reactionMap: persona.reactionMap,
        changeLog: '初始版本'
      }
    });

    const result = {
      ...persona,
      tags: JSON.parse(persona.tags),
      tone: JSON.parse(persona.tone),
      dos: persona.dos ? JSON.parse(persona.dos) : undefined,
      donts: persona.donts ? JSON.parse(persona.donts) : undefined,
      fewShots: persona.fewShots ? JSON.parse(persona.fewShots) : undefined,
      reactionMap: JSON.parse(persona.reactionMap)
    };

    logger.info(`创建人格成功: ${persona.name}`);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('创建人格失败', { error });
    return NextResponse.json(
      { error: '创建人格失败' },
      { status: 500 }
    );
  }
}

function filterSensitiveContent(content: string): string {
  const sensitivePatterns = [
    /hack|破解|攻击/gi,
    /恶意|病毒|木马/gi,
    /暴力|血腥|色情/gi
  ];
  
  let filtered = content;
  sensitivePatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '[已过滤]');
  });
  
  return filtered;
}