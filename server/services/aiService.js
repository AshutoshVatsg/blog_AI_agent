const axios = require('axios');

/**
 * AI Service — Calls AI API for tone analysis and insight generation.
 * Falls back to a rule-based analysis if no API key is configured.
 */

// Analyze the tone/topic/vocabulary of a post's content
const analyzePostTone = async (content) => {
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength =
    sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;

  // If AI API key is configured, use it
  if (process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_ai_api_key_here') {
    try {
      const response = await axios.post(
        `${process.env.AI_API_URL}?key=${process.env.AI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following blog post content and return a JSON object with these fields:
              - tone: one of "casual", "formal", "humorous", "technical"
              - topicCategory: one of "tech", "lifestyle", "opinion", "personal", "science", "business"
              - vocabularyLevel: one of "simple", "moderate", "complex"
              
              Respond with ONLY the JSON object, no markdown formatting, no explanation.
              
              Content: "${content.substring(0, 2000)}"`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;
      const aiResult = JSON.parse(responseText);
      return {
        tone: aiResult.tone || 'casual',
        topicCategory: aiResult.topicCategory || 'opinion',
        vocabularyLevel: aiResult.vocabularyLevel || 'moderate',
        avgSentenceLength,
        wordCount,
        analyzedAt: new Date(),
      };
    } catch (error) {
      console.error('AI API error, falling back to rule-based:', error.message);
    }
  }

  // Fallback: rule-based analysis
  const hasCodeKeywords = /function|const|let|var|import|export|class|=>|console/i.test(content);
  const hasFormalWords = /furthermore|nevertheless|consequently|moreover|whereas/i.test(content);
  const hasHumorWords = /lol|haha|funny|joke|😂|lmao/i.test(content);

  let tone = 'casual';
  if (hasCodeKeywords) tone = 'technical';
  else if (hasFormalWords) tone = 'formal';
  else if (hasHumorWords) tone = 'humorous';

  const techTopics = /javascript|react|node|api|database|mongodb|python|code|programming/i;
  const lifestyleTopics = /morning|routine|health|fitness|food|travel|life/i;
  const scienceTopics = /research|study|data|experiment|hypothesis|theory/i;

  let topicCategory = 'opinion';
  if (techTopics.test(content)) topicCategory = 'tech';
  else if (lifestyleTopics.test(content)) topicCategory = 'lifestyle';
  else if (scienceTopics.test(content)) topicCategory = 'science';

  const uniqueWords = new Set(content.toLowerCase().split(/\s+/));
  const vocabularyLevel =
    uniqueWords.size > 200 ? 'complex' : uniqueWords.size > 100 ? 'moderate' : 'simple';

  return {
    tone,
    topicCategory,
    vocabularyLevel,
    avgSentenceLength,
    wordCount,
    analyzedAt: new Date(),
  };
};

// Generate writing suggestions from aggregated analytics
const generateWritingInsights = async (analyticsData) => {
  if (process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_ai_api_key_here') {
    try {
      const response = await axios.post(
        `${process.env.AI_API_URL}?key=${process.env.AI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Based on this author's writing analytics, generate 3-5 actionable writing suggestions.
              Return a JSON array where each element has:
              - type: one of "tone", "topic", "length", "frequency", "engagement"
              - observation: a brief observation about the data
              - suggestion: a specific actionable suggestion
              - confidence: "high", "medium", or "low"
              
              Analytics data: ${JSON.stringify(analyticsData)}
              
              Respond with ONLY the JSON array, no markdown formatting, no explanation.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(responseText);
    } catch (error) {
      console.error('AI insight generation error:', error.message);
    }
  }

  // Fallback: rule-based insights
  const insights = [];

  if (analyticsData.toneBreakdown) {
    const tones = Object.entries(analyticsData.toneBreakdown);
    if (tones.length > 0) {
      const bestTone = tones.sort((a, b) => (b[1].avgViews || 0) - (a[1].avgViews || 0))[0];
      insights.push({
        type: 'tone',
        observation: `Your ${bestTone[0]} posts perform best with an average of ${bestTone[1].avgViews || 0} views`,
        suggestion: `Consider writing more ${bestTone[0]} content to maximize engagement`,
        confidence: tones.length > 2 ? 'high' : 'medium',
      });
    }
  }

  if (analyticsData.topicBreakdown) {
    const topics = Object.entries(analyticsData.topicBreakdown);
    if (topics.length > 0) {
      const bestTopic = topics.sort((a, b) => (b[1].avgViews || 0) - (a[1].avgViews || 0))[0];
      insights.push({
        type: 'topic',
        observation: `Your ${bestTopic[0]} posts get the most traction`,
        suggestion: `Try combining ${bestTopic[0]} with a different perspective for fresh content`,
        confidence: 'medium',
      });
    }
  }

  if (analyticsData.totalPosts > 0) {
    const avgViews = Math.round(analyticsData.totalViews / analyticsData.totalPosts);
    insights.push({
      type: 'engagement',
      observation: `Your posts average ${avgViews} views across ${analyticsData.totalPosts} posts`,
      suggestion: avgViews < 100
        ? 'Focus on catchy titles and sharing on social media to boost visibility'
        : 'Great engagement! Keep up the consistency and experiment with new topics',
      confidence: 'high',
    });
  }

  if (analyticsData.avgConsensus) {
    const { mindChanging, originality, clarity } = analyticsData.avgConsensus;
    const lowest = Object.entries({ mindChanging, originality, clarity })
      .sort((a, b) => a[1] - b[1])[0];
    if (lowest[1] < 6) {
      insights.push({
        type: 'engagement',
        observation: `Your ${lowest[0]} score (${lowest[1].toFixed(1)}) is your lowest consensus dimension`,
        suggestion: `Try to improve ${lowest[0]} by adding unique perspectives and structuring your arguments more clearly`,
        confidence: 'medium',
      });
    }
  }

  return insights.length > 0 ? insights : [
    {
      type: 'frequency',
      observation: 'Not enough data to generate detailed insights yet',
      suggestion: 'Keep publishing posts to build up your analytics profile',
      confidence: 'low',
    },
  ];
};

module.exports = { analyzePostTone, generateWritingInsights };
