import { useState } from 'react';
import supabase from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

function Login({ switchToRegister }) {  // <-- Destructuring the prop here
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin() {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Error logging in:', error.message);
      } else {
        console.log('User logged in successfully:', user);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  }

   return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Email Input Field */}
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input 
            type="email" 
            id="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md px-3 py-2 w-full"
          />
        </div>

        {/* Password Input Field */}
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input 
            type="password" 
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <button 
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </div>

        <div className="mt-4 text-center">
            Don't have an account?{' '}
            <button 
              className="text-indigo-600 hover:text-indigo-800"
              onClick={switchToRegister}>
              Register
            </button>
        </div>
      </div>
    </div>
  );
}

export default Login;