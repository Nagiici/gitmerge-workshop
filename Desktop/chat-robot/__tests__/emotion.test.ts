import { emotionAnalyzer } from '@/lib/emotion';

describe('EmotionAnalyzer', () => {
  describe('analyzeByRules', () => {
    test('识别开心情绪', () => {
      const result = emotionAnalyzer.analyzeByRules('我今天非常开心！');
      expect(result).toBe('happy');
    });

    test('识别思考情绪', () => {
      const result = emotionAnalyzer.analyzeByRules('让我思考一下这个问题');
      expect(result).toBe('thinking');
    });

    test('识别惊讶情绪', () => {
      const result = emotionAnalyzer.analyzeByRules('天啊！这太令人惊讶了！');
      expect(result).toBe('surprised');
    });

    test('识别同理情绪', () => {
      const result = emotionAnalyzer.analyzeByRules('我理解你的感受');
      expect(result).toBe('empathetic');
    });

    test('识别警示情绪', () => {
      const result = emotionAnalyzer.analyzeByRules('小心！那里很危险');
      expect(result).toBe('warning');
    });

    test('识别安慰情绪', () => {
      const result = emotionAnalyzer.analyzeByRules('没关系，一切都会好起来的');
      expect(result).toBe('comforting');
    });

    test('默认中性情绪', () => {
      const result = emotionAnalyzer.analyzeByRules('这是一个普通的句子');
      expect(result).toBe('neutral');
    });
  });

  describe('getEmoji', () => {
    test('获取默认表情符号', () => {
      const emoji = emotionAnalyzer.getEmoji('happy');
      expect(emoji).toBe('😊');
    });

    test('使用自定义表情映射', () => {
      const customMap = { happy: '🎉' };
      const emoji = emotionAnalyzer.getEmoji('happy', customMap);
      expect(emoji).toBe('🎉');
    });

    test('未知情绪返回默认表情', () => {
      const emoji = emotionAnalyzer.getEmoji('unknown' as any);
      expect(emoji).toBe('🙂');
    });
  });
});