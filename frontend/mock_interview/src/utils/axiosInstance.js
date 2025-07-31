import axios from "axios"
import {BASE_URL} from "./apiPath"
const axiosInstance=axios.create({
  baseURL:BASE_URL,
  timeout:150000,
  headers:{
    "Content-Type":"application/json",
    Accept:"application/json",
  },
});

// Rquest Intercepter
axiosInstance.interceptors.request.use(
  (config)=>{
    const accessToken=localStorage.getItem("token");
    if(accessToken){
      config.headers.Authorization=`Bearer ${accessToken}`;
    }
    return config;
  },
  (error)=>{
    return Promise.reject(error);
  }
)

// Response Intercepter
axiosInstance.interceptors.response.use(
  (response)=>{
    return response;
  },
  (error)=>{
    // handle common errors globally
    if(error.response){
      if(error.response.status===401){
        // redirect to login page
        window.location.href="/";
      }
      else if(error.response.status===500){
        console.error("Server error. Please try again later");
      }
      
    }else if(error.code==="ECONNABORATED"){
      console.error("Request timeout. Please try again");
    }
    return Promise.reject(error);
  }
)

export default axiosInstance;
