import React, { useState } from 'react'; // Make sure to include useState

function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        onSearch(query);
    };

    return (
        <div className="mb-6 flex w-full">
            <input 
                type="text" 
                placeholder="Search for books..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="flex-grow rounded-md px-3 py-2"
            />
            <button onClick={handleSearch} className="ml-2 py-2 px-4 bg-indigo-600 text-white rounded-md">Search</button>
        </div>
    );
}

export default SearchBar;
