const Session=require("../models/Session");
const Question=require("../models/Question");
const { SiProcessingfoundation } = require("react-icons/si");

// @desc Create a new session and Linked questions
// @route Post/api/sessions/create
// @access Private

exports.createSession=async (req,res)=>{
  try{
    const {role,experience,topicsToFocus,description,questions}=req.body;
    
    const userId=req.user._id;
    const session=await Session.create({
      user:userId,
      role,
      experience,
      topicsToFocus,
      description,
    })

    const quesitonDocs=await Promise.all(
      questions.map(async (q)=>{
        const question=await Question.create({
          session:session._id,
          question:q.question,
          answer:q.answer,

        });
        return question._id;
      })
    );

    session.questions=quesitonDocs;
    await session.save();
    res.status(201).json({success:true,session})

  }catch(error){
    res.status(500).json({success:false,message:"Server Error"});
  }
};

// @desc gell all sessions for the logged-in user
// @route get/api/sessions/my-sessions
// @access private
exports.getMySessions=async(req,res)=>{
  try{
    const sessions=await Session.find({user:req.user.id})
    .sort({createdAt:-1})
    .populate("questions");
    res.status(200).json(sessions);

  }catch(error){
    res.status(500).json({success:false,message:"Server Error"});
  }
};


// @desc get a session by id with populated question
// @route get/api/sessions
// @aceess private
exports.getSessionById=async(req,res)=>{
  try{
    const session=await Session.findById(req.params.id)
    .populate({
      path:"questions",
      options:{sort:{isPinned:-1,createdAt:1}},
    })
    .exec();

    if(!session){
      return res
      .status(404)
      .json({success:false,message:"Session not found"});
    }
    res.status(200).json({success:true,message:session});
  }catch(error){
    res.status(500).json({success:false,message:"Server Error"});
  }
};

// @desc delete a session and its questions
// @route delete/api/sessions/:id
// @access private
exports.deleteSession=async(req,res)=>{
  try{
    const session=await Session.findById(req.params.id);
    if(!session){
      return res.status(404).json({message:"Session not found"});
    }
    // check if logged-in user owns this sesssion
    if(session.user.toString()!==req.user.id){
      return res.status(401).json({message:"Not authorized to delete this session"});
    }


    // first delete all questions linked to this session
    await Question.deleteMany({session:session._id});

    // now delete the session
    await session.deleteOne();

    res.status(200).json({message:"Session deleted successfully"});

  }catch(error){
    res.status(500).json({success:false,message:"Server Error"});
  }
}

