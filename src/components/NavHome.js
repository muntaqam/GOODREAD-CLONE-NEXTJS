import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { initiateSearch, setSearchResults } from "../store/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ImBooks } from "react-icons/im";
import Loading from "./Loading";

import {
  faBoxArchive,
  faSearch,
  faX,
  faBars,
  faSwatchbook,
  faCompass,
} from "@fortawesome/free-solid-svg-icons";

import _ from "lodash";

function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state) => state.search);
  const searchResultsRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    const checkUser = async () => {
      const session = supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const handleClickOutside = (event) => {
    if (
      searchResultsRef.current &&
      !searchResultsRef.current.contains(event.target)
    ) {
      dispatch(setSearchResults([]));
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
    return <Loading />;
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
    return <Loading />;
  }

  return (
    <nav className="bg-gray-800 text-white py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-0">
        {/* Logo and Home Link */}
        <h1
          className="text-xl md:text-2xl font-semibold cursor-pointer"
          onClick={() => router.push("/")}
        >
          Great Reads
        </h1>

        {/* Hamburger Icon for small screens */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>

        {/* Full-Screen Overlay Menu */}
        <div className={`menu-overlay ${isMenuOpen ? "open" : ""} md:hidden`}>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
            <FontAwesomeIcon icon={faX} size="lg" />
          </button>

          <div className="menu-items">
            {user ? (
              <>
                <button
                  onClick={() => {
                    router.push("/");
                    setIsMenuOpen(false);
                  }}
                  className="menu-item"
                >
                  <FontAwesomeIcon icon={faCompass} className="mr-2" />
                  Discover
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="menu-item"
                >
                  <FontAwesomeIcon icon={faSwatchbook} className="mr-2" />
                  My Bookshelves
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="menu-item"
                >
                  Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleSignIn();
                  setIsMenuOpen(false);
                }}
                className="menu-item"
              >
                Log In
              </button>
            )}
          </div>
        </div>

        {/* User-related Actions - Visible on larger screens */}
        <div className="menu md:block hidden">
          {user ? (
            <>
              <button
                onClick={() => router.push("/")}
                className="mx-2 rounded py-2 px-4 transition duration-300"
              >
                <FontAwesomeIcon icon={faCompass} className="mr-2" />
                Discover
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="mx-2 rounded py-2 px-4 transition duration-300"
              >
                <FontAwesomeIcon icon={faSwatchbook} className="mr-2" />
                My Bookshelves
              </button>
              <button
                onClick={handleSignOut}
                className="mx-2 bg-red-500 hover:bg-red-600 rounded py-2 px-4 transition duration-300"
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-blue-500 hover:bg-blue-600 rounded py-2 px-4 transition duration-300"
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
