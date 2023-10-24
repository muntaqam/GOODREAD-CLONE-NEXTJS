import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

function Dashboard() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const response = await supabase.auth.getUser();
      console.log("User object:", response); // Log the response object

      if (!response || !response.data || !response.data.user) {
        console.log("No session found. Redirecting to login.");
        router.push('/login');
        return;
      }

      console.log("User email:", response.data.user.email); // Log the user email
      setEmail(response.data.user.email); // Set the email state
    };

    getUserData();
  }, [router]);

  console.log("Email state:", email); // Log the email state
  console.log("Dashboard rendered"); // Log that the dashboard is being rendered

  return (
    <div>
      <h2>Welcome to your dashboard</h2>
      <div>
        <h3>User Information</h3>
        <p>Email: {email}</p>
      </div>
      {/* Rest of your dashboard content */}
    </div>
  );
}

export default Dashboard;
