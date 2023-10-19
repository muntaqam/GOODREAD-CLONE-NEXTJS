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
      console.log(supabase);
      const { user, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('Error registering user:', error.message);
      } else {
        console.log('User registered successfully:', user);
        // Redirect to a success page or user dashboard
        router.push('/dashboard'); // Change '/dashboard' to your desired URL
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
