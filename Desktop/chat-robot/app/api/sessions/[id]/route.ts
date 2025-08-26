import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    const client = await pool.connect();
    
    try {
      // 获取会话详情
      const sessionResult = await client.query(
        `SELECT 
           s.id,
           s.persona_id as "personaId",
           s.title,
           s.created_at as "createdAt",
           s.updated_at as "updatedAt",
           p.name as "personaName",
           p.avatar as "personaAvatar"
         FROM sessions s
         LEFT JOIN personas p ON s.persona_id = p.id
         WHERE s.id = $1`,
        [sessionId]
      );

      if (sessionResult.rows.length === 0) {
        return NextResponse.json(
          { error: '会话不存在' },
          { status: 404 }
        );
      }

      // 获取会话消息
      const messagesResult = await client.query(
        `SELECT 
           id,
           role,
           content,
           emotion,
           created_at as "timestamp"
         FROM messages 
         WHERE session_id = $1 
         ORDER BY created_at ASC`,
        [sessionId]
      );

      return NextResponse.json({
        session: sessionResult.rows[0],
        messages: messagesResult.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('获取会话详情失败:', error);
    return NextResponse.json(
      { error: '获取会话详情失败' },
      { status: 500 }
    );
  }
}