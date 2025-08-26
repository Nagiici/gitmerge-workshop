'use client';

import { useState } from 'react';
import { FewShotExample } from '@/types';

interface FewShotsEditorProps {
  fewShots: FewShotExample[];
  onChange: (fewShots: FewShotExample[]) => void;
}

export default function FewShotsEditor({ fewShots, onChange }: FewShotsEditorProps) {
  const [newExample, setNewExample] = useState<Partial<FewShotExample>>({
    user: '',
    assistant: '',
    context: ''
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddExample = () => {
    if (!newExample.user?.trim() || !newExample.assistant?.trim()) {
      return;
    }

    const example: FewShotExample = {
      id: Date.now().toString(),
      user: newExample.user.trim(),
      assistant: newExample.assistant.trim(),
      context: newExample.context?.trim() || undefined
    };

    onChange([...fewShots, example]);
    setNewExample({ user: '', assistant: '', context: '' });
  };

  const handleUpdateExample = (index: number, updatedExample: FewShotExample) => {
    const newFewShots = [...fewShots];
    newFewShots[index] = updatedExample;
    onChange(newFewShots);
    setEditingIndex(null);
  };

  const handleDeleteExample = (index: number) => {
    const newFewShots = fewShots.filter((_, i) => i !== index);
    onChange(newFewShots);
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Few-Shot 示例</h3>
        <p className="text-sm text-gray-600">
          提供对话示例来训练AI的回答风格和行为模式
        </p>
      </div>

      {/* 现有示例列表 */}
      {fewShots.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">现有示例：</h4>
          {fewShots.map((example, index) => (
            <ExampleCard
              key={example.id}
              example={example}
              index={index}
              isEditing={editingIndex === index}
              onEdit={() => handleEditStart(index)}
              onSave={(updated) => handleUpdateExample(index, updated)}
              onCancel={handleEditCancel}
              onDelete={() => handleDeleteExample(index)}
            />
          ))}
        </div>
      )}

      {/* 添加新示例 */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-700 mb-4">添加新示例：</h4>
        
        <div className="space-y-4">
          {/* 上下文（可选） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              上下文（可选）
            </label>
            <textarea
              value={newExample.context || ''}
              onChange={(e) => setNewExample(prev => ({ ...prev, context: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="描述对话的背景或场景..."
            />
          </div>

          {/* 用户输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户输入 *
            </label>
            <textarea
              value={newExample.user || ''}
              onChange={(e) => setNewExample(prev => ({ ...prev, user: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="用户会说什么..."
              required
            />
          </div>

          {/* AI回复 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期望的AI回复 *
            </label>
            <textarea
              value={newExample.assistant || ''}
              onChange={(e) => setNewExample(prev => ({ ...prev, assistant: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="AI应该如何回复..."
              required
            />
          </div>

          <button
            type="button"
            onClick={handleAddExample}
            disabled={!newExample.user?.trim() || !newExample.assistant?.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            添加示例
          </button>
        </div>
      </div>

      {/* 快速模板 */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-700 mb-4">快速模板：</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setNewExample({
              context: '用户询问专业问题',
              user: '请解释一下机器学习的基本概念',
              assistant: '机器学习是人工智能的一个重要分支...'
            })}
            className="p-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
          >
            <div className="font-medium text-sm">专业解答模板</div>
            <div className="text-xs text-gray-500 mt-1">适用于学术或专业咨询场景</div>
          </button>
          
          <button
            type="button"
            onClick={() => setNewExample({
              context: '用户表达负面情绪',
              user: '我今天心情很不好',
              assistant: '我能理解你现在的感受。想要聊聊发生了什么吗？我会认真倾听的。'
            })}
            className="p-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
          >
            <div className="font-medium text-sm">情感支持模板</div>
            <div className="text-xs text-gray-500 mt-1">适用于情感陪伴场景</div>
          </button>
          
          <button
            type="button"
            onClick={() => setNewExample({
              context: '用户寻求建议',
              user: '我应该怎么学习编程？',
              assistant: '学习编程确实是个很棒的想法！我建议你可以从基础语言开始...'
            })}
            className="p-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
          >
            <div className="font-medium text-sm">建议指导模板</div>
            <div className="text-xs text-gray-500 mt-1">适用于咨询建议场景</div>
          </button>
          
          <button
            type="button"
            onClick={() => setNewExample({
              context: '轻松聊天',
              user: '今天天气真好',
              assistant: '是呀！这样的好天气让人心情也变好了呢～你有什么特别的计划吗？'
            })}
            className="p-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
          >
            <div className="font-medium text-sm">日常聊天模板</div>
            <div className="text-xs text-gray-500 mt-1">适用于闲聊场景</div>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ExampleCardProps {
  example: FewShotExample;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (example: FewShotExample) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function ExampleCard({ 
  example, 
  index, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete 
}: ExampleCardProps) {
  const [editData, setEditData] = useState<FewShotExample>(example);

  const handleSave = () => {
    if (editData.user.trim() && editData.assistant.trim()) {
      onSave(editData);
    }
  };

  if (isEditing) {
    return (
      <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
        <div className="space-y-3">
          {/* 上下文编辑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              上下文
            </label>
            <textarea
              value={editData.context || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, context: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* 用户输入编辑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户输入
            </label>
            <textarea
              value={editData.user}
              onChange={(e) => setEditData(prev => ({ ...prev, user: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* AI回复编辑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI回复
            </label>
            <textarea
              value={editData.assistant}
              onChange={(e) => setEditData(prev => ({ ...prev, assistant: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-gray-600">示例 {index + 1}</span>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            编辑
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-red-600 hover:text-red-700"
          >
            删除
          </button>
        </div>
      </div>

      {example.context && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          <span className="font-medium text-gray-600">上下文：</span>
          <span className="text-gray-700">{example.context}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
            👤
          </div>
          <div className="flex-1 bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-800">{example.user}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-sm">
            🤖
          </div>
          <div className="flex-1 bg-blue-100 rounded-lg p-3">
            <p className="text-sm text-gray-800">{example.assistant}</p>
          </div>
        </div>
      </div>
    </div>
  );
}