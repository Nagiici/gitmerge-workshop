'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';

export default function Home() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const { sessions, loadSessions, deleteSession, renameSession, loadSessionMessages } = useChatStore();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [personas, setPersonas] = useState<any[]>([]);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);

  // 默认人格（兼容性）
  const defaultPersonas = [
    { id: 'gentle', name: '温柔', avatar: '😊', description: '温柔体贴的陪伴型AI' },
    { id: 'sassy', name: '毒舌', avatar: '😏', description: '直言不讳的毒舌AI' },
    { id: 'academic', name: '学术', avatar: '🧠', description: '严谨专业的学术型AI' },
    { id: 'healing', name: '治愈', avatar: '💖', description: '温暖治愈的安慰型AI' }
  ];

  useEffect(() => {
    loadSessions();
    loadPersonas();
  }, [loadSessions]);

  const loadPersonas = async () => {
    try {
      setIsLoadingPersonas(true);
      const response = await fetch('/api/personas?public=true');
      const data = await response.json();
      
      if (data.personas && data.personas.length > 0) {
        // 合并数据库人格和默认人格
        const formattedPersonas = data.personas.map((p: any) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          description: p.description || '自定义人格'
        }));
        
        // 添加默认人格（如果不存在）
        const allPersonas = [...formattedPersonas];
        defaultPersonas.forEach(defaultP => {
          if (!allPersonas.find(p => p.id === defaultP.id)) {
            allPersonas.push(defaultP);
          }
        });
        
        setPersonas(allPersonas);
      } else {
        // 如果没有数据库人格，使用默认人格
        setPersonas(defaultPersonas);
      }
    } catch (error) {
      console.error('加载人格列表失败:', error);
      setPersonas(defaultPersonas);
    } finally {
      setIsLoadingPersonas(false);
    }
  };

  const handleStartChat = async () => {
    if (selectedPersona) {
      router.push(`/chat?persona=${selectedPersona}`);
    }
  };

  const handleContinueChat = async (sessionId: string) => {
    await loadSessionMessages(sessionId);
    router.push(`/chat?session=${sessionId}`);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个会话吗？')) {
      await deleteSession(sessionId);
    }
  };

  const startEditing = (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveEdit = async (sessionId: string) => {
    if (editTitle.trim()) {
      await renameSession(sessionId, editTitle.trim());
      setEditingSessionId(null);
      setEditTitle('');
    }
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI聊天陪伴机器人
          </h1>
          <p className="text-gray-600 text-lg">
            选择你喜欢的AI人格，开始一段有趣的对话吧！
          </p>
          
          {/* 人格工作室入口 */}
          <div className="mt-6">
            <button
              onClick={() => router.push('/persona-studio')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              <span>🎨</span>
              <span>人格工作室</span>
              <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded">Beta</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              创建、编辑和测试自定义AI人格
            </p>
          </div>
        </div>

        {/* 选项卡 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'new'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('new')}
          >
            新建对话
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            历史会话 ({sessions.length})
          </button>
        </div>

        {activeTab === 'new' ? (
          <>
            {isLoadingPersonas ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">加载人格列表...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedPersona === persona.id
                        ? 'border-blue-500 bg-blue-50 transform scale-105'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPersona(persona.id)}
                  >
                    <div className="text-4xl mb-3">{persona.avatar}</div>
                    <h3 className="font-semibold text-gray-800 mb-2">{persona.name}</h3>
                    <p className="text-sm text-gray-600">{persona.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleStartChat}
                disabled={!selectedPersona}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {selectedPersona ? '开始聊天 →' : '请选择一个人格'}
              </button>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>✨ 实时表情反馈 | 💬 流式对话 | 📱 移动端优化</p>
            </div>
          </>
        ) : (
          <div className="mb-8">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium mb-2">还没有历史会话</h3>
                <p>开始一个新的对话来创建你的第一个会话吧！</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleContinueChat(session.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-2xl">{session.personaAvatar}</div>
                      <div className="flex-1 min-w-0">
                        {editingSessionId === session.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(session.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            autoFocus
                          />
                        ) : (
                          <h4 className="font-medium text-gray-800 truncate">
                            {session.title}
                          </h4>
                        )}
                        <p className="text-sm text-gray-500">
                          {session.personaName} · {session.messageCount} 条消息 · 
                          {new Date(session.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      {editingSessionId === session.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(session.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => startEditing(session, e)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}