import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import SocialLinks from "../SocialLinks";

function Auth() {
  const [showLogin, setShowLogin] = useState(true);

  function switchToRegister() {
    setShowLogin(false);
  }

  function switchToLogin() {
    setShowLogin(true);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SocialLinks />
        
       
        {showLogin ? (
          <Login switchToRegister={switchToRegister} />
        ) : (
          <Register switchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
}

export default Auth;
