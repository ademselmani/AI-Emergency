import React, { useEffect, useState } from 'react';
import axios from 'axios';

const  Profile = () => {

  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const userid = localStorage.getItem("user_id");

  console.log({
    token , role , userid
  })
  

  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

 
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const response = await axios.get(
          `http://localhost:3000/employee/finduser/${userid}`,
          {  
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in the header
          },
        }
        );
        
        // Check the response status
        if (response.status === 200) {
          setCurrentUser(response.data);
          // Handle the successful response (e.g., display user info)
        }
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      }
    };

    fetchData();
  }, [token, userid]);  // Add necessary dependencies for the useEffect

  return (
  
    <div>
        {currentUser ? (
        <>
          <h1>
            {currentUser.role === "nurse" && "I'm a Nurse 🏥"}
            {currentUser.role === "admin" && "I'm an Admin 🔧"}
            {currentUser.role === "doctor" && "I'm a Doctor 🩺"}
          </h1>
        </>
      ) : (
        <p>Loading user information...</p>
      )}
      {error && <p>{error}</p>}
    </div>
  );

}

export default Profile