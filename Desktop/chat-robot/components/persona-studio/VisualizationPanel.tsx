'use client';

import { Persona, PersonaVersion, ToneConfig } from '@/types';
import ToneRadar from './ToneRadar';
import AdherenceGauge from './AdherenceGauge';

interface VisualizationPanelProps {
  persona: Persona | null;
  version: PersonaVersion | null;
}

export default function VisualizationPanel({ persona, version }: VisualizationPanelProps) {
  if (!persona) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
        选择一个人格以查看可视化数据
      </div>
    );
  }

  const currentTone = version?.tone || persona.tone;
  const adherenceScore = 0.85; // 模拟数据，实际应该从metrics获取

  return (
    <div className="space-y-4">
      {/* 语气雷达图 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-800 mb-4">语气特征</h3>
        <ToneRadar tone={currentTone} />
      </div>

      {/* 一致性仪表盘 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-800 mb-4">人格一致性</h3>
        <AdherenceGauge score={adherenceScore} />
      </div>

      {/* 统计数据 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-800 mb-4">使用统计</h3>
        <div className="space-y-3">
          <StatItem label="会话数" value="12" />
          <StatItem label="消息数" value="156" />
          <StatItem label="平均响应时间" value="1.2s" />
          <StatItem label="用户满意度" value="94%" />
        </div>
      </div>

      {/* 版本信息 */}
      {version && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-gray-800 mb-4">版本信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">版本号:</span>
              <span className="font-mono">v{version.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">创建时间:</span>
              <span>{new Date(version.createdAt).toLocaleDateString()}</span>
            </div>
            {version.changeLog && (
              <div>
                <span className="text-gray-600">变更说明:</span>
                <p className="text-gray-800 mt-1">{version.changeLog}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}