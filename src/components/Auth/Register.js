import { useState } from 'react';
import supabase from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';

function Register({ switchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null); // New state for error message
  const router = useRouter();
  const dispatch = useDispatch();


  async function handleRegister() {
    setErrorMessage(null); // Clear any previous error messages

    try {
      const { user, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('Error:', error.message);

        if (error.message.includes('already exists')) {
          setErrorMessage('User already registered. Please login.');
        } else {
          setErrorMessage(error.message); // Set a generic error message
        }
      } else {
         const userResponse = await supabase.auth.getUser();
            if (userResponse.data.user) {
                const user = userResponse.data.user;
                console.log('User registered successfully:', user.id);
                dispatch(setUser({ id: user.id, email: user.email }));
                // router.push('/login');
                switchToLogin();
      }
    }
    } catch (error) {
      console.error('Error registering user:', error.message);
      setErrorMessage('An unexpected error occurred.'); // Set a generic error message
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        {/* Error message */}
        {errorMessage && (
          <div className="text-red-500 border border-red-600 bg-red-100 rounded px-4 py-2 mb-4">
            {errorMessage}
          </div>
        )}

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register an account
        </h2>

        <div className="rounded-md shadow-sm space-y-4">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          />
        </div>

        <div>
          <button 
            onClick={handleRegister}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
          </button>
        </div>

        {/* This is the "Already have an account? Login" section */}
        <div className="mt-4 text-center">
          Already have an account?{' '}
          <button 
            className="text-indigo-600 hover:text-indigo-800"
            onClick={switchToLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
