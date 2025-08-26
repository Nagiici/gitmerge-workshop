'use client';

import { useEffect, useRef } from 'react';
import { ToneConfig } from '@/types';

interface ToneRadarProps {
  tone: ToneConfig;
}

export default function ToneRadar({ tone }: ToneRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 中心点和半径
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = 120;

    // 语气配置
    const toneItems = [
      { key: 'gentle', label: '温柔', color: '#ec4899' },
      { key: 'direct', label: '直接', color: '#f97316' },
      { key: 'academic', label: '学术', color: '#3b82f6' },
      { key: 'healing', label: '治愈', color: '#10b981' },
      { key: 'humor', label: '幽默', color: '#eab308' },
      { key: 'formal', label: '正式', color: '#8b5cf6' }
    ];

    // 绘制网格线
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // 绘制同心圆
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius * i) / 4, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // 绘制轴线
    toneItems.forEach((_, index) => {
      const angle = (index * 2 * Math.PI) / toneItems.length - Math.PI / 2;
      const endX = centerX + Math.cos(angle) * maxRadius;
      const endY = centerY + Math.sin(angle) * maxRadius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });

    // 绘制数据多边形
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 2;

    toneItems.forEach((item, index) => {
      const value = tone[item.key as keyof ToneConfig];
      const angle = (index * 2 * Math.PI) / toneItems.length - Math.PI / 2;
      const radius = value * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 绘制数据点
    toneItems.forEach((item, index) => {
      const value = tone[item.key as keyof ToneConfig];
      const angle = (index * 2 * Math.PI) / toneItems.length - Math.PI / 2;
      const radius = value * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 绘制标签
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    toneItems.forEach((item, index) => {
      const angle = (index * 2 * Math.PI) / toneItems.length - Math.PI / 2;
      const labelRadius = maxRadius + 25;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;

      ctx.fillText(item.label, x, y);
    });

  }, [tone]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="border rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {/* 图例 */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {Object.entries(tone).map(([key, value]) => {
          const labels = {
            gentle: '温柔',
            direct: '直接',
            academic: '学术',
            healing: '治愈',
            humor: '幽默',
            formal: '正式'
          };
          
          const colors = {
            gentle: '#ec4899',
            direct: '#f97316',
            academic: '#3b82f6',
            healing: '#10b981',
            humor: '#eab308',
            formal: '#8b5cf6'
          };

          return (
            <div key={key} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[key as keyof typeof colors] }}
              ></div>
              <span className="text-gray-600">
                {labels[key as keyof typeof labels]}: {Math.round(value * 100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}