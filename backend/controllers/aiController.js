const {GoogleGenAI}=require("@google/genai");
const {conceptExplainPrompt, questionAnswerPrompt}=require("../utils/prompts")

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

// @desc Generate interview questions and answers using gemini
// @route POST/api/generate-qestions
// @access private

const generateInterviewQuestions=async(req,res)=>{
  try{
    const{role,experience,topicsToFocus,numberOfQuestions}=req.body;

    if(!role || !experience || !topicsToFocus ||!numberOfQuestions){
      return res.status(400).json({message:"Missing required fields"});
    }

    const prompt=questionAnswerPrompt(role,experience,topicsToFocus,numberOfQuestions);

    const response=await ai.models.generateContent({
      model:"gemini-2.5-pro",
      contents:prompt,
    })

    let rawText=response.text;

    // clean it: Remove ```json and ``` from beginning and end
    const cleanedText=rawText
    .replace(/^```json\s*/,"") // remove starting 
    .replace(/```$/,"") // remove ending ```
    .trim(); // remove
    
    // now safe to parse
    const data=JSON.parse(cleanedText);


    res.status(200).json(data);

  }
  catch(error){
    return res.status(500).json({message:"Failed to generate question due to server error",
      error:error.message
    });
  }
};

// @desc Generate explains a interview question
// @route post/api/ai/generate-questions
// @access Private
const generateConceptExplanation=async(req,res)=>{
  try{
    const {question}=req.body;
    if(!question){
      return res.status(400).json({message:"Missing required fields"});
    }
    const prompt =conceptExplainPrompt(question);
    const response=await ai.models.generateContent({
      model:"gemini-2.5-pro",
      contents:prompt,
    });

    let rawText=response.text;

    //clean it remove the ``` json and ``` vrom begining and end
    const cleanedText=rawText
    .replace(/^```json\s*/,"") // remove the starting ```json
    .replace(/```$/,"") // remove ending
    .trim(); // remove the extra space

    const data=JSON.parse(cleanedText);
    res.status(200).json(data);
  }
  catch(error){
    res.status(500).json({message:"Failed to generate questions",error:error.message});
  }

};


const startConversationalInterview = async(req, res) => {
  try {
    const { role, experience, topicsToFocus } = req.body;
    
    if (!role || !experience || !topicsToFocus) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conversationalPrompt(role, experience, topicsToFocus, 'start');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    let rawText = response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    
    const data = JSON.parse(cleanedText);
    
    res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({
      message: "Failed to start conversation",
      error: error.message
    });
  }
};

// @desc Continue conversational interview
// @route POST/api/ai/continue-conversation
// @access private
const continueConversationalInterview = async(req, res) => {
  try {
    const { 
      role, 
      experience, 
      topicsToFocus, 
      conversationHistory, 
      userResponse 
    } = req.body;
    
    if (!role || !experience || !topicsToFocus || !userResponse) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conversationalPrompt(
      role, 
      experience, 
      topicsToFocus, 
      'continue',
      conversationHistory,
      userResponse
    );
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    let rawText = response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    
    const data = JSON.parse(cleanedText);
    
    res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({
      message: "Failed to continue conversation",
      error: error.message
    });
  }
};

// @desc End conversational interview and get feedback
// @route POST/api/ai/end-conversation
// @access private
const endConversationalInterview = async(req, res) => {
  try {
    const { 
      role, 
      experience, 
      topicsToFocus, 
      conversationHistory 
    } = req.body;
    
    if (!role || !experience || !topicsToFocus || !conversationHistory) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conversationalPrompt(
      role, 
      experience, 
      topicsToFocus, 
      'end',
      conversationHistory
    );
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    let rawText = response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    
    const data = JSON.parse(cleanedText);
    
    res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({
      message: "Failed to end conversation",
      error: error.message
    });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
  startConversationalInterview,
  continueConversationalInterview,
  endConversationalInterview
};
