const User=require("../models/User")
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

// Generate jwt token
const generateToken=(userId)=>{
  return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:"7d"});
};

// @desc register a new user
// @route post/api/aut/regitser
//@access public
const registerUser=async(req,res)=>{
  try{
 
    const{name,email,password,profileImageUrl}=req.body;

    // check if user already exist
    const userExists=await User.findOne({email});
    if(userExists){
      return res.status(400).json({message:"user already exists"});
    }
    // hash password
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);
    
    // create new user
    const user=await User.create({
      name,email,password:hashedPassword,profileImageUrl,
    });

    // return the user data with jwt
    res.status(201).json({
      _id:user._id,
      name:user.name,
      email:user.email,
      profileImageUrl:user.profileImageUrl,
      token:generateToken(user._id),

    });


  }
  catch(error){
    res.status(500).json({message:"Server error",error:error.message})
  }

};


// login user
// post/api/auth/login
// access public
const loginUser=async(req,res)=>{

  try{
      const {email,password}=req.body;
      
      const user=await User.findOne({email});
      if(!user){
        return res.status(500).json({message:"Invalid email or password"});
      }
        // compare password
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
          return res.status(500).json({message:"Password not Matched"})
        }
        res.json({
          _id:user._id,
          name:user.name,
          email:user.email,
          profileImageUrl:user.profileImageUrl,
          token:generateToken(user._id),
        });
      
  }
  catch(error){
     res.status(500).json({message:"Server error",error:error.message})
  }

};



// get user profile
// get/api/auth/profile
// prive requires jwt
const getUserProfile=async(req,res)=>{
    try{
      const user=await User.findById(req.user.id).select("-password");
      if(!user){
        return res.status(404).json({message:"User not found"});
      }
      res.json(user);
      

  }
  catch(error){
     res.status(500).json({message:"Server error",error:error.message})
  }
}


module.exports={registerUser,loginUser,getUserProfile};