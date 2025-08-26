'use client';

import { useState, useEffect } from 'react';
import { Persona, PersonaVersion, ToneConfig, FewShotExample } from '@/types';
import ToneSliders from './ToneSliders';
import FewShotsEditor from './FewShotsEditor';
import VersionTimeline from './VersionTimeline';

interface PersonaFormProps {
  persona: Persona | null;
  selectedVersion: PersonaVersion | null;
  onSave: (personaData: Partial<Persona>) => void;
  onCopy: () => void;
  onExport: () => void;
  onVersionSelect: (version: PersonaVersion) => void;
  isSaving: boolean;
}

export default function PersonaForm({
  persona,
  selectedVersion,
  onSave,
  onCopy,
  onExport,
  onVersionSelect,
  isSaving
}: PersonaFormProps) {
  const [formData, setFormData] = useState<Partial<Persona>>({
    name: '',
    avatar: '🤖',
    description: '',
    systemPrompt: '',
    tags: [],
    tone: {
      gentle: 0.5,
      direct: 0.5,
      academic: 0.5,
      healing: 0.5,
      humor: 0.5,
      formal: 0.5
    },
    styleGuide: '',
    dos: [],
    donts: [],
    safetyAdapter: '',
    fewShots: [],
    reactionMap: {
      happy: '😊',
      thinking: '🤔',
      surprised: '😲',
      empathetic: '🥺',
      warning: '⚠️',
      comforting: '🤗',
      neutral: '🙂'
    },
    isPublic: false
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'tone' | 'examples' | 'advanced' | 'versions'>('basic');
  const [isDirty, setIsDirty] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [dosInput, setDosInput] = useState('');
  const [dontsInput, setDontsInput] = useState('');

  // 当选择的人格或版本改变时，更新表单数据
  useEffect(() => {
    if (selectedVersion) {
      // 使用选中的版本数据
      setFormData({
        ...selectedVersion,
        id: persona?.id,
        userId: persona?.userId,
        isPublic: persona?.isPublic,
        shareToken: persona?.shareToken,
        createdAt: persona?.createdAt,
        updatedAt: persona?.updatedAt
      });
    } else if (persona) {
      // 使用当前人格数据
      setFormData(persona);
    } else {
      // 重置为默认值
      setFormData({
        name: '',
        avatar: '🤖',
        description: '',
        systemPrompt: '',
        tags: [],
        tone: {
          gentle: 0.5,
          direct: 0.5,
          academic: 0.5,
          healing: 0.5,
          humor: 0.5,
          formal: 0.5
        },
        styleGuide: '',
        dos: [],
        donts: [],
        safetyAdapter: '',
        fewShots: [],
        reactionMap: {
          happy: '😊',
          thinking: '🤔',
          surprised: '😲',
          empathetic: '🥺',
          warning: '⚠️',
          comforting: '🤗',
          neutral: '🙂'
        },
        isPublic: false
      });
    }
    setIsDirty(false);
  }, [persona, selectedVersion]);

  const handleInputChange = (field: keyof Persona, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleToneChange = (toneConfig: ToneConfig) => {
    handleInputChange('tone', toneConfig);
  };

  const handleFewShotsChange = (fewShots: FewShotExample[]) => {
    handleInputChange('fewShots', fewShots);
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...(formData.tags || []), tagInput.trim()];
      handleInputChange('tags', newTags);
      setTagInput('');
    }
  };

  const handleTagRemove = (index: number) => {
    const newTags = (formData.tags || []).filter((_, i) => i !== index);
    handleInputChange('tags', newTags);
  };

  const handleListAdd = (type: 'dos' | 'donts', input: string, setInput: (value: string) => void) => {
    if (input.trim()) {
      const currentList = formData[type] || [];
      const newList = [...currentList, input.trim()];
      handleInputChange(type, newList);
      setInput('');
    }
  };

  const handleListRemove = (type: 'dos' | 'donts', index: number) => {
    const currentList = formData[type] || [];
    const newList = currentList.filter((_, i) => i !== index);
    handleInputChange(type, newList);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsDirty(false);
  };

  const availableEmojis = ['🤖', '😊', '😏', '🧠', '💖', '🎭', '👑', '🌟', '🔥', '💎', '🎨', '🚀'];
  const availableReactions = ['😊', '🤔', '😲', '🥺', '⚠️', '🤗', '🙂', '😎', '🙄', '💢', '✨', '💡'];

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            {persona ? `编辑 ${persona.name}` : '新建人格'}
          </h2>
          
          <div className="flex items-center space-x-2">
            {persona && (
              <>
                <button
                  onClick={onCopy}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  复制
                </button>
                <button
                  onClick={onExport}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  导出
                </button>
              </>
            )}
            
            <button
              type="submit"
              form="persona-form"
              disabled={!isDirty || isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
        
        {/* 选项卡 */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'basic', label: '基础' },
            { id: 'tone', label: '语气' },
            { id: 'examples', label: '示例' },
            { id: 'advanced', label: '高级' },
            { id: 'versions', label: '版本' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 表单内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        <form id="persona-form" onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* 基础信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    头像
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{formData.avatar}</span>
                    <div className="flex flex-wrap gap-1">
                      {availableEmojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleInputChange('avatar', emoji)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            formData.avatar === emoji ? 'bg-blue-100' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  系统提示词 *
                </label>
                <textarea
                  value={formData.systemPrompt || ''}
                  onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="描述这个AI的角色、性格和行为方式..."
                  required
                />
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagRemove(index)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  placeholder="输入标签后按回车添加"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* 可见性设置 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic || false}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  公开人格（其他用户可以查看和使用）
                </label>
              </div>
            </div>
          )}

          {activeTab === 'tone' && (
            <div className="space-y-4">
              <ToneSliders
                tone={formData.tone || {
                  gentle: 0.5, direct: 0.5, academic: 0.5,
                  healing: 0.5, humor: 0.5, formal: 0.5
                }}
                onChange={handleToneChange}
              />
              
              {/* 表情映射 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表情映射
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(formData.reactionMap || {}).map(([emotion, emoji]) => (
                    <div key={emotion} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-20">{emotion}:</span>
                      <span className="text-xl">{emoji}</span>
                      <select
                        value={emoji}
                        onChange={(e) => handleInputChange('reactionMap', {
                          ...formData.reactionMap,
                          [emotion]: e.target.value
                        })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      >
                        {availableReactions.map(react => (
                          <option key={react} value={react}>{react}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <FewShotsEditor
              fewShots={formData.fewShots || []}
              onChange={handleFewShotsChange}
            />
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  风格指南
                </label>
                <textarea
                  value={formData.styleGuide || ''}
                  onChange={(e) => handleInputChange('styleGuide', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="描述写作风格、语言习惯等..."
                />
              </div>

              {/* 鼓励使用的词汇/行为 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  鼓励使用 (Do's)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.dos || []).map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleListRemove('dos', index)}
                        className="text-green-500 hover:text-green-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={dosInput}
                    onChange={(e) => setDosInput(e.target.value)}
                    placeholder="添加鼓励的词汇或行为"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleListAdd('dos', dosInput, setDosInput)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* 禁止使用的词汇/行为 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  禁止使用 (Don'ts)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.donts || []).map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleListRemove('donts', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={dontsInput}
                    onChange={(e) => setDontsInput(e.target.value)}
                    placeholder="添加禁止的词汇或行为"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleListAdd('donts', dontsInput, setDontsInput)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    添加
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  安全适配器
                </label>
                <textarea
                  value={formData.safetyAdapter || ''}
                  onChange={(e) => handleInputChange('safetyAdapter', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="安全过滤和内容审核规则..."
                />
              </div>
            </div>
          )}

          {activeTab === 'versions' && persona && (
            <VersionTimeline
              persona={persona}
              selectedVersion={selectedVersion}
              onVersionSelect={onVersionSelect}
            />
          )}
        </form>
      </div>
    </div>
  );
}