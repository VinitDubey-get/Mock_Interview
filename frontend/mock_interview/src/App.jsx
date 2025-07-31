import React from 'react';
import {BrowserRouter as Router , Routes , Route} from "react-router-dom";
import {Toaster} from "react-hot-toast";

import UserProvider from "./context/userContext"
import LandingPage from './pages/LandingPage';
import Dashboard from "./pages/Home/Dashboard"
import InterviewPrep from "./pages/InterviewPrep/InterviewPrep"


const App = () => {
  return (
    <UserProvider>
    <div>
      <Router>
         <Routes>
           {/* default route */}
           <Route path='/' element={<LandingPage/>}></Route>
           
           <Route path='/dashboard' element={<Dashboard/>}></Route>
           <Route path='/interview-prep/:sessionId' element={<InterviewPrep/>}></Route>
         </Routes>
      </Router>

      <Toaster
        toastOptions={{
          className:"",
          style:{
            fontSize:"13px,"
          }
        }}
      
      />

      
    </div>
    </UserProvider>
  )
}

export default App