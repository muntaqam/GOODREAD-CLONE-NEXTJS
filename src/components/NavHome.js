import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { initiateSearch, setSearchResults } from "../store/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ImBooks } from "react-icons/im";
import Loading from "./Loading";
import SocialLinks from "./SocialLinks";

import SearchBar from "./SearchBar";
import {
  faBoxArchive,
  faSearch,
  faSwatchbook,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";

import _ from "lodash";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

function Navbar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState({ username: "", profilePicUrl: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state) => state.search);
  const searchResultsRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("light");

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

  useEffect(() => {
    const getUserData = async () => {
      const session = supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      } else {
        const response = await supabase.auth.getUser();
        if (!response || !response.data || !response.data.user) {
          console.log("No session found. Redirecting to login.");
          router.push("/auth");
          return;
        }
        setEmail(response.data.user.email);
        setUserId(response.data.user.id);
        setIsLoading(false);
      }
    };

    getUserData();
  }, [router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile", error);
      }
      if (data) {
        setProfile({
          username: data.username,
          profilePicUrl: data.profile_pic_url,
        });
        // console.log("this is the profile !!!!", profile.profilePicUrl);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

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
      // Clicked outside of the search results, clear the results
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
      router.push("/auth");
    }
  };
  //console.log(profile);

  const handleSignIn = () => {
    router.push("/auth");
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <SocialLinks></SocialLinks>
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <a
          onClick={() => router.push("/")}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white cursor-pointer">
            Great Reads
          </span>
        </a>

        {/* Search Bar - Hidden on small screens, visible on md and larger screens */}
        {/* <div className="hidden md:block">
          <SearchBar />
        </div> */}
        <div className="flex items-center space-x-8">
          {/* Dark/Light Mode Toggle */}
          <input
            id="toggle"
            className="toggle"
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />

          {/* Profile Picture and Dropdown */}
          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative">
            {user ? (
              <>
                <button
                  onClick={toggleDropdown}
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 "
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="w-12 h-12 rounded-full"
                      src={profile.profilePicUrl || "/profpic.png"}
                    alt="user photo"
                  />
                </button>

                {/* Dropdown Menu for Logged-in User */}
                {dropdownOpen && (
                  <div
                    className="absolute z-50 mt-2 w-48 text-base list-none bg-white  rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
                    id="user-dropdown"
                    style={{ top: "100%", right: 0 }}
                  >
                    <div className="px-4 py-3">
                      <span className="block text-sm text-gray-900 dark:text-white">
                        {profile.username || "Username"}
                      </span>
                      <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                        {email || "Email"}
                      </span>
                    </div>
                    <hr />

                    <a
                      onClick={() => router.push("/")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faCompass} className="mr-2" />{" "}
                      Discover
                    </a>
                    <a
                      onClick={() => router.push("/dashboard")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faSwatchbook} className="mr-2" />
                      My Bookshelves
                    </a>
                    <a
                      onClick={handleSignOut}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600  hover:text-red-500  dark:text-gray-200 dark:hover:text-white power-hover cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={faPowerOff}
                        className=" faPowerOff mr-2"
                      />
                      Log Out
                    </a>
                  </div>
                )}
              </>
            ) : (
              // Dropdown Menu for Logged-out User
              dropdownOpen && (
                <div
                  className="z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
                  id="user-dropdown"
                >
                  <a
                    onClick={handleSignIn}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Log In
                  </a>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
