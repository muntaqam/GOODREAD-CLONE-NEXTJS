// src/components/Auth/Login.js
import { useState } from 'react';
import  supabase  from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin() {
    try {
        console.log('Supabase Client:', supabase);
        console.log('Supabase Auth:', supabase.auth);

      const { user, error } = await supabase.auth.signIn({ email, password });
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
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
