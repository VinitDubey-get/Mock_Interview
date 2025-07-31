export const BASE_URL="http://localhost:8000";

export const API_PATHS={
  AUTH:{
    REGISTER:"/api/auth/register", // signup
    LOGIN:"/api/auth/login", // authenticate user & return
    GET_PROFILE:"/api/auth/profile", // get logged-in user details
  },

  IMAGE:{
    UPLOAD_IMAGE:"/api/auth/upload-image",

  },
  AI:{
    GENERATE_QUESTIONS:"/api/ai/generate-questions",
    GENERATE_EXPLAINATION:"/api/ai/generate-explanation",
  },

  SESSION:{
    CREATE:"/api/sessions/create",//create a new interview session with questions
    GET_ALL:"/api/sessions/my-sessions", // get all user sessions
    GET_ONE:(id)=>`/api/sessions/${id}`,// get session details with questions
    DELETE:(id)=>`/api/sessions/${id}`, // delete a sessions
  },

  QUESTION:{
    ADD_TO_SESSION:"/api/questions/add",// add more questions to a session
    PIN:(id)=>`/api/questions/${id}/pin`,// pin or unpin a question
    UPDATE_NOTE:(id)=>`/api/questions/${id}/note`,// update/add a note to a question
  },
  
}