import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import BookCard from "./BookCard";
import { addBookToShelf } from "../../store/bookshelfSlice";
import supabase from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { setUser } from "../../store/userSlice";
import Loading from "../Loading";

function BookList({ books }) {
  const [userId, setUserId] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const response = await supabase.auth.getUser();
      if (!response || !response.data || !response.data.user) {
        console.log("No session found. Redirecting to login.");
        router.push("/auth");
        return;
      }
      setUserId(response.data.user.id);
      dispatch(setUser({ id: response.data.user.id }));
    };

    getUserData();
  }, [router]);

  const handleAddToShelf = (book, shelf) => {
    if (!userId) {
      console.error("User ID is not available");
      return;
    }
    // console.log("this is booklist userID", userId);
    dispatch(addBookToShelf({ userId, book, shelf }));
  };

  if (!books) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-6 flex">
      <div className="booklist">
        {/* <h1 className="text-2xl font-bold mb-4">Search Results</h1> */}
        {books
          .filter(
            (book) =>
              book.volumeInfo.authors && book.volumeInfo.authors.length > 0
          )
          .map((book, index) => (
            <BookCard
              key={index}
              book={book}
              userId={userId}
              onAddToShelf={handleAddToShelf}
            />
          ))}
      </div>
    </div>
  );
}

export default BookList;
