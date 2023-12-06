import React, { useState, useEffect } from 'react';
import BookCard from './BookCard';
import bookshelf from '../../utils/bookshelf';
import supabase from '../../lib/supabaseClient';

function BookList({ books }) {
  const [userId, setUserId] = useState(null);

   useEffect(() => {
    const getUserData = async () => {
      const response = await supabase.auth.getUser();
      console.log("User object:", response); // Log the response object

      if (!response || !response.data || !response.data.user) {
        console.log("No session found. Redirecting to login.");
        //router.push('/auth');

        return;
      }
      console.log(response.data.user.id)
      setUserId(response.data.user.id);
      //setIsLoading(false); // Set loading state to false
    };

    getUserData();
  }, []);
  

  const handleAddToShelf = async (book, shelf) => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    // Assuming each book has a unique identifier in book.id
    const response = await bookshelf.addBookToShelf(userId, book.id, shelf);

    if (response.error) {
      console.error('Error adding book to shelf:', response.error);
    } else {
      console.log('Book added to shelf successfully');
    }
  };

  // Check if books are loaded
  if (!books) return <div>Loading...</div>;

  return (
    // Existing BookList rendering logic...
  <div className="container mx-auto px-4 py-6 flex">
    <div className="booklist">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      
      {books.map((book, index) => (
        <BookCard 
          key={index}
          book={{
            id: book.id, // Make sure to pass the book's unique identifier
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
            thumbnailUrl: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : '/path/to/default/image.jpg'
          }}
          onAddToShelf={handleAddToShelf}
        />
      ))}
    </div>
  </div>
);
 
}

export default BookList;
