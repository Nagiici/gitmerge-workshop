import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ToneConfig, FewShotExample } from '@/types';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const versions = await prisma.personaVersion.findMany({
      where: { personaId: params.id },
      orderBy: { version: 'desc' }
    });

    const formattedVersions = versions.map(v => ({
      ...v,
      tags: JSON.parse(v.tags),
      tone: JSON.parse(v.tone) as ToneConfig,
      dos: v.dos ? JSON.parse(v.dos) : undefined,
      donts: v.donts ? JSON.parse(v.donts) : undefined,
      fewShots: v.fewShots ? JSON.parse(v.fewShots) as FewShotExample[] : undefined,
      reactionMap: JSON.parse(v.reactionMap)
    }));

    return NextResponse.json(formattedVersions);
  } catch (error) {
    logger.error('获取人格版本列表失败', { error, personaId: params.id });
    return NextResponse.json(
      { error: '获取版本列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // 获取最新版本号
    const latestVersion = await prisma.personaVersion.findFirst({
      where: { personaId: params.id },
      orderBy: { version: 'desc' },
      select: { version: true }
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    // 过滤敏感内容
    const filteredSystemPrompt = filterSensitiveContent(data.systemPrompt);
    
    const version = await prisma.personaVersion.create({
      data: {
        personaId: params.id,
        version: newVersion,
        name: data.name,
        avatar: data.avatar,
        tags: JSON.stringify(data.tags || []),
        description: data.description,
        systemPrompt: filteredSystemPrompt,
        tone: JSON.stringify(data.tone),
        styleGuide: data.styleGuide,
        dos: data.dos ? JSON.stringify(data.dos) : null,
        donts: data.donts ? JSON.stringify(data.donts) : null,
        safetyAdapter: data.safetyAdapter,
        fewShots: data.fewShots ? JSON.stringify(data.fewShots) : null,
        reactionMap: JSON.stringify(data.reactionMap),
        changeLog: data.changeLog || `版本 ${newVersion}`
      }
    });

    const result = {
      ...version,
      tags: JSON.parse(version.tags),
      tone: JSON.parse(version.tone),
      dos: version.dos ? JSON.parse(version.dos) : undefined,
      donts: version.donts ? JSON.parse(version.donts) : undefined,
      fewShots: version.fewShots ? JSON.parse(version.fewShots) : undefined,
      reactionMap: JSON.parse(version.reactionMap)
    };

    logger.info(`创建人格版本成功: ${params.id} v${newVersion}`);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('创建人格版本失败', { error, personaId: params.id });
    return NextResponse.json(
      { error: '创建版本失败' },
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