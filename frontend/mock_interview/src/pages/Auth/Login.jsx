import {React,useContext,useState} from 'react';
import {useNavigate} from 'react-router-dom'

import { validateEmail } from '../../utils/helper';

import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';

import { BASE_URL,API_PATHS } from '../../utils/apiPath';
import { UserContext } from '../../context/userContext';

const Login = ({setCurrentPage}) => {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState(null);

  
  const {updateUser}=useContext(UserContext)
  const navigate=useNavigate();

  // handle the login form submit
  const handleLogin=async(e)=>{
    e.preventDefault();
    if(!validateEmail(email)){
      setError("Please enter a valid email address");
      return;
    }
    if(!password){
      setError("Please enter the password");
      return;
    }
    setError("");

    // login api call
    try{
       const response=await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
        email,password,
       });

       const {token}=response.data;

       if(token){
        localStorage.setItem("token",token);
        updateUser(response.data);
        navigate("/dashboard");
       }
    }catch(error){
      if(error.response && error.response.data.message){
        setError(error.response.data.message);
      }
      else{
        setError("Something went wrong, try again later")
      }
    }


  }
  return (
    <div className='w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center'>
      <h3 className='text-lg font-semibold text-black'>Welcome Back</h3>

      <p className='text-xs text-slate-700 mt-[5px] mb-6'>Please enter your details to log in</p>

      <form onSubmit={handleLogin}>
        <Input type="text" value={email} onChange={({target})=>setEmail(target.value)} label="Email Address" placeholder='john@example.com'/>
       
       <Input type="password" value={password} onChange={({target})=>setPassword(target.value)} label = 'Password' placeholder='Min 8 Characters' />
       
       {error && <p className='text-red-500 pb-2.5'>{error}</p>}

       <button type='submit' className='btn-primary'>LOGIN</button>

       <p className='text-[13px] text-slate-800 mt-3'>Don't have an account?{" "}
        <button className='font-medium text-primary underline cursor-pointer'  type="button" onClick={()=>{setCurrentPage("signup")}}>SignUp</button>
       </p>
      </form>
    </div>
  )
}

export default Login