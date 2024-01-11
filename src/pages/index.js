import Head from "next/head";
import React, { useState, useEffect } from "react";
import Navbar from "src/components/NavHome";
import PopularList from "src/components/PopularList";
import BookList from "../components/BookCard/BookList";
import SearchBar from "../components/SearchBar";

export default function Home() {
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
    <div className="bg-gray-100 min-h-screen font-sans">
      <Head>
        <title>GreatReads </title>
        <link rel="icon" href="/logo.ico" />
      </Head>
      <Navbar></Navbar>
      <main className="p-4">
        <SearchBar onSearch={handleSearch} />
        {/* <BookList books={books} /> */}
      </main>

      <PopularList />
      <footer className="footer bg-slate-800 text-white p-4 mt-6">
        <p className="text-center">
          &copy; 2024 GreatReads, Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
