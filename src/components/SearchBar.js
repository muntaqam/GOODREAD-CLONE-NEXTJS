import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setSearchResults } from "../store/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ImBooks } from "react-icons/im";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";

function SearchBar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state) => state.search);
  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef(null);
  const debouncedSearch = useRef(null);

  //-------------------- handleSearch -----------------
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

  useEffect(() => {
    debouncedSearch.current = _.debounce(handleSearch, 500);

    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        // Clicked outside of the search container, clear the results
        dispatch(setSearchResults([]));
        if (debouncedSearch.current) {
          debouncedSearch.current.cancel(); // Cancel ongoing debounced calls
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
      if (debouncedSearch.current) {
        debouncedSearch.current.cancel(); // Also cancel on component unmount
      }
    };
  }, []);

  // //------------- handle outside click -------------
  // const handleClickOutside = (event) => {
  //   if (
  //     searchResultsRef.current &&
  //     !searchResultsRef.current.contains(event.target)
  //   ) {
  //     // Clicked outside of the search results, clear the results
  //     dispatch(setSearchResults([]));
  //   }
  // };
  // --------HANDLE SEARCH CHANGE ----------

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch.current(query);
  };

  // --------HANDLE key press ----------
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  return (
    <div ref={searchContainerRef} className="relative search-bar">
      {/* Search Input */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <ImBooks className="grey-icon" />
      </div>
      <input
        type="text"
        placeholder="Search books..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="block w-full pl-10 pr-4 py-2 rounded-lg text-slate-900 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      />
      <button
        onClick={() => handleSearch(searchQuery)}
        className="absolute right-2.5 bottom-2.5"
      >
        <FontAwesomeIcon icon={faSearch} className="grey-icon" />
      </button>

      {/* Search Results Dropdown */}
      {!loading && searchQuery && (
        <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 overflow-hidden">
          {results.map((book, index) => (
            <div
              key={index}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-black"
              onClick={() => router.push(`/book-details/${book.id}`)}
            >
              {/* <img
                src={book.volumeInfo.imageLinks.thumbnail}
                alt={book.volumeInfo.title}
                className="w-10 h-10 object-cover mr-2"
              /> */}
              <img
                src={
                  book.volumeInfo?.imageLinks?.thumbnail || "/bookCoverNA.png"
                }
                alt={book.volumeInfo?.title || "Book cover"}
                className="w-10 h-10 object-cover mr-2"
              />

              <div>{book.volumeInfo.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
