import { create } from 'zustand';
import { Message, Session } from '@/types';

interface ChatState {
  // 当前会话
  currentSession: Session | null;
  // 消息列表
  messages: Message[];
  // 是否正在加载
  isLoading: boolean;
  // 当前情绪表情
  currentEmotion: string;
  // 当前人格ID
  currentPersonaId: string | null;
  // 会话列表
  sessions: Session[];
  // 草稿状态
  draft: string;
  isComposing: boolean;

  // Actions
  setCurrentSession: (session: Session | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string, emotion?: string) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentEmotion: (emotion: string) => void;
  setCurrentPersonaId: (personaId: string | null) => void;
  clearChat: () => void;
  // 会话管理
  loadSessions: () => Promise<void>;
  createSession: (personaId: string, title?: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, title: string) => Promise<void>;
  loadSessionMessages: (sessionId: string) => Promise<void>;
  // 草稿管理
  updateDraft: (text: string) => void;
  clearDraft: () => void;
  setIsComposing: (composing: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentSession: null,
  messages: [],
  isLoading: false,
  currentEmotion: '🙂',
  currentPersonaId: null,
  sessions: [],
  draft: '',
  isComposing: false,

  setCurrentSession: (session) => set({ currentSession: session }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => 
    set((state) => ({
      messages: [...state.messages, message]
    })),
  
  updateLastMessage: (content, emotion) =>
    set((state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessages = [...state.messages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
          emotion: emotion || lastMessage.emotion
        };
        return { messages: updatedMessages };
      }
      return state;
    }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
  
  setCurrentPersonaId: (personaId) => set({ currentPersonaId: personaId }),
  
  clearChat: () => set({ 
    messages: [], 
    currentSession: null,
    currentEmotion: '🙂'
  }),

  // 会话管理方法
  loadSessions: async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const sessions = await response.json();
        set({ sessions });
      }
    } catch (error) {
      console.error('加载会话列表失败:', error);
    }
  },

  createSession: async (personaId: string, title?: string) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personaId, title }),
      });

      if (response.ok) {
        const session = await response.json();
        // 重新加载会话列表
        get().loadSessions();
        return session.id;
      }
      throw new Error('创建会话失败');
    } catch (error) {
      console.error('创建会话失败:', error);
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions?id=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 如果删除的是当前会话，清空当前会话
        if (get().currentSession?.id === sessionId) {
          set({ currentSession: null, messages: [] });
        }
        // 重新加载会话列表
        get().loadSessions();
      } else {
        throw new Error('删除会话失败');
      }
    } catch (error) {
      console.error('删除会话失败:', error);
      throw error;
    }
  },

  renameSession: async (sessionId: string, title: string) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: sessionId, title }),
      });

      if (response.ok) {
        // 重新加载会话列表
        get().loadSessions();
        // 如果重命名的是当前会话，更新当前会话
        if (get().currentSession?.id === sessionId) {
          set(state => ({
            currentSession: state.currentSession ? 
              { ...state.currentSession, title } : null
          }));
        }
      } else {
        throw new Error('重命名会话失败');
      }
    } catch (error) {
      console.error('重命名会话失败:', error);
      throw error;
    }
  },

  loadSessionMessages: async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        set({ 
          currentSession: data.session,
          messages: data.messages,
          currentPersonaId: data.session.personaId
        });
      }
    } catch (error) {
      console.error('加载会话消息失败:', error);
      throw error;
    }
  },

  // 草稿管理方法
  updateDraft: (text: string) => set({ draft: text }),
  
  clearDraft: () => set({ draft: '' }),
  
  setIsComposing: (composing: boolean) => set({ isComposing: composing }),
}));