// backend/utils/prompts.js - Add conversational prompt

const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => (`
    You are an AI trained to generate technical interview questions and answers.

    Task:
    -Role: ${role}
    -Candidate Experience: ${experience} years
    -Focus Topics: ${topicsToFocus}
    -Write ${numberOfQuestions} interview questions.
    -For each question, generate a detailed but beginner-friendly answer.
    -If the answer needs a code example, add a small code block inside.
    -Keep formatting very clean.
    -Return a pure JSON array like:
    [
      {
        "question":"Question here?",
        "answer":"Answer here".
      },
      ...
    ]
    Important: Do NOT add any extra text, Only return valid JSON.
`);

const conceptExplainPrompt = (question) => (`
    You are an AI trained to generate explanations for a given interview question,
    
    Task:
    
    -Explain the following interview question and its concept in depth as if you are teaching a beginner developer.
    -Question:"${question}"
    -After the explanation, provide a short and clear title that summarizes the concept for the article or page header.
    -If the explanation includes a code example, provide a small code block.
    -Keep the formatting very clean and clear.
    -Return the result as a valid JSON object in the following format:
    
   {
     "title":"Short title here?",
     "explanation":"Explanation here" 
   }

   Important : Do Not add any extra text outside the JSON format. Only return valid JSON.
`);

const conversationalPrompt = (role, experience, topicsToFocus, phase, conversationHistory = [], userResponse = '') => {
  
  if (phase === 'start') {
    return `You are an experienced interviewer conducting a technical interview for a ${role} position.
    
    Context:
    - Candidate Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    - This is the start of a conversational interview
    
    Instructions:
    - Act as a friendly but professional interviewer
    - Start with a warm greeting and introduction
    - Ask your first question related to the focus topics
    - Keep questions appropriate for ${experience} years of experience
    - Be conversational and natural, not robotic
    - Your response should feel like a real interviewer speaking
    
    Return JSON format:
    {
      "message": "Your greeting and first question here",
      "questionType": "introduction|technical|behavioral|follow-up",
      "difficulty": "easy|medium|hard",
      "expectsResponse": true
    }
    
    Important: Only return valid JSON.`;
  }
  
  if (phase === 'continue') {
    return `You are continuing a technical interview for a ${role} position.
    
    Context:
    - Candidate Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    - Conversation History: ${JSON.stringify(conversationHistory)}
    - Candidate's Latest Response: "${userResponse}"
    
    Instructions:
    - Analyze the candidate's response
    - Provide brief acknowledgment if the answer was good/needs improvement
    - Ask a follow-up question or move to next topic
    - Keep the conversation natural and flowing
    - Gradually increase difficulty based on their responses
    - If answer was incomplete, ask for clarification
    - If answer was good, appreciate and move forward
    
    Return JSON format:
    {
      "message": "Your response and next question here",
      "feedback": "brief feedback on their previous answer",
      "questionType": "technical|behavioral|follow-up|clarification",
      "difficulty": "easy|medium|hard",
      "expectsResponse": true
    }
    
    Important: Only return valid JSON.`;
  }
  
  if (phase === 'end') {
    return `You are ending a technical interview for a ${role} position.
    
    Context:
    - Candidate Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    - Full Conversation History: ${JSON.stringify(conversationHistory)}
    
    Instructions:
    - Provide overall feedback on the interview
    - Highlight strengths and areas for improvement
    - Give specific examples from their responses
    - Provide actionable advice for improvement
    - Be constructive and encouraging
    - End with a professional closing
    
    Return JSON format:
    {
      "message": "Your closing message here",
      "overallFeedback": "Comprehensive feedback on the interview",
      "strengths": ["strength1", "strength2", "strength3"],
      "improvements": ["improvement1", "improvement2"],
      "score": "7/10",
      "recommendedActions": ["action1", "action2"],
      "expectsResponse": false
    }
    
    Important: Only return valid JSON.`;
  }
};

module.exports = {
  questionAnswerPrompt,
  conceptExplainPrompt,
  conversationalPrompt
};