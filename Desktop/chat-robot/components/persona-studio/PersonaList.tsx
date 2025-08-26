'use client';

import { useState, useRef } from 'react';
import { Persona } from '@/types';

interface PersonaListProps {
  personas: Persona[];
  selectedPersona: Persona | null;
  onPersonaSelect: (persona: Persona) => void;
  onPersonaDelete: (personaId: string) => void;
  onImport: (file: File) => void;
}

export default function PersonaList({
  personas,
  selectedPersona,
  onPersonaSelect,
  onPersonaDelete,
  onImport
}: PersonaListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'createdAt'>('updatedAt');
  const [filterPublic, setFilterPublic] = useState<'all' | 'public' | 'private'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPersonas = personas
    .filter(persona => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          persona.name.toLowerCase().includes(query) ||
          persona.description?.toLowerCase().includes(query) ||
          persona.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(persona => {
      // 可见性过滤
      if (filterPublic === 'public') return persona.isPublic;
      if (filterPublic === 'private') return !persona.isPublic;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      onImport(file);
    }
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">人格列表</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            导入
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        
        {/* 搜索框 */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索人格... (按 / 快速聚焦)"
          data-search
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        
        {/* 过滤器 */}
        <div className="flex items-center space-x-2 mt-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
          >
            <option value="updatedAt">最近更新</option>
            <option value="createdAt">创建时间</option>
            <option value="name">名称</option>
          </select>
          
          <select
            value={filterPublic}
            onChange={(e) => setFilterPublic(e.target.value as typeof filterPublic)}
            className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
          >
            <option value="all">全部</option>
            <option value="public">公开</option>
            <option value="private">私有</option>
          </select>
        </div>
      </div>

      {/* 人格列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredPersonas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? '未找到匹配的人格' : '暂无人格，点击"新建人格"开始创建'}
          </div>
        ) : (
          filteredPersonas.map((persona) => (
            <PersonaListItem
              key={persona.id}
              persona={persona}
              isSelected={selectedPersona?.id === persona.id}
              onSelect={() => onPersonaSelect(persona)}
              onDelete={() => onPersonaDelete(persona.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface PersonaListItemProps {
  persona: Persona;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function PersonaListItem({ persona, isSelected, onSelect, onDelete }: PersonaListItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`p-3 border-b cursor-pointer hover:bg-gray-50 relative ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{persona.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800 truncate">{persona.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ⋮
            </button>
          </div>
          
          {persona.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {persona.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex flex-wrap gap-1">
              {persona.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {persona.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{persona.tags.length - 2}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              {persona.isPublic && <span>🌐</span>}
              <span>{new Date(persona.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 菜单 */}
      {showMenu && (
        <div className="absolute right-2 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            删除
          </button>
        </div>
      )}
    </div>
  );
}