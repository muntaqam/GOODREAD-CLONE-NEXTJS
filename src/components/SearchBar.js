import React, { useState } from "react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query.trim());
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="mb-6 flex w-full">
      <input
        type="text"
        placeholder="Search books by title, author, or ISBN"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-grow rounded-md px-3 py-2"
      />
      <button
        onClick={handleSearch}
        className="ml-2 py-2 px-4 bg-indigo-600 text-white rounded-md"
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;
