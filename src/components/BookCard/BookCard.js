// BookCard.js


import React from 'react';

function BookCard({ book, onAddToShelf }) {
  const handleShelfSelection = (e) => {
    const shelf = e.target.value;
    onAddToShelf(book, shelf);
  };

  return (
    <div className="bg-red-500 flex mb-6 mt-6 p-4 rounded-lg shadow-md items-center">
      {/* Render book details like title, author, etc. */}
      <img src={book.thumbnailUrl} alt={book.title} className="w-32 h-48 mr-4 rounded object-cover"/>
      <div>  
        <h2 className="text-xl font-bold">{book.title}</h2>
        <h3 className="text-lg mt-2 text-gray-700">{book.author}</h3>
      </div>

      {/* Dropdown for adding to shelf */}
      <div>
        <select onChange={handleShelfSelection} className="mt-2">
          <option value="">Add to Shelf</option>
          <option value="Want to Read">Want to Read</option>
          <option value="Currently Reading">Currently Reading</option>
          <option value="Read">Read</option>
        </select>
      </div>
    </div>
  );
}
export default BookCard;