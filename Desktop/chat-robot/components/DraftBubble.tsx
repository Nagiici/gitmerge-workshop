'use client';

interface DraftBubbleProps {
  content: string;
  personaAvatar?: string;
}

export default function DraftBubble({ content, personaAvatar }: DraftBubbleProps) {
  if (!content) return null;

  return (
    <div className="flex justify-end mb-4" aria-live="polite">
      <div className="flex max-w-xs lg:max-w-md flex-row-reverse">
        {/* 头像 */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            👤
          </div>
        </div>

        {/* 消息内容 */}
        <div className="mr-2 text-right">
          <div
            className="px-4 py-2 rounded-2xl bg-blue-500 text-white opacity-80 relative"
          >
            <div className="text-sm whitespace-pre-wrap">{content}</div>
            
            {/* 草稿角标 */}
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-1 py-0.5 rounded-full font-medium">
              草稿
            </div>
          </div>
          
          {/* 时间 */}
          <div className="text-xs text-gray-400 mt-1">
            正在输入...
          </div>
        </div>
      </div>
    </div>
  );
}