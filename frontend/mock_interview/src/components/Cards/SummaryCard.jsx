// frontend/src/components/Cards/SummaryCard.jsx - Updated with conversation button

import React from 'react'
import { LuTrash2, LuMessageCircle, LuFileText } from 'react-icons/lu';
import { getInitials } from '../../utils/helper';

const SummaryCard = ({colors,
              role,
              topicsToFocus,
              experience,
              questions,
              description,
              lastUpdated,
              onSelect,
              onDelete,
              onStartConversation}) => {
  return (
    <div className='group w-full h-full bg-white border border-gray-300/40 rounded-xl p-4 overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:shadow-gray-300 relative'>
      <div className="rounded-lg p-4 cursor-pointer relative" style={{background:colors.bgcolor,}} onClick={onSelect}>
        <div className="flex items-start">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4">
            <span className='text-lg font-semibold text-black'>
              {getInitials(role)}
            </span>
          </div>
          {/* content container */}
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              {/*Title and skills */}
              <div >
                 <h2 className='text-[17px] font-medium'>
                    {role}
                 </h2>
                  <p className="text-xs text-medium text-gray-900">
                    {topicsToFocus}
                  </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className='hidden group-hover:flex items-center gap-2 absolute top-2 right-2'>
          <button 
            className='flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:border-blue-200 cursor-pointer'
            onClick={(e) => {
              e.stopPropagation(); 
              onStartConversation();
            }}
            title="Start Conversational Interview"
          >
            <LuMessageCircle size={12} />
            <span className="hidden sm:inline">Talk</span>
          </button>
          
          <button 
            className='flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded border border-green-100 hover:border-green-200 cursor-pointer'
            onClick={(e) => {
              e.stopPropagation(); 
              onSelect();
            }}
            title="View Q&A Session"
          >
            <LuFileText size={12} />
            <span className="hidden sm:inline">Q&A</span>
          </button>
          
          <button 
            className='flex items-center gap-1 text-xs text-rose-500 font-medium bg-rose-100 px-2 py-1 rounded border border-rose-100 hover:border-rose-200 cursor-pointer' 
            onClick={(e) => {
              e.stopPropagation(); 
              onDelete();
            }}
            title="Delete Session"
          >
            <LuTrash2 size={12} />
          </button>
        </div>
      </div>
      

      <div className="px-3 pb-3">
        <div className="flex items-center gap-3 mt-4">
          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            Experience:{experience}{experience==1?"Year":"Years"}
          </div>
          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            {questions} Q&A
          </div>
          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            Last Updated:{lastUpdated}
          </div>
        </div>
        {/*description*/}
        <p className='text-[12px] text-gray-500 font-medium line-clamp-2 mt-3'>{description}</p>
      </div>

    </div>
  )
}

export default SummaryCard