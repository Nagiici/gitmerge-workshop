import sqlite3 from 'sqlite3';
import { Persona } from '@/types';

let db: sqlite3.Database | null = null;

// 获取数据库实例
export function getDatabase() {
  if (!db) {
    let dbPath = process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace('file:', '') : 
      './db/chat.db';
    
    // Windows路径处理
    if (process.platform === 'win32') {
      // 移除开头的斜杠（如果有）
      dbPath = dbPath.replace(/^\//, '');
      // 确保路径使用正斜杠
      dbPath = dbPath.replace(/\\/g, '/');
    }
    
    console.log('数据库路径:', dbPath);
    db = new sqlite3.Database(dbPath);
  }
  return db;
}

// 初始化数据库
export function initDatabase() {
  const db = getDatabase();
  db.serialize(() => {
    // 用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 人格表
    db.run(`
      CREATE TABLE IF NOT EXISTS personas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        system_prompt TEXT NOT NULL,
        avatar TEXT,
        emotion_map TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 会话表
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        persona_id TEXT,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 消息表
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        persona_id TEXT,
        content TEXT NOT NULL,
        role TEXT CHECK(role IN ('user', 'assistant')),
        emotion TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    const insertPersona = db.prepare(`
      INSERT OR IGNORE INTO personas (id, name, description, system_prompt, avatar, emotion_map, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    defaultPersonas.forEach(persona => {
      insertPersona.run(
        persona.id,
        persona.name,
        persona.description,
        persona.systemPrompt,
        persona.avatar,
        JSON.stringify(persona.emotionMap),
        JSON.stringify(persona.tags)
      );
    });

    insertPersona.finalize();
  });
}

export default db;