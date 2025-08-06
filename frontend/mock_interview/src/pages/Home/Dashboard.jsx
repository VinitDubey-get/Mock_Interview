// frontend/src/pages/Home/Dashboard.jsx - Updated with conversation navigation

import React from 'react'
import {LuPlus} from "react-icons/lu";
import{CARD_BG} from "../../utils/data";
import toast from "react-hot-toast";
import DeleteAlertContent from '../../components/Loader/DeleteAlertContent';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { API_PATHS } from '../../utils/apiPath';
import SummaryCard from '../../components/Cards/SummaryCard';
import moment from "moment"
import CreateSessionForm from './CreateSessionForm';
import Modal from '../../components/Modal';




const Dashboard = () => {
  const navigate=useNavigate();

  const [openCreateModal,setOpenCreateModal]=useState(false);

  const [sessions,setSessions]=useState([]);

  const [openDeleteAlert,setOpenDeleteAlert]=useState({
    open:false,
    data:null,
  })

  const fetchAllSessions=async()=>{
    try{
      
      const response=await axiosInstance.get(API_PATHS.SESSION.GET_ALL);

      setSessions(response.data);
     

    }
    catch(error){
      console.error("error fetching the session data ",error);
    }

  };
  
  const deleteSessions=async(sessionData)=>{
    try{
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));

      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({
        open:false,
        data:null,
      });
      fetchAllSessions();

    }
    catch(error){
      console.error("Error deleting session data",error);
    }
  }

  const handleStartConversation = (sessionData) => {
    navigate(`/conversational-interview/${sessionData?._id}`);
  };

  const handleViewQA = (sessionData) => {
    navigate(`/interview-prep/${sessionData?._id}`);
  };

useEffect(() => {
 
    fetchAllSessions();
  
  
}, []);


  return (
    <DashboardLayout>
      <div className="container mx-auto pt-4 pb-4">
        {/* Header Section */}
        <div className="mb-6 px-4 md:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Interview Sessions</h1>
          <p className="text-gray-600">Choose how you want to practice - conversational interview or Q&A format</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0">
            {sessions?.map((data,index)=>(
              <SummaryCard 
                key={data?._id} 
                colors={CARD_BG[index%CARD_BG.length]}
                role={data?.role||""}
                topicsToFocus={data?.topicsToFocus||""}
                experience={data?.experience||"-"}
                questions={data?.questions?.length||"-"}
                description={data?.description||""}
                lastUpdated={
                  data?.updatedAt?moment(data.updatedAt).format("Do MMM YYYY"):""
                }
                onSelect={() => handleViewQA(data)}
                onDelete={() => setOpenDeleteAlert({open:true,data})}
                onStartConversation={() => handleStartConversation(data)}
              />
            ))}

            {/* Empty State */}
            {sessions.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <LuPlus className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interview Sessions Yet</h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Create your first interview session to start practicing with AI-powered questions and conversations.
                </p>
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Your First Session
                </button>
              </div>
            )}
        </div>


          <button
          className='h-12 md:h-12 flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-orange-300 fixed bottom-10 md:bottom-20 right-10 md:right-20 z-50' 
          onClick={() => setOpenCreateModal(true)}>
            <LuPlus className='text-2xl text-white'/>
            Add New</button>
        
      </div>
      
      <Modal isOpen={openCreateModal} onClose={()=>{
        setOpenCreateModal(false);
      }} hideHeader>
        <div >
          <CreateSessionForm/>
        </div>
      </Modal>
       
       <Modal
         isOpen={openDeleteAlert?.open}
         onClose={()=>{
          setOpenDeleteAlert({open:false,data:null});
         }}
         title="Delete Alert"
       >
          <div className='w-[30vw]'>
            <DeleteAlertContent
              content="Are you sure you want to delete this session details?"
              onDelete={()=>deleteSessions(openDeleteAlert.data)}
            />
          </div>
       </Modal>
    
    </DashboardLayout>
  )
}

export default Dashboard