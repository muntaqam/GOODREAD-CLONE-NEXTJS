import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseClient';



function Dashboard() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = supabase.auth.user();
    if (!user) {
      // Redirect to the login page if the user is not authenticated
      router.push('/login');
    } else {
      // Fetch user-specific data if the user is authenticated
      const fetchUserData = async () => {
        // Example: Fetch user data from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error.message);
        } else {
          setUserData(data);
        }
      };

      fetchUserData();
    }
  }, [router]);

  return (
    <div>
      <h2>Welcome to your dashboard</h2>
      {userData && (
        <div>
          <h3>User Information</h3>
          <p>Email: {userData.email}</p>
          {/* Display other user-specific information here */}
        </div>
      )}
      {/* Rest of your dashboard content */}
    </div>
  );
}

export default Dashboard;
