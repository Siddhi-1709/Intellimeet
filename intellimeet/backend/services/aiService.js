const OpenAI = require('openai');
const logger = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateSummary = async (transcriptionText) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI meeting assistant. Summarize the following meeting transcript, extract key points, and list decisions made."
        },
        {
          role: "user",
          content: transcriptionText
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const summaryText = completion.choices[0].message.content;
    
    // Parse the summary into sections
    const summary = {
      summary: summaryText,
      keyPoints: extractKeyPoints(summaryText),
      decisions: extractDecisions(summaryText)
    };
    
    return summary;
  } catch (error) {
    logger.error('Error generating summary:', error);
    throw error;
  }
};

const extractActionItems = async (transcriptionText) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Extract action items from the following meeting transcript. Return as JSON array with fields: title, description, priority (low/medium/high), and suggestedAssignee."
        },
        {
          role: "user",
          content: transcriptionText
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });
    
    let actionItems = completion.choices[0].message.content;
    // Parse the JSON response
    try {
      actionItems = JSON.parse(actionItems);
    } catch (e) {
      // If not JSON, try to extract structured data
      actionItems = parseActionItemsFromText(actionItems);
    }
    
    return actionItems;
  } catch (error) {
    logger.error('Error extracting action items:', error);
    throw error;
  }
};

const transcribeAudio = async (audioFilePath) => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: require('fs').createReadStream(audioFilePath),
      model: "whisper-1",
      response_format: "verbose_json",
      language: "en"
    });
    
    return transcription;
  } catch (error) {
    logger.error('Error transcribing audio:', error);
    throw error;
  }
};

// Helper functions
const extractKeyPoints = (text) => {
  const sentences = text.split(/[.!?]+/);
  return sentences.slice(0, 5).filter(s => s.length > 20).map(s => s.trim());
};

const extractDecisions = (text) => {
  const decisionPatterns = [/decision:/gi, /agreed to/gi, /concluded that/gi, /decided to/gi];
  const decisions = [];
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (decisionPatterns.some(pattern => pattern.test(sentence))) {
      decisions.push(sentence.trim());
    }
  });
  
  return decisions.slice(0, 5);
};

const parseActionItemsFromText = (text) => {
  // Simple parsing logic
  const lines = text.split('\n');
  const actionItems = [];
  
  lines.forEach(line => {
    if (line.match(/^\d+\.|^[-*•]/) && line.length > 10) {
      actionItems.push({
        title: line.substring(0, 50),
        description: line,
        priority: 'medium',
        suggestedAssignee: null
      });
    }
  });
  
  return actionItems;
};

module.exports = { generateSummary, extractActionItems, transcribeAudio };