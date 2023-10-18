function BookCard({ book }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-xs m-2">
      <img 
        src={book.thumbnailUrl} 
        alt={`${book.title} thumbnail`} 
        className="w-full"
      />
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-2">{book.title}</h2>
        <p className="text-gray-600">{book.author}</p>
      </div>
    </div>
  );
}

export default BookCard;
