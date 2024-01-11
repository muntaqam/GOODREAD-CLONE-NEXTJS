import React, { useState, useEffect } from "react";
import BookList from "../components/BookCard/BookList";
import SearchBar from "../components/SearchBar";
import Navbar from "src/components/Navbar";
import PopularList from "../components/PopularList";

function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = async (query) => {
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}&maxResults=10&key=${apiKey}`
      );
      const data = await response.json();
      setBooks(data.items);
    } catch (error) {
      console.error("Error fetching Google Books:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Home Page</h1>
      <Navbar />
      <SearchBar onSearch={handleSearch} />
      <BookList books={books} />
      {/* <PopularList /> */}
    </div>
  );
}

export default HomePage;
