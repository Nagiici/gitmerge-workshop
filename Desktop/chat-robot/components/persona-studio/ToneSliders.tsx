'use client';

import { ToneConfig } from '@/types';

interface ToneSlidersProps {
  tone: ToneConfig;
  onChange: (tone: ToneConfig) => void;
}

export default function ToneSliders({ tone, onChange }: ToneSlidersProps) {
  const toneSettings = [
    {
      key: 'gentle' as keyof ToneConfig,
      label: '温柔度',
      description: '语言的温和程度',
      leftLabel: '直接',
      rightLabel: '温柔',
      color: 'pink'
    },
    {
      key: 'direct' as keyof ToneConfig,
      label: '直接度',
      description: '表达的直率程度',
      leftLabel: '含蓄',
      rightLabel: '直给',
      color: 'orange'
    },
    {
      key: 'academic' as keyof ToneConfig,
      label: '学术性',
      description: '语言的专业程度',
      leftLabel: '通俗',
      rightLabel: '学术',
      color: 'blue'
    },
    {
      key: 'healing' as keyof ToneConfig,
      label: '治愈性',
      description: '安慰和鼓励的程度',
      leftLabel: '中性',
      rightLabel: '治愈',
      color: 'green'
    },
    {
      key: 'humor' as keyof ToneConfig,
      label: '幽默度',
      description: '幽默和俏皮的程度',
      leftLabel: '严肃',
      rightLabel: '幽默',
      color: 'yellow'
    },
    {
      key: 'formal' as keyof ToneConfig,
      label: '正式度',
      description: '语言的正式程度',
      leftLabel: '随意',
      rightLabel: '正式',
      color: 'purple'
    }
  ];

  const handleSliderChange = (key: keyof ToneConfig, value: number) => {
    onChange({
      ...tone,
      [key]: value / 100 // 转换为0-1范围
    });
  };

  const getColorClasses = (color: string) => {
    const colors = {
      pink: 'bg-pink-500',
      orange: 'bg-orange-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">语气配置</h3>
        <p className="text-sm text-gray-600">调整各项语气特征的权重</p>
      </div>

      {toneSettings.map((setting) => {
        const value = tone[setting.key] * 100; // 转换为0-100范围显示
        
        return (
          <div key={setting.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {setting.label}
                </label>
                <p className="text-xs text-gray-500">{setting.description}</p>
              </div>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                {Math.round(value)}%
              </span>
            </div>

            <div className="space-y-2">
              {/* 滑块容器 */}
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handleSliderChange(setting.key, Number(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${setting.color}`}
                  style={{
                    background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${value}%, #d1d5db ${value}%, #d1d5db 100%)`
                  }}
                />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-lg ${getColorClasses(setting.color)}`}
                  style={{ width: `${value}%` }}
                ></div>
                <div
                  className={`absolute top-1/2 w-4 h-4 rounded-full bg-white border-2 transform -translate-y-1/2 cursor-pointer shadow-sm ${getColorClasses(setting.color).replace('bg-', 'border-')}`}
                  style={{ left: `calc(${value}% - 8px)` }}
                ></div>
              </div>

              {/* 标签 */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>{setting.leftLabel}</span>
                <span>{setting.rightLabel}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 预设按钮 */}
      <div className="pt-4 border-t">
        <p className="text-sm font-medium text-gray-700 mb-3">快速预设：</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({
              gentle: 0.8,
              direct: 0.2,
              academic: 0.3,
              healing: 0.9,
              humor: 0.4,
              formal: 0.3
            })}
            className="px-3 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm hover:bg-pink-200"
          >
            温柔治愈
          </button>
          <button
            type="button"
            onClick={() => onChange({
              gentle: 0.2,
              direct: 0.9,
              academic: 0.4,
              healing: 0.3,
              humor: 0.7,
              formal: 0.2
            })}
            className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200"
          >
            直率幽默
          </button>
          <button
            type="button"
            onClick={() => onChange({
              gentle: 0.4,
              direct: 0.6,
              academic: 0.9,
              healing: 0.3,
              humor: 0.2,
              formal: 0.8
            })}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
          >
            学术专业
          </button>
          <button
            type="button"
            onClick={() => onChange({
              gentle: 0.5,
              direct: 0.5,
              academic: 0.5,
              healing: 0.5,
              humor: 0.5,
              formal: 0.5
            })}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            平衡中性
          </button>
        </div>
      </div>
    </div>
  );
}