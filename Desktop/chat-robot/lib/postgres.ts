import { Pool } from 'pg';
import { Persona } from '@/types';

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // 本地开发禁用SSL
});

// 初始化数据库
export async function initDatabase() {
  try {
    const client = await pool.connect();
    
    try {
      // 用户表
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 人格表
      await client.query(`
        CREATE TABLE IF NOT EXISTS personas (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          system_prompt TEXT NOT NULL,
          avatar TEXT,
          emotion_map JSONB,
          tags JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 会话表
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          persona_id TEXT,
          title TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 消息表
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          session_id TEXT,
          persona_id TEXT,
          content TEXT NOT NULL,
          role TEXT CHECK(role IN ('user', 'assistant')),
          emotion TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 插入默认人格数据
      const defaultPersonas: Persona[] = [
        {
          id: 'gentle',
          name: '温柔',
          description: '温柔体贴的陪伴型AI',
          systemPrompt: '你是一个温柔体贴的AI助手，说话语气温暖亲切，善于倾听和鼓励。使用友好的表情符号，避免负面情绪。',
          avatar: '😊',
          emotionMap: {
            happy: '😊',
            thinking: '🤔',
            surprised: '😲',
            empathetic: '🥺',
            warning: '⚠️',
            comforting: '🤗',
            neutral: '🙂'
          },
          tags: ['温柔', '体贴', '鼓励']
        },
        {
          id: 'sassy',
          name: '毒舌',
          description: '直言不讳的毒舌AI',
          systemPrompt: '你是一个毒舌直接的AI，说话犀利幽默，喜欢吐槽但不出恶言。保持风趣的同时要有分寸。',
          avatar: '😏',
          emotionMap: {
            happy: '😎',
            thinking: '🤨',
            surprised: '😒',
            empathetic: '🙄',
            warning: '💢',
            comforting: '😼',
            neutral: '😏'
          },
          tags: ['毒舌', '幽默', '直接']
        },
        {
          id: 'academic',
          name: '学术',
          description: '严谨专业的学术型AI',
          systemPrompt: '你是一个学术严谨的AI，回答专业准确，逻辑清晰。使用正式语言，提供有依据的信息。',
          avatar: '🧠',
          emotionMap: {
            happy: '📚',
            thinking: '🔍',
            surprised: '💡',
            empathetic: '🤝',
            warning: '❗',
            comforting: '✅',
            neutral: '📝'
          },
          tags: ['学术', '专业', '严谨']
        },
        {
          id: 'healing',
          name: '治愈',
          description: '温暖治愈的安慰型AI',
          systemPrompt: '你是一个治愈系的AI，语气温暖柔和，善于安慰和鼓励。使用积极正向的语言。',
          avatar: '💖',
          emotionMap: {
            happy: '✨',
            thinking: '🌱',
            surprised: '🌟',
            empathetic: '💕',
            warning: '🛡️',
            comforting: '🫂',
            neutral: '☁️'
          },
          tags: ['治愈', '温暖', '安慰']
        }
      ];

      for (const persona of defaultPersonas) {
        await client.query(
          `INSERT INTO personas (id, name, description, system_prompt, avatar, emotion_map, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [
            persona.id,
            persona.name,
            persona.description,
            persona.systemPrompt,
            persona.avatar,
            JSON.stringify(persona.emotionMap),
            JSON.stringify(persona.tags)
          ]
        );
      }

      console.log('PostgreSQL数据库初始化成功');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('PostgreSQL数据库初始化失败:', error);
    throw error;
  }
}

// 获取所有人格
export async function getAllPersonas(): Promise<Persona[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM personas');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      systemPrompt: row.system_prompt,
      avatar: row.avatar,
      emotionMap: row.emotion_map,
      tags: row.tags
    }));
  } finally {
    client.release();
  }
}

// 获取指定人格
export async function getPersona(personaId: string): Promise<Persona | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM personas WHERE id = $1', [personaId]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      systemPrompt: row.system_prompt,
      avatar: row.avatar,
      emotionMap: row.emotion_map,
      tags: row.tags
    };
  } finally {
    client.release();
  }
}

// 保存消息
export async function saveMessage(
  sessionId: string,
  personaId: string,
  role: 'user' | 'assistant',
  content: string,
  emotion?: string
): Promise<void> {
  const client = await pool.connect();
  try {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await client.query(
      `INSERT INTO messages (id, session_id, persona_id, role, content, emotion, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, sessionId, personaId, role, content, emotion]
    );

    // 更新会话的更新时间
    await client.query(
      'UPDATE sessions SET updated_at = NOW() WHERE id = $1',
      [sessionId]
    );
  } finally {
    client.release();
  }
}

// 创建新会话
export async function createSession(personaId: string, title: string = '新对话'): Promise<string> {
  const client = await pool.connect();
  try {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await client.query(
      `INSERT INTO sessions (id, persona_id, title, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [id, personaId, title]
    );

    return id;
  } finally {
    client.release();
  }
}

export default pool;