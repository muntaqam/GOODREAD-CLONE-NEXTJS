import BookCard from './BookCard';

function BookList({books}) {

  // Check if books are loaded
  if (!books) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6 flex">
      <div className="bookshelves">
        {/* Your bookshelves code here... */}
        {/* For example: */}
        {/* books.map((book) => (
           <BookShelf key={book.id} book={book} />
         )) */}
      </div>
      <div className="booklist">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        
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
