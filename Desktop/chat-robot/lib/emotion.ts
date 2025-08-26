import { EmotionType } from '@/types';

export class EmotionAnalyzer {
  // 基于规则的情绪分析
  analyzeByRules(text: string): EmotionType {
    const lowerText = text.toLowerCase();
    
    // 开心情绪关键词
    const happyKeywords = ['开心', '高兴', '快乐', '幸福', '哈哈', '呵呵', '真好', '太棒了', 'awesome', 'great', 'wonderful'];
    // 思考情绪关键词  
    const thinkingKeywords = ['思考', '想想', '考虑', '疑惑', '问题', '为什么', '如何', '怎样', 'think', 'consider', 'wonder'];
    // 惊讶情绪关键词
    const surprisedKeywords = ['惊讶', '惊奇', '居然', '竟然', '没想到', '天啊', '哇', 'surprise', 'amazing', 'wow'];
    // 同理情绪关键词
    const empatheticKeywords = ['理解', '明白', '感受', '体会', '同情', '抱歉', '对不起', 'understand', 'feel', 'sorry'];
    // 警示情绪关键词
    const warningKeywords = ['危险', '警告', '注意', '小心', '不要', '别', '危险', 'warning', 'careful', 'danger'];
    // 安慰情绪关键词
    const comfortingKeywords = ['安慰', '鼓励', '支持', '加油', '没关系', '会好的', 'comfort', 'encourage', 'support'];

    // 检查关键词匹配
    if (happyKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'happy';
    }
    if (thinkingKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'thinking';
    }
    if (surprisedKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'surprised';
    }
    if (empatheticKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'empathetic';
    }
    if (warningKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'warning';
    }
    if (comfortingKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'comforting';
    }

    // 默认中性情绪
    return 'neutral';
  }

  // 使用机器学习模型进行情绪分析（可插拔实现）
  async analyzeWithModel(text: string): Promise<EmotionType> {
    // 这里可以集成Hugging Face、腾讯NLP等情感分析API
    // 以下是模拟实现
    
    try {
      // 示例：调用外部情感分析API
      const response = await fetch('https://api.example.com/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SENTIMENT_API_KEY}`
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const result = await response.json();
        return this.mapSentimentToEmotion(result.sentiment);
      }
    } catch (error) {
      console.warn('情感分析API调用失败，回退到规则分析:', error);
    }

    // API调用失败时回退到规则分析
    return this.analyzeByRules(text);
  }

  // 将情感分析结果映射到我们的情绪类型
  private mapSentimentToEmotion(sentiment: string): EmotionType {
    const mapping: Record<string, EmotionType> = {
      'positive': 'happy',
      'negative': 'empathetic',
      'neutral': 'neutral',
      'joy': 'happy',
      'anger': 'warning',
      'sadness': 'empathetic',
      'fear': 'warning',
      'surprise': 'surprised'
    };

    return mapping[sentiment] || 'neutral';
  }

  // 主分析方法（根据配置选择规则或模型）
  async analyze(text: string, useModel: boolean = false): Promise<EmotionType> {
    if (useModel && process.env.SENTIMENT_API_KEY) {
      return this.analyzeWithModel(text);
    }
    return this.analyzeByRules(text);
  }

  // 获取表情符号
  getEmoji(emotion: EmotionType, personaEmotionMap: Record<string, string> = {}): string {
    const defaultEmojiMap: Record<EmotionType, string> = {
      happy: '😊',
      thinking: '🤔',
      surprised: '😲',
      empathetic: '🥺',
      warning: '⚠️',
      comforting: '🤗',
      neutral: '🙂'
    };

    // 优先使用人格特定的表情映射
    return personaEmotionMap[emotion] || defaultEmojiMap[emotion] || '🙂';
  }
}

export const emotionAnalyzer = new EmotionAnalyzer();