'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonaList from './PersonaList';
import PersonaForm from './PersonaForm';
import PreviewPane from './PreviewPane';
import VisualizationPanel from './VisualizationPanel';
import { Persona, PersonaVersion } from '@/types';

export default function PersonaStudioLayout() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PersonaVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'single' | 'compare'>('single');

  // 加载人格列表
  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/personas');
      const data = await response.json();
      if (data.personas) {
        setPersonas(data.personas);
      }
    } catch (error) {
      console.error('加载人格列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    setSelectedVersion(null);
    setShowPreview(true);
  };

  const handleVersionSelect = (version: PersonaVersion) => {
    setSelectedVersion(version);
  };

  const handlePersonaSave = async (personaData: Partial<Persona>) => {
    try {
      setIsSaving(true);
      
      if (selectedPersona) {
        // 更新现有人格
        const response = await fetch(`/api/personas/${selectedPersona.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...personaData,
            changeLog: '人格配置更新'
          })
        });
        
        if (response.ok) {
          const updatedPersona = await response.json();
          setPersonas(prev => prev.map(p => p.id === updatedPersona.id ? updatedPersona : p));
          setSelectedPersona(updatedPersona);
        }
      } else {
        // 创建新人格
        const response = await fetch('/api/personas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personaData)
        });
        
        if (response.ok) {
          const newPersona = await response.json();
          setPersonas(prev => [newPersona, ...prev]);
          setSelectedPersona(newPersona);
        }
      }
    } catch (error) {
      console.error('保存人格失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonaDelete = async (personaId: string) => {
    if (!confirm('确定要删除这个人格吗？')) return;
    
    try {
      const response = await fetch(`/api/personas/${personaId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPersonas(prev => prev.filter(p => p.id !== personaId));
        if (selectedPersona?.id === personaId) {
          setSelectedPersona(null);
          setSelectedVersion(null);
        }
      }
    } catch (error) {
      console.error('删除人格失败:', error);
    }
  };

  const handleCopyPersona = () => {
    if (!selectedPersona) return;
    
    const copied = {
      ...selectedPersona,
      name: `${selectedPersona.name} (副本)`,
      isPublic: false,
      shareToken: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    delete (copied as any).id;
    
    setSelectedPersona(null);
    setSelectedVersion(null);
    // 触发表单填充
    setTimeout(() => setSelectedPersona(copied as Persona), 100);
  };

  const handleExportPersona = () => {
    if (!selectedPersona) return;
    
    const exportData = {
      ...selectedPersona,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `persona-${selectedPersona.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPersona = async (file: File) => {
    try {
      const text = await file.text();
      const personaData = JSON.parse(text);
      
      // 移除ID和时间戳字段
      delete personaData.id;
      delete personaData.createdAt;
      delete personaData.updatedAt;
      delete personaData.exportedAt;
      
      setSelectedPersona(personaData);
      setSelectedVersion(null);
    } catch (error) {
      console.error('导入人格失败:', error);
      alert('导入失败，请检查文件格式');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (selectedPersona) {
        handlePersonaSave(selectedPersona);
      }
    }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      // 触发搜索
      const searchInput = document.querySelector('[data-search]') as HTMLInputElement;
      searchInput?.focus();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPersona]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">加载人格工作室...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <span>←</span>
                <span>返回首页</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">人格工作室</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  showPreview 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showPreview ? '隐藏预览' : '显示预览'}
              </button>
              
              {showPreview && (
                <select
                  value={previewMode}
                  onChange={(e) => setPreviewMode(e.target.value as 'single' | 'compare')}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-900"
                >
                  <option value="single">单一预览</option>
                  <option value="compare">对比预览</option>
                </select>
              )}
              
              <button
                onClick={() => {
                  setSelectedPersona(null);
                  setSelectedVersion(null);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                新建人格
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-[calc(100vh-120px)]">
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧人格列表 */}
          <div className="col-span-3">
            <PersonaList
              personas={personas}
              selectedPersona={selectedPersona}
              onPersonaSelect={handlePersonaSelect}
              onPersonaDelete={handlePersonaDelete}
              onImport={handleImportPersona}
            />
          </div>

          {/* 右侧内容区 */}
          <div className="col-span-9 space-y-6">
            {/* 表单区域 */}
            <div className="w-full">
              <PersonaForm
                persona={selectedPersona}
                selectedVersion={selectedVersion}
                onSave={handlePersonaSave}
                onCopy={handleCopyPersona}
                onExport={handleExportPersona}
                onVersionSelect={handleVersionSelect}
                isSaving={isSaving}
              />
            </div>

            {showPreview && (
              <>
                {/* 预览面板 - 放在表单下方 */}
                <div className="w-full">
                  <PreviewPane
                    persona={selectedPersona}
                    version={selectedVersion}
                    mode={previewMode}
                  />
                </div>

                {/* 可视化面板 */}
                <div className="w-full">
                  <VisualizationPanel
                    persona={selectedPersona}
                    version={selectedVersion}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}