'use client';

import { useEffect, useRef } from 'react';

interface AdherenceGaugeProps {
  score: number; // 0-1之间的分数
}

export default function AdherenceGauge({ score }: AdherenceGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const size = 180;
    canvas.width = size;
    canvas.height = size;

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 中心点和半径
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 60;
    const lineWidth = 12;

    // 绘制背景圆弧
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 0.25 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 计算分数对应的角度
    const scoreAngle = 0.75 * Math.PI + (score * 1.5 * Math.PI);

    // 绘制分数圆弧
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, scoreAngle);
    
    // 根据分数设置颜色
    let color;
    if (score >= 0.8) {
      color = '#10b981'; // 绿色 - 优秀
    } else if (score >= 0.6) {
      color = '#f59e0b'; // 黄色 - 良好
    } else {
      color = '#ef4444'; // 红色 - 需要改进
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 绘制分数文本
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(score * 100)}%`, centerX, centerY + 5);

    // 绘制标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText('一致性得分', centerX, centerY + 25);

    // 绘制刻度
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= 10; i++) {
      const angle = 0.75 * Math.PI + (i / 10) * 1.5 * Math.PI;
      const startRadius = radius - lineWidth / 2 - 5;
      const endRadius = radius - lineWidth / 2 - 10;
      
      const startX = centerX + Math.cos(angle) * startRadius;
      const startY = centerY + Math.sin(angle) * startRadius;
      const endX = centerX + Math.cos(angle) * endRadius;
      const endY = centerY + Math.sin(angle) * endRadius;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // 绘制指针
    const pointerAngle = 0.75 * Math.PI + (score * 1.5 * Math.PI);
    const pointerLength = radius - lineWidth / 2 - 2;
    const pointerX = centerX + Math.cos(pointerAngle) * pointerLength;
    const pointerY = centerY + Math.sin(pointerAngle) * pointerLength;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(pointerX, pointerY);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 绘制中心点
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#374151';
    ctx.fill();

  }, [score]);

  // 获取评级文本和颜色
  const getRating = (score: number) => {
    if (score >= 0.9) return { text: '优秀', color: 'text-green-600' };
    if (score >= 0.8) return { text: '良好', color: 'text-green-500' };
    if (score >= 0.7) return { text: '中等', color: 'text-yellow-500' };
    if (score >= 0.6) return { text: '一般', color: 'text-orange-500' };
    return { text: '需要改进', color: 'text-red-500' };
  };

  const rating = getRating(score);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="mb-4"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {/* 评级信息 */}
      <div className="text-center">
        <div className={`text-lg font-semibold ${rating.color}`}>
          {rating.text}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          人格表现与配置的一致性
        </div>
      </div>

      {/* 详细指标 */}
      <div className="mt-4 w-full space-y-2">
        <MetricBar label="语气一致性" value={0.92} />
        <MetricBar label="风格遵循度" value={0.87} />
        <MetricBar label="禁忌词避免" value={0.95} />
        <MetricBar label="示例学习度" value={0.81} />
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600 text-xs">{label}</span>
      <div className="flex items-center space-x-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${value * 100}%` }}
          ></div>
        </div>
        <span className="text-xs font-mono w-8 text-right">
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  );
}