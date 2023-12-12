import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { initiateSearch, setSearchResults } from "../store/actions";
import _ from "lodash";

function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state) => state.search);

  useEffect(() => {
    const checkUser = async () => {
      const session = supabase.auth.getSession(); // Get the current session
      setUser(session?.user || null); // Set user if logged in, null otherwise
      // setLoading(false); // Set loading to false once the check is complete
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

  const handleSearch = async (query) => {
    if (query.length === 0) {
      dispatch(setSearchResults([]));
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}&maxResults=5&key=${apiKey}`
      );
      const data = await response.json();
      dispatch(setSearchResults(data.items || []));
    } catch (error) {
      console.error("Error fetching Google Books:", error);
    }
  };

  const debouncedSearch = _.debounce(handleSearch, 500); // Use lodash debounce

  // Handle the search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("User signed out");
      router.push("/auth"); // Redirect to login page after signing out
    }
  };

  const handleSignIn = () => {
    router.push("/auth"); // Redirect to login page
  };

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <nav className="bg-indigo-600 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Home Link */}
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          Great Reads
        </h1>

        {/* Search Bar and Results */}
        <div className="search-bar relative">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="px-4 py-2 rounded text-black"
          />
          <button
            onClick={handleSearch}
            className="ml-2 py-2 px-4 bg-indigo-800 text-white rounded-md"
          >
            Search
          </button>

          {/* Search Results Dropdown */}
          {loading && <div>Loading...</div>}
          {!loading && searchQuery && (
            <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg">
              {results.map((book, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                  onClick={() => router.push(`/book-details/${book.id}`)}
                >
                  {book.volumeInfo.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User-related Actions */}
        <div>
          {user ? (
            <>
              <button
                onClick={() => router.push("/dashboard")}
                className="mx-2"
              >
                My Bookshelves
              </button>
              <button onClick={() => router.push("/")} className="mx-2">
                Discover
              </button>
              <button
                onClick={handleSignOut}
                className="mx-2 bg-red-500 hover:bg-red-600 rounded py-2 px-4"
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-green-500 hover:bg-green-600 rounded py-2 px-4"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
