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
    const persona = await prisma.persona.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        },
        metrics: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            sessions: true,
            messages: true
          }
        }
      }
    });

    if (!persona) {
      return NextResponse.json(
        { error: '人格不存在' },
        { status: 404 }
      );
    }

    const formattedPersona = {
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
    };

    return NextResponse.json(formattedPersona);
  } catch (error) {
    logger.error('获取人格详情失败', { error, id: params.id });
    return NextResponse.json(
      { error: '获取人格详情失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // 获取当前人格
    const currentPersona = await prisma.persona.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!currentPersona) {
      return NextResponse.json(
        { error: '人格不存在' },
        { status: 404 }
      );
    }

    // 过滤敏感内容
    const filteredSystemPrompt = data.systemPrompt ? 
      filterSensitiveContent(data.systemPrompt) : undefined;

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.description !== undefined) updateData.description = data.description;
    if (filteredSystemPrompt !== undefined) updateData.systemPrompt = filteredSystemPrompt;
    if (data.tone !== undefined) updateData.tone = JSON.stringify(data.tone);
    if (data.styleGuide !== undefined) updateData.styleGuide = data.styleGuide;
    if (data.dos !== undefined) updateData.dos = data.dos ? JSON.stringify(data.dos) : null;
    if (data.donts !== undefined) updateData.donts = data.donts ? JSON.stringify(data.donts) : null;
    if (data.safetyAdapter !== undefined) updateData.safetyAdapter = data.safetyAdapter;
    if (data.fewShots !== undefined) updateData.fewShots = data.fewShots ? JSON.stringify(data.fewShots) : null;
    if (data.reactionMap !== undefined) updateData.reactionMap = JSON.stringify(data.reactionMap);
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    // 更新人格
    const updatedPersona = await prisma.persona.update({
      where: { id: params.id },
      data: updateData
    });

    // 创建新版本（如果有实质性更改）
    const hasSignificantChanges = 
      data.systemPrompt !== undefined ||
      data.tone !== undefined ||
      data.fewShots !== undefined ||
      data.styleGuide !== undefined;

    if (hasSignificantChanges) {
      const latestVersion = currentPersona.versions[0]?.version || 0;
      await prisma.personaVersion.create({
        data: {
          personaId: params.id,
          version: latestVersion + 1,
          name: updatedPersona.name,
          avatar: updatedPersona.avatar,
          tags: updatedPersona.tags,
          description: updatedPersona.description,
          systemPrompt: updatedPersona.systemPrompt,
          tone: updatedPersona.tone,
          styleGuide: updatedPersona.styleGuide,
          dos: updatedPersona.dos,
          donts: updatedPersona.donts,
          safetyAdapter: updatedPersona.safetyAdapter,
          fewShots: updatedPersona.fewShots,
          reactionMap: updatedPersona.reactionMap,
          changeLog: data.changeLog || '更新人格配置'
        }
      });
    }

    const result = {
      ...updatedPersona,
      tags: JSON.parse(updatedPersona.tags),
      tone: JSON.parse(updatedPersona.tone),
      dos: updatedPersona.dos ? JSON.parse(updatedPersona.dos) : undefined,
      donts: updatedPersona.donts ? JSON.parse(updatedPersona.donts) : undefined,
      fewShots: updatedPersona.fewShots ? JSON.parse(updatedPersona.fewShots) : undefined,
      reactionMap: JSON.parse(updatedPersona.reactionMap)
    };

    logger.info(`更新人格成功: ${updatedPersona.name}`);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('更新人格失败', { error, id: params.id });
    return NextResponse.json(
      { error: '更新人格失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.persona.delete({
      where: { id: params.id }
    });

    logger.info(`删除人格成功: ${params.id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('删除人格失败', { error, id: params.id });
    return NextResponse.json(
      { error: '删除人格失败' },
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