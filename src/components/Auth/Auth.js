import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

function Auth() {
  const [showLogin, setShowLogin] = useState(true);

  function switchToRegister() {
    setShowLogin(false);
  }

  function switchToLogin() {
    setShowLogin(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {showLogin ? (
        <Login switchToRegister={switchToRegister} />
      ) : (
        <Register switchToLogin={switchToLogin} />
      )}
    </div>
  );
}

export default Auth;
