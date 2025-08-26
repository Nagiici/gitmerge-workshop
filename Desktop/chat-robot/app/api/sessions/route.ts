import { NextRequest, NextResponse } from 'next/server';
import pool, { createSession } from '@/lib/postgres';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // 获取所有会话，按更新时间倒序排列
      const result = await client.query(`
        SELECT 
          s.id,
          s.persona_id as "personaId",
          s.title,
          s.created_at as "createdAt",
          s.updated_at as "updatedAt",
          COUNT(m.id) as "messageCount",
          p.name as "personaName",
          p.avatar as "personaAvatar"
        FROM sessions s
        LEFT JOIN messages m ON s.id = m.session_id
        LEFT JOIN personas p ON s.persona_id = p.id
        GROUP BY s.id, p.name, p.avatar
        ORDER BY s.updated_at DESC
      `);

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return NextResponse.json(
      { error: '获取会话列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { personaId, title } = await request.json();

    if (!personaId) {
      return NextResponse.json(
        { error: 'personaId 是必需的' },
        { status: 400 }
      );
    }

    const sessionId = await createSession(personaId, title || '新对话');
    
    return NextResponse.json({ 
      id: sessionId,
      personaId,
      title: title || '新对话'
    });
  } catch (error) {
    console.error('创建会话失败:', error);
    return NextResponse.json(
      { error: '创建会话失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId 是必需的' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // 先删除相关消息
      await client.query('DELETE FROM messages WHERE session_id = $1', [sessionId]);
      
      // 再删除会话
      await client.query('DELETE FROM sessions WHERE id = $1', [sessionId]);

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('删除会话失败:', error);
    return NextResponse.json(
      { error: '删除会话失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title } = await request.json();

    if (!id || !title) {
      return NextResponse.json(
        { error: 'id 和 title 都是必需的' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query(
        'UPDATE sessions SET title = $1, updated_at = NOW() WHERE id = $2',
        [title, id]
      );

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('更新会话标题失败:', error);
    return NextResponse.json(
      { error: '更新会话标题失败' },
      { status: 500 }
    );
  }
}