import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient'; // Adjust path if necessary

function Navbar() {
    const router = useRouter();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            console.log("User signed out");
            router.push('/login');
        }
    };

    return (
        <nav className="bg-indigo-600 text-white py-4">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo or title on the left */}
                <h1 className="text-2xl font-bold">GreatReads</h1>

                {/* Sign out button on the right */}
                <button 
                    onClick={handleSignOut}
                    className="py-2 px-4 bg-red-500 hover:bg-red-600 rounded"
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
