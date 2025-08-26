'use client';

import { useState, useEffect } from 'react';
import { Persona, PersonaVersion, ToneConfig, FewShotExample } from '@/types';

interface VersionTimelineProps {
  persona: Persona;
  selectedVersion: PersonaVersion | null;
  onVersionSelect: (version: PersonaVersion) => void;
}

export default function VersionTimeline({ 
  persona, 
  selectedVersion, 
  onVersionSelect 
}: VersionTimelineProps) {
  const [versions, setVersions] = useState<PersonaVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDiff, setShowDiff] = useState(false);
  const [compareVersion, setCompareVersion] = useState<PersonaVersion | null>(null);

  useEffect(() => {
    loadVersions();
  }, [persona.id]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/personas/${persona.id}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      }
    } catch (error) {
      console.error('加载版本列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionClick = (version: PersonaVersion) => {
    if (selectedVersion?.id === version.id) {
      // 如果点击已选中的版本，取消选择
      onVersionSelect(null as any);
    } else {
      onVersionSelect(version);
    }
  };

  const handleCompareToggle = (version: PersonaVersion) => {
    if (compareVersion?.id === version.id) {
      setCompareVersion(null);
      setShowDiff(false);
    } else {
      setCompareVersion(version);
      setShowDiff(true);
    }
  };

  const handleRestoreVersion = async (version: PersonaVersion) => {
    if (!confirm(`确定要恢复到版本 ${version.version} 吗？这将创建一个新版本。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/personas/${persona.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...version,
          changeLog: `恢复到版本 ${version.version}`
        })
      });

      if (response.ok) {
        loadVersions();
      }
    } catch (error) {
      console.error('恢复版本失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <div className="text-sm text-gray-600">加载版本历史...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">版本历史</h3>
        <button
          onClick={() => setShowDiff(!showDiff)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            showDiff 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showDiff ? '隐藏对比' : '显示对比'}
        </button>
      </div>

      {/* 版本时间线 */}
      <div className="relative">
        {/* 时间线线条 */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-4">
          {versions.map((version, index) => (
            <VersionItem
              key={version.id}
              version={version}
              isSelected={selectedVersion?.id === version.id}
              isComparing={compareVersion?.id === version.id}
              isLatest={index === 0}
              onClick={() => handleVersionClick(version)}
              onCompare={() => handleCompareToggle(version)}
              onRestore={() => handleRestoreVersion(version)}
              showDiff={showDiff}
            />
          ))}
        </div>
      </div>

      {/* 差异对比视图 */}
      {showDiff && selectedVersion && compareVersion && (
        <DiffView
          version1={selectedVersion}
          version2={compareVersion}
          onClose={() => {
            setShowDiff(false);
            setCompareVersion(null);
          }}
        />
      )}
    </div>
  );
}

interface VersionItemProps {
  version: PersonaVersion;
  isSelected: boolean;
  isComparing: boolean;
  isLatest: boolean;
  onClick: () => void;
  onCompare: () => void;
  onRestore: () => void;
  showDiff: boolean;
}

function VersionItem({
  version,
  isSelected,
  isComparing,
  isLatest,
  onClick,
  onCompare,
  onRestore,
  showDiff
}: VersionItemProps) {
  return (
    <div className="relative flex items-start space-x-4">
      {/* 时间线节点 */}
      <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
        isSelected 
          ? 'bg-blue-500 border-blue-500 text-white' 
          : isLatest
          ? 'bg-green-500 border-green-500 text-white'
          : 'bg-white border-gray-300 text-gray-600'
      }`}>
        {isLatest ? (
          <span className="text-xs font-bold">最新</span>
        ) : (
          <span className="text-xs font-bold">v{version.version}</span>
        )}
      </div>

      {/* 版本信息卡片 */}
      <div 
        className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-300 bg-blue-50' 
            : isComparing
            ? 'border-orange-300 bg-orange-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-800">
              版本 {version.version}
            </h4>
            {isLatest && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                当前版本
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {showDiff && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare();
                }}
                className={`px-2 py-1 text-xs rounded ${
                  isComparing
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isComparing ? '取消对比' : '对比'}
              </button>
            )}
            
            {!isLatest && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
              >
                恢复
              </button>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          {new Date(version.createdAt).toLocaleString()}
        </div>

        {version.changeLog && (
          <div className="text-sm text-gray-700 mb-3">
            {version.changeLog}
          </div>
        )}

        {/* 版本摘要 */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500">名称：</span>
            <span className="font-medium text-gray-900">{version.name}</span>
          </div>
          <div>
            <span className="text-gray-500">标签：</span>
            <span className="font-medium text-gray-900">{version.tags.length} 个</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DiffViewProps {
  version1: PersonaVersion;
  version2: PersonaVersion;
  onClose: () => void;
}

function DiffView({ version1, version2, onClose }: DiffViewProps) {
  const getDifferences = () => {
    const diffs: Array<{field: string, label: string, old: any, new: any}> = [];
    
    const fields = [
      { key: 'name', label: '名称' },
      { key: 'description', label: '描述' },
      { key: 'systemPrompt', label: '系统提示词' },
      { key: 'tags', label: '标签' },
      { key: 'tone', label: '语气配置' },
      { key: 'styleGuide', label: '风格指南' },
      { key: 'dos', label: '鼓励使用' },
      { key: 'donts', label: '禁止使用' },
      { key: 'fewShots', label: '示例' }
    ];

    fields.forEach(field => {
      const val1 = version1[field.key as keyof PersonaVersion];
      const val2 = version2[field.key as keyof PersonaVersion];
      
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        diffs.push({
          field: field.key,
          label: field.label,
          old: val2,
          new: val1
        });
      }
    });

    return diffs;
  };

  const differences = getDifferences();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              版本对比：v{version2.version} → v{version1.version}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {differences.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              这两个版本没有差异
            </div>
          ) : (
            <div className="space-y-6">
              {differences.map((diff, index) => (
                <DiffItem key={index} diff={diff} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiffItem({ diff }: { diff: any }) {
  const formatValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value || '');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">
        {diff.label}
      </div>
      
      <div className="grid grid-cols-2">
        {/* 旧值 */}
        <div className="p-4 border-r border-gray-200">
          <div className="text-sm text-red-600 font-medium mb-2">
            旧值 (删除)
          </div>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-red-50 p-2 rounded">
            {formatValue(diff.old)}
          </pre>
        </div>
        
        {/* 新值 */}
        <div className="p-4">
          <div className="text-sm text-green-600 font-medium mb-2">
            新值 (添加)
          </div>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-green-50 p-2 rounded">
            {formatValue(diff.new)}
          </pre>
        </div>
      </div>
    </div>
  );
}