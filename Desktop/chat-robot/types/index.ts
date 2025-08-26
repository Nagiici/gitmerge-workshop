export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  avatar: string;
  emotionMap: Record<string, string>;
  tags: string[];
  
  // 新增字段
  tone: ToneConfig;
  styleGuide?: string;
  dos?: string[];
  donts?: string[];
  safetyAdapter?: string;
  fewShots?: FewShotExample[];
  reactionMap: Record<string, string>;
  
  // 权限和可见性
  isPublic: boolean;
  shareToken?: string;
  userId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ToneConfig {
  gentle: number;    // 温柔度 0-1
  direct: number;    // 直接度 0-1
  academic: number;  // 学术性 0-1
  healing: number;   // 治愈性 0-1
  humor: number;     // 幽默度 0-1
  formal: number;    // 正式度 0-1
}

export interface FewShotExample {
  id: string;
  user: string;
  assistant: string;
  context?: string;
}

export interface PersonaVersion {
  id: string;
  personaId: string;
  version: number;
  name: string;
  avatar: string;
  tags: string[];
  description?: string;
  systemPrompt: string;
  tone: ToneConfig;
  styleGuide?: string;
  dos?: string[];
  donts?: string[];
  safetyAdapter?: string;
  fewShots?: FewShotExample[];
  reactionMap: Record<string, string>;
  changeLog?: string;
  createdAt: Date;
}

export interface PersonaMetric {
  id: string;
  personaId: string;
  adherenceScore?: number;
  tokenCount: number;
  wordCount: number;
  emojiCount: number;
  paragraphCount: number;
  responseTime?: number;
  cost?: number;
  sentimentScore?: number;
  formalityScore?: number;
  creativityScore?: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  personaId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  personaName?: string;
  personaAvatar?: string;
}

export interface ChatRequest {
  personaId: string;
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  content: string;
  emotion: string;
  done: boolean;
  sessionId?: string;
}

export interface ReactionRequest {
  text: string;
  personaId: string;
}

export interface ReactionResponse {
  emotion: string;
  confidence: number;
  emoji: string;
}

export type EmotionType = 
  | 'happy' 
  | 'thinking' 
  | 'surprised' 
  | 'empathetic' 
  | 'warning' 
  | 'comforting'
  | 'neutral';