// src/components/Auth/Register.js
import { useState } from 'react';
import supabase  from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleRegister() {
  try {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Error registering user:', error.message);
      // Check if the error message indicates the user is already registered
      if (error.message.includes('already exists')) {
        // Try logging in the user since they're already registered
        const { user: loggedInUser, error: loginError } = await supabase.auth.signIn({ email, password });
        if (loginError) {
          console.error('Error logging in:', loginError.message);
        } else {
          console.log('User logged in successfully:', loggedInUser);
          router.push('/dashboard');
        }
      }
    } else {
      console.log('User registered successfully:', user);
      router.push('/dashboard'); 
    }
  } catch (error) {
    console.error('Error registering user:', error.message);
  }
}



  return (
    <div>
      <h2>Register</h2>
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
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
