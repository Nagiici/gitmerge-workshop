'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from '@/components/MessageBubble';
import DraftBubble from '@/components/DraftBubble';
import { Message } from '@/types';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState('');
  
  const {
    messages,
    isLoading,
    currentEmotion,
    currentPersonaId,
    currentSession,
    draft,
    isComposing,
    addMessage,
    updateLastMessage,
    setIsLoading,
    setCurrentEmotion,
    setCurrentPersonaId,
    setCurrentSession,
    setMessages,
    clearChat,
    loadSessionMessages,
    updateDraft,
    clearDraft,
    setIsComposing
  } = useChatStore();

  // 人格配置
  const personas = {
    gentle: { name: '温柔', avatar: '😊' },
    sassy: { name: '毒舌', avatar: '😏' },
    academic: { name: '学术', avatar: '🧠' },
    healing: { name: '治愈', avatar: '💖' }
  };

  const currentPersona = currentPersonaId ? personas[currentPersonaId as keyof typeof personas] : null;

  // 初始化会话或人格
  useEffect(() => {
    const sessionId = searchParams.get('session');
    const personaId = searchParams.get('persona');
    
    if (sessionId) {
      // 加载现有会话
      loadSessionMessages(sessionId);
    } else if (personaId && Object.keys(personas).includes(personaId)) {
      // 创建新会话
      setCurrentPersonaId(personaId);
      setCurrentSession(null);
      setMessages([]);
    } else {
      router.push('/');
    }
  }, [searchParams, router, loadSessionMessages]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 草稿变化时自动滚动（如果用户在底部）
  useEffect(() => {
    if (draft) {
      const scrollContainer = messagesEndRef.current?.parentElement;
      if (scrollContainer) {
        const isAtBottom = 
          scrollContainer.scrollHeight - scrollContainer.scrollTop === 
          scrollContainer.clientHeight;
        
        if (isAtBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [draft]);

  const handleSendMessage = async () => {
    const messageContent = draft.trim();
    if (!messageContent || isLoading || !currentPersonaId || isComposing) return;

    // 乐观更新：立即添加用户消息
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    addMessage(userMessage);
    clearDraft();
    setIsLoading(true);

    // 添加空的AI消息用于流式更新
    const aiMessage: Message = {
      id: `temp-ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    addMessage(aiMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaId: currentPersonaId,
          message: messageContent,
          sessionId: currentSession?.id
        }),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  updateLastMessage(`错误: ${data.error}`);
                  break;
                }

                if (data.content) {
                  updateLastMessage(data.content, data.emotion);
                }

                if (data.emoji) {
                  setCurrentEmotion(data.emoji);
                }

                if (data.sessionId && !currentSession) {
                  // 如果是新会话，更新当前会话
                  setCurrentSession({
                    id: data.sessionId,
                    personaId: currentPersonaId!,
                    title: inputMessage.slice(0, 50),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    messageCount: 2
                  });
                }

                if (data.done) {
                  break;
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
        reader.releaseLock();
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      updateLastMessage('抱歉，发送消息时出现了问题。请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clearDraft();
    }
  };

  const handleGoBack = () => {
    clearChat();
    router.push('/');
  };

  if (!currentPersona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
            >
              <span>←</span>
              <span>返回</span>
            </button>
            <div className="text-2xl">{currentPersona.avatar}</div>
            <div>
              <h1 className="font-semibold text-gray-800">{currentPersona.name}AI</h1>
              <div className="text-sm text-gray-500 flex items-center">
                <span className="mr-1">{currentEmotion}</span>
                <span>在线</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {messages.filter(m => m.role === 'user').length} 条消息
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">{currentPersona.avatar}</div>
              <h2 className="text-xl font-semibold mb-2">开始与{currentPersona.name}AI对话</h2>
              <p>发送一条消息开始聊天吧！</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                personaAvatar={currentPersona.avatar}
              />
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex max-w-xs lg:max-w-md">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg mr-2">
                  {currentPersona.avatar}
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 草稿气泡 */}
          {draft && (
            <DraftBubble content={draft} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <textarea
              value={draft}
              onChange={(e) => {
                updateDraft(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="输入消息..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={Math.min(4, Math.max(1, draft.split('\n').length))}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!draft.trim() || isLoading || isComposing}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              发送
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            按 Enter 发送，Shift + Enter 换行
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}