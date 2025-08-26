'use client';

import { useState, useRef, useEffect } from 'react';
import { Persona, PersonaVersion } from '@/types';

interface PreviewPaneProps {
  persona: Persona | null;
  version: PersonaVersion | null;
  mode: 'single' | 'compare';
}

export default function PreviewPane({ persona, version, mode }: PreviewPaneProps) {
  const [testMessage, setTestMessage] = useState('');
  const [responses, setResponses] = useState<{
    primary?: PreviewResponse;
    secondary?: PreviewResponse;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [secondaryPersona, setSecondaryPersona] = useState<Persona | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [responses]);

  const handlePreview = async () => {
    if (!persona || !testMessage.trim()) return;

    setIsLoading(true);
    
    try {
      const currentPersona = version ? {
        ...persona,
        ...version,
        id: persona.id
      } : persona;

      const primaryResponse = await getPreviewResponse(currentPersona, testMessage);
      
      const newResponses: any = { primary: primaryResponse };

      if (mode === 'compare' && secondaryPersona) {
        const secondaryResponse = await getPreviewResponse(secondaryPersona, testMessage);
        newResponses.secondary = secondaryResponse;
      }

      setResponses(newResponses);
    } catch (error) {
      console.error('预览失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewResponse = async (persona: Persona, message: string): Promise<PreviewResponse> => {
    const response = await fetch('/api/personas/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona, message })
    });

    if (!response.ok) {
      throw new Error('预览请求失败');
    }

    return response.json();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePreview();
    }
  };

  if (!persona) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
        选择一个人格以开始预览
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">实时预览</h3>
          {mode === 'compare' && (
            <PersonaSelector
              selectedPersona={secondaryPersona}
              onSelect={setSecondaryPersona}
              excludeId={persona.id}
            />
          )}
        </div>

        {/* 测试输入 */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入测试消息..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button
            onClick={handlePreview}
            disabled={!testMessage.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '生成中...' : '预览'}
          </button>
        </div>
      </div>

      {/* 预览内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'single' ? (
          <SinglePreview 
            persona={persona}
            version={version}
            response={responses.primary}
            testMessage={testMessage}
          />
        ) : (
          <ComparePreview
            primaryPersona={persona}
            secondaryPersona={secondaryPersona}
            primaryResponse={responses.primary}
            secondaryResponse={responses.secondary}
            testMessage={testMessage}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 快速测试按钮 */}
      <div className="p-4 border-t">
        <div className="text-sm font-medium text-gray-700 mb-2">快速测试：</div>
        <div className="flex flex-wrap gap-2">
          {[
            '你好，今天心情怎么样？',
            '能帮我解释一下机器学习吗？',
            '我最近遇到了一些困难',
            '今天天气真不错'
          ].map((msg, index) => (
            <button
              key={index}
              onClick={() => setTestMessage(msg)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PreviewResponse {
  content: string;
  emotion: string;
  emoji: string;
  metrics: {
    adherenceScore: number;
    tokenCount: number;
    wordCount: number;
    emojiCount: number;
    responseTime: number;
    cost: number;
  };
  reactionTag: string;
}

interface SinglePreviewProps {
  persona: Persona;
  version: PersonaVersion | null;
  response?: PreviewResponse;
  testMessage: string;
}

function SinglePreview({ persona, version, response, testMessage }: SinglePreviewProps) {
  const currentName = version?.name || persona.name;
  const currentAvatar = version?.avatar || persona.avatar;

  return (
    <div className="space-y-4">
      {testMessage && response && (
        <>
          {/* 用户消息 */}
          <div className="flex justify-end">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl">
                {testMessage}
              </div>
            </div>
          </div>

          {/* AI回复 */}
          <div className="flex justify-start">
            <div className="flex max-w-xs lg:max-w-md">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg mr-2">
                {currentAvatar}
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-sm font-medium text-gray-700">{currentName}</span>
                  <span className="text-lg">{response.emoji}</span>
                </div>
                <div className="text-gray-800 whitespace-pre-wrap">
                  {response.content}
                </div>
              </div>
            </div>
          </div>

          {/* 指标显示 */}
          <div className="bg-white border rounded-lg p-3">
            <MetricsDisplay metrics={response.metrics} />
          </div>
        </>
      )}

      {!response && testMessage && (
        <div className="text-center text-gray-500 py-8">
          点击"预览"按钮查看AI回复
        </div>
      )}

      {!testMessage && (
        <div className="text-center text-gray-500 py-8">
          输入测试消息开始预览
        </div>
      )}
    </div>
  );
}

interface ComparePreviewProps {
  primaryPersona: Persona;
  secondaryPersona: Persona | null;
  primaryResponse?: PreviewResponse;
  secondaryResponse?: PreviewResponse;
  testMessage: string;
}

function ComparePreview({
  primaryPersona,
  secondaryPersona,
  primaryResponse,
  secondaryResponse,
  testMessage
}: ComparePreviewProps) {
  if (!secondaryPersona) {
    return (
      <div className="text-center text-gray-500 py-8">
        选择第二个人格进行对比
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 主要人格 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b">
          <span className="text-xl">{primaryPersona.avatar}</span>
          <span className="font-medium text-gray-800">{primaryPersona.name}</span>
        </div>

        {testMessage && primaryResponse && (
          <>
            <div className="bg-white px-3 py-2 rounded-lg border">
              <div className="flex items-center space-x-1 mb-1">
                <span className="text-lg">{primaryResponse.emoji}</span>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {primaryResponse.content}
              </div>
            </div>
            <MetricsDisplay metrics={primaryResponse.metrics} compact />
          </>
        )}
      </div>

      {/* 次要人格 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b">
          <span className="text-xl">{secondaryPersona.avatar}</span>
          <span className="font-medium text-gray-800">{secondaryPersona.name}</span>
        </div>

        {testMessage && secondaryResponse && (
          <>
            <div className="bg-white px-3 py-2 rounded-lg border">
              <div className="flex items-center space-x-1 mb-1">
                <span className="text-lg">{secondaryResponse.emoji}</span>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {secondaryResponse.content}
              </div>
            </div>
            <MetricsDisplay metrics={secondaryResponse.metrics} compact />
          </>
        )}
      </div>
    </div>
  );
}

function MetricsDisplay({ metrics, compact = false }: { metrics: any; compact?: boolean }) {
  const items = [
    { label: '一致性', value: `${Math.round(metrics.adherenceScore * 100)}%`, color: 'blue' },
    { label: 'Token', value: metrics.tokenCount, color: 'green' },
    { label: '用词', value: metrics.wordCount, color: 'purple' },
    { label: '时延', value: `${metrics.responseTime}ms`, color: 'orange' },
    { label: '成本', value: `$${metrics.cost.toFixed(4)}`, color: 'red' }
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-1 text-xs">
        {items.slice(0, 4).map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">{item.label}:</span>
            <span className="font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-sm font-medium text-gray-700 mb-2">性能指标</div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        {items.map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-gray-600">{item.label}</div>
            <div className="font-medium text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PersonaSelectorProps {
  selectedPersona: Persona | null;
  onSelect: (persona: Persona | null) => void;
  excludeId: string;
}

function PersonaSelector({ selectedPersona, onSelect, excludeId }: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const response = await fetch('/api/personas');
      const data = await response.json();
      if (data.personas) {
        setPersonas(data.personas.filter((p: Persona) => p.id !== excludeId));
      }
    } catch (error) {
      console.error('加载人格列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select
      value={selectedPersona?.id || ''}
      onChange={(e) => {
        const persona = personas.find(p => p.id === e.target.value);
        onSelect(persona || null);
      }}
      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900"
      disabled={isLoading}
    >
      <option value="">选择对比人格</option>
      {personas.map(persona => (
        <option key={persona.id} value={persona.id}>
          {persona.avatar} {persona.name}
        </option>
      ))}
    </select>
  );
}