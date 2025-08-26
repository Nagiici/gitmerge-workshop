import { filterSensitiveContent, checkRateLimit } from '@/lib/api-utils';

describe('API Utilities', () => {
  describe('filterSensitiveContent', () => {
    test('过滤敏感词', () => {
      const text = '这是一个包含违法内容的文本';
      const filtered = filterSensitiveContent(text);
      expect(filtered).toBe('这是一个包含**内容的文本');
    });

    test('不包含敏感词时返回原文本', () => {
      const text = '这是一个正常的文本';
      const filtered = filterSensitiveContent(text);
      expect(filtered).toBe(text);
    });

    test('处理空字符串', () => {
      const filtered = filterSensitiveContent('');
      expect(filtered).toBe('');
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // 清除速率限制状态
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('允许新IP的请求', () => {
      const result = checkRateLimit('192.168.1.1');
      expect(result).toBe(true);
    });

    test('限制频繁请求', () => {
      const ip = '192.168.1.2';
      
      // 前100次请求应该被允许
      for (let i = 0; i < 100; i++) {
        expect(checkRateLimit(ip)).toBe(true);
      }
      
      // 第101次请求应该被限制
      expect(checkRateLimit(ip)).toBe(false);
    });

    test('时间窗口过后重置限制', () => {
      const ip = '192.168.1.3';
      
      // 用尽限额
      for (let i = 0; i < 100; i++) {
        checkRateLimit(ip);
      }
      expect(checkRateLimit(ip)).toBe(false);
      
      // 时间前进16分钟（超过15分钟窗口）
      jest.advanceTimersByTime(16 * 60 * 1000);
      
      // 应该重置限制
      expect(checkRateLimit(ip)).toBe(true);
    });
  });
});