import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient'; // Adjust the path if necessary

function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const session = supabase.auth.getSession(); // Get the current session
      setUser(session?.user || null); // Set user if logged in, null otherwise
      setLoading(false); // Set loading to false once the check is complete
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    // Return a cleanup function to unsubscribe from the listener
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("User signed out");
      router.push('/auth'); // Redirect to login page after signing out
    }
  };

  const handleSignIn = () => {
    router.push('/auth'); // Redirect to login page
  };

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <nav className="bg-indigo-600 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Great Reads</h1>
        {user ? (
          <button onClick={handleSignOut} className="py-2 px-4 bg-red-500 hover:bg-red-600 rounded">
            Log Out
          </button>
        ) : (
          <button onClick={handleSignIn} className="py-2 px-4 bg-green-500 hover:bg-green-600 rounded">
            Log In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
