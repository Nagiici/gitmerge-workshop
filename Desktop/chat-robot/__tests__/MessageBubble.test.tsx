import { render, screen } from '@testing-library/react';
import MessageBubble from '@/components/MessageBubble';

describe('MessageBubble', () => {
  const mockMessage = {
    id: '1',
    role: 'user' as const,
    content: 'Hello, world!',
    timestamp: new Date('2024-01-01T12:00:00'),
  };

  test('渲染用户消息', () => {
    render(<MessageBubble message={mockMessage} />);
    
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    expect(screen.getByText('12:00:00')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  test('渲染AI消息', () => {
    const aiMessage = {
      ...mockMessage,
      role: 'assistant' as const,
      emotion: 'happy',
    };
    
    render(<MessageBubble message={aiMessage} personaAvatar="🤖" />);
    
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('开心')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  test('渲染没有情绪的消息', () => {
    const messageWithoutEmotion = {
      ...mockMessage,
      role: 'assistant' as const,
    };
    
    render(<MessageBubble message={messageWithoutEmotion} />);
    
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    // 不应该显示情绪标签
    expect(screen.queryByText('开心')).not.toBeInTheDocument();
  });
});