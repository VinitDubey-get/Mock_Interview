import React from 'react'
import { useParams } from "react-router-dom"
import moment from "moment";
import { AnimatePresence } from 'framer-motion';
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";

import { useEffect, useState } from 'react';

import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { MdOpacity } from 'react-icons/md';
import { motion } from 'framer-motion';
import QuestionCard from '../../components/Cards/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import Drawer from '../../components/Loader/Drawer';
import { TbReceiptYen } from 'react-icons/tb';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import SpinnerLoader from '../../components/Loader/SpinnerLoader'


const InterviewPrep = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = useState(false);
  const [explanation,setExplanation]=useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [error,setError]=useState("");
  // Fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try {
     
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );
      
      // Extract session data from the correct path based on your API structure
      if (response.data && response.data.message) {
        setSessionData(response.data.message);
       
      } 
    } catch (error) {
      console.error("Error fetching session:", error);
      
    } finally{
      setIsLoading(false);
    }
  };

  // Generate concept explanation
  const generateConceptExplanation = async (question) => {
    try{
      setErrorMsg("");
      setExplanation(null);
      
      setIsLoading(true);
      setOpenLeanMoreDrawer(true);

      const response=await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLAINATION,{
          question,
        }
      );
      if(response.data){
        setExplanation(response.data);
      }
    }
    catch(error){
      setExplanation(null);
      setErrorMsg("Failed to generate explaination, Try again later");
      console.error("Error",error);
    }
    finally{
      setIsLoading(false);
    }
  };

  // pin question
  const toggleQuestionPinStatus = async (questionId) => {
    try{
      const response=await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );
      console.log(response);
      if(response.data && response.data.question){
        // toast.success 
        fetchSessionDetailsById();
      }
    }catch(error){
      console.error("Error",error);
    }

  };

  // Add more questions to a session
  // const uploadMoreQuestions = async () => {
  //   try{
  //     setIsUpdateLoader(true);
  //     const aiResponse=await axiosInstance.post(
  //       API_PATHS.AI.GENERATE_QUESTIONS,
  //       {
  //         role:sessionData?.role,
  //         experience:sessionData?.experience,
  //         topicsToFocus:sessionData?.topicsToFocus,
  //         numberOfQuestions:5,
  //       }
  //     );
  //     const generatedQuestions=aiResponse.data;
  //     const response=await axiosInstance.post(
  //       API_PATHS.QUESTION.ADD_TO_SESSION,
  //       {sessionId,
  //         questions:generatedQuestions,
  //       }

  //     );
  //     if(response.data){
  //       toast.success("added questions");
  //       fetchSessionDetailsById();
  //     }
  //   }catch(error){
  //     if(error.response && error.response.data.message ){
  //       setError(error.response.data.message);
  //     }
  //   }
  //   finally{
  //     setIsUpdateLoader(false);
  //   }
  // };

  const uploadMoreQuestions = async () => {
  try {
    setIsUpdateLoader(true);
    setError("");
    
    // Create placeholder questions for immediate UI feedback
    const placeholderQuestions = Array.from({ length: 5 }, (_, index) => ({
      _id: `temp-${Date.now()}-${index}`,
      question: "Generating question...",
      answer: "Please wait while we generate your answer...",
      isPinned: false,
      isGenerating: true // Flag to show loading state
    }));
    
    // Add placeholder questions immediately
    setSessionData(prevData => ({
      ...prevData,
      questions: [...(prevData?.questions || []), ...placeholderQuestions]
    }));
    
    // Now make the API calls
    const aiResponse = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUESTIONS,
      {
        role: sessionData?.role,
        experience: sessionData?.experience,
        topicsToFocus: sessionData?.topicsToFocus,
        numberOfQuestions: 5,
      }
    );
    
    const generatedQuestions = aiResponse.data;
    
    const response = await axiosInstance.post(
      API_PATHS.QUESTION.ADD_TO_SESSION,
      {
        sessionId,
        questions: generatedQuestions,
      }
    );
    
    if (response.data) {
      // Replace placeholder questions with real ones
      setSessionData(prevData => ({
        ...prevData,
        questions: [
          ...(prevData?.questions?.filter(q => !q.isGenerating) || []),
          ...generatedQuestions
        ]
      }));
      toast.success("New questions generated successfully!");
    }
  } catch (error) {
    // Remove placeholder questions on error
    setSessionData(prevData => ({
      ...prevData,
      questions: prevData?.questions?.filter(q => !q.isGenerating) || []
    }));
    
    if (error.response && error.response.data.message) {
      setError(error.response.data.message);
    } else {
      setError("Failed to generate questions. Please try again.");
    }
  } finally {
    setIsUpdateLoader(false);
  }
};

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    } else {
      setErrorMsg("No session ID provided");
      setIsLoading(false);
    }
  }, [sessionId]);


  // Show loading spinner


 
  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || "Unknown Role"}
        topicsToFocus={sessionData?.topicsToFocus || "No topics specified"}
        experience={sessionData?.experience || 0}
        questions={sessionData?.questions?.length || 0}
        description={sessionData?.description || "No description available"}
        lastUpdated={
          sessionData?.updatedAt 
            ? moment(sessionData.updatedAt).format("Do MMM YYYY")
            : "Never"
        }
      />

      <div className="container mx-auto pt-4 pb-4 px-4 md:px-0">
        <h2 className="text-lg font-semibold  color-black">Interview Q & A</h2>
        <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
          <div className={`col-span-12 ${openLeanMoreDrawer?"md:col-span-7":"md:col-span-8"}`}>
               <AnimatePresence>
                {sessionData?.questions?.map((data,index)=>{
                  return (
                    <motion.div
                    key={data._id||index}
                    initial={{opacity:0, y:-20}}
                    animate={{opacity:1, y:0}}
                    exit={{opacity:0, scale:0.95}}
                    transition={{
                      duration:0.4,
                      type:"spring",
                      stiffness:100,
                      delay:index*0.1,
                      damping:15,
                    }} 

                    layout 
                    layoutId={`question-${data._id||index}`}
                  >
                    <>
                      <QuestionCard
                        question={data?.question}
                        answer={data?.answer}
                        onLearnMore={() => generateConceptExplanation(data.question)}
                        isPinned={data?.isPinned}
                        onTogglePin={() => toggleQuestionPinStatus(data._id)}
                      />
                    </>
                      {!isLoading && sessionData?.questions?.length==index+1 && (
                        <div className='flex items-center justify-center mt-5'>
                            <button className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer "
                              disabled={isLoading || isUpdateLoader}
                              onClick={uploadMoreQuestions}
                            >
                              {isUpdateLoader?(
                                <SpinnerLoader/>
                              ):(
                                <LuListCollapse className='text-lg'/>
                              )}{" "}
                              Load More
                            </button>
                        </div>
                      )}
                     
                  </motion.div>
                  );
                })}
               </AnimatePresence>
          </div>
        </div>


        <div >
          <Drawer
            isOpen={openLeanMoreDrawer}
            onClose={()=>setOpenLeanMoreDrawer(false)}
            title={!isLoading && explanation?.title}
          >
              {errorMsg && (
                <p className='flex gap-2 text-sm text-amber-600 font-medium'>
                 <LuCircleAlert className='mt-1'/>{errorMsg}
                </p>
              )}
              {isLoading && <SkeletonLoader/>}
              {!isLoading && explanation &&(
                <AIResponsePreview content={explanation?.explanation}/>
              )}
          </Drawer>
        </div>

      </div>
      
   
    </DashboardLayout>
  )
}

export default InterviewPrep