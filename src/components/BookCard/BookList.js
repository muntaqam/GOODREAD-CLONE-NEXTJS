import { useState, useEffect } from 'react';
import BookCard from './BookCard'; 

function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  useEffect(() => {
    async function fetchGoogleBooks() {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=harry+potter&maxResults=10&key=${apiKey}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBooks(data.items);
      } catch (error) {
        console.error("Error fetching Google Books:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGoogleBooks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6 flex">
      <div className="bookshelves">
        <div className="bookshelf">
          <h2>Read</h2>
        </div>
        <div className="bookshelf">
          <h2>Want to Read</h2>
        </div>
        <div className="bookshelf">
          <h2>Currently Reading</h2>
        </div>
      </div>
      <div className="booklist">
        <h1 className="text-2xl font-bold mb-4">Top 10 Harry Potter Books</h1>
        {books.map((book, index) => (
          <BookCard 
            key={index}
            book={{
              title: book.volumeInfo.title,
              author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
              thumbnailUrl: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : '/path/to/default/image.jpg'
            }} 
          />
        ))}
      </div>
    </div>
  );
}

export default BookList;