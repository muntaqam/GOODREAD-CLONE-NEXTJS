import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import BookCard from './BookCard';
import { addBookToShelf } from '../../store/bookshelfSlice';
import supabase from '../../lib/supabaseClient';
import { useRouter } from 'next/router'; // Import if you need to redirect
import { setUser } from '../../store/userSlice';

function BookList({ books }) {
  const [userId, setUserId] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize if redirection is needed

  useEffect(() => {
    const getUserData = async () => {
      const response = await supabase.auth.getUser();
      if (!response || !response.data || !response.data.user) {
        console.log("No session found. Redirecting to login.");
        router.push('/auth'); // Redirect if needed
        return;
      }
      setUserId(response.data.user.id);
      dispatch(setUser({ id:response.data.user.id }));
    };

    getUserData();
  }, [router]); // Include router in dependencies if used

  const handleAddToShelf = (book, shelf) => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }
    console.log("this is booklist userID",userId)
    dispatch(addBookToShelf({ userId, book, shelf }));
  };

  if (!books) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6 flex">
      <div className="booklist">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        {books.map((book, index) => (
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