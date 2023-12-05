import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

function Dashboard() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const response = await supabase.auth.getUser();
      console.log("User object:", response); // Log the response object

      if (!response || !response.data || !response.data.user) {
        console.log("No session found. Redirecting to login.");
        router.push('/auth');
        return;
      }

      console.log("User email:", response.data.user.email); // Log the user email
      setEmail(response.data.user.email); // Set the email state
      setIsLoading(false); // Set loading state to false
    };

    getUserData();
  }, [router]);

  console.log("Email state:", email); // Log the email state
  console.log("Dashboard rendered"); // Log that the dashboard is being rendered

  if (isLoading) { // Render loading state
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Navbar at the top */}
      <Navbar />

      {/* Flex container for the two columns */}
      <div className="flex">
        {/* Left Column: Vertical Navigation */}
        <div className="w-1/4 min-h-screen bg-gray-100 p-4">
          <ul>
            <li className="my-2 p-2 hover:bg-gray-200">Read</li>
            <li className="my-2 p-2 hover:bg-gray-200">Want to Read</li>
            <li className="my-2 p-2 hover:bg-gray-200">Currently Reading</li>
          </ul>
        </div>

        {/* Right Column: Main Content */}
        <div className="w-3/4 p-4">
          <h2>Welcome to your dashboard</h2>
          <div>
            <h3>User Information</h3>
            <p>Email: {email}</p>
          </div>
          {/* Rest of your dashboard content */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;