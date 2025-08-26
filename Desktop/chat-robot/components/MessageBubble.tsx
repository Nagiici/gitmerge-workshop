'use client';

import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  personaAvatar?: string;
}

export default function MessageBubble({ message, personaAvatar }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* 头像 */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              👤
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg">
              {personaAvatar || '🤖'}
            </div>
          )}
        </div>

        {/* 消息内容 */}
        <div className={`ml-2 mr-2 ${isUser ? 'text-right' : 'text-left'}`}>
          <div
            className={`px-4 py-2 rounded-2xl ${
              isUser
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          </div>
          
          {/* 情绪标签 */}
          {!isUser && message.emotion && (
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <span className="mr-1">{getEmotionEmoji(message.emotion)}</span>
              {getEmotionText(message.emotion)}
            </div>
          )}
          
          {/* 时间 */}
          <div className="text-xs text-gray-400 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// 情绪表情映射
function getEmotionEmoji(emotion: string): string {
  const emojiMap: Record<string, string> = {
    happy: '😊',
    thinking: '🤔',
    surprised: '😲',
    empathetic: '🥺',
    warning: '⚠️',
    comforting: '🤗',
    neutral: '🙂'
  };
  return emojiMap[emotion] || '🙂';
}

// 情绪文本映射
function getEmotionText(emotion: string): string {
  const textMap: Record<string, string> = {
    happy: '开心',
    thinking: '思考',
    surprised: '惊讶',
    empathetic: '同理',
    warning: '警示',
    comforting: '安慰',
    neutral: '中性'
  };
  return textMap[emotion] || emotion;
}