// BookCard.js


import React, { useState, useEffect } from 'react';
import bookshelf from '../../utils/bookshelf';


function BookCard({ book, onAddToShelf, userBookshelfId,onRemoveFromShelf }) {
  const [shelfStatus, setShelfStatus] = useState('');

  const handleShelfSelection = (e) => {
    const shelf = e.target.value;
    setShelfStatus(shelf);
    onAddToShelf(book, shelf);
  };

  const handleRemoveFromShelf = async () => {
    if (userBookshelfId) {
      const response = await onRemoveFromShelf(userBookshelfId);
      if (response.error) {
        console.error('Error removing book from shelf:', response.error);
      } else {
        setShelfStatus(''); // Optional: Update UI accordingly
      }
    } else {
      console.error("No userBookshelfId provided for removal.");
    }
  };
  
  


  return (
  <div className="bg-red-500 flex mb-6 mt-6 p-4 rounded-lg shadow-md items-center">
    {/* Render book details */}
    {/* ... */}
      {/* Render book details like title, author, etc. */}
      <img src={book.thumbnailUrl} alt={book.title} className="w-32 h-48 mr-4 rounded object-cover"/>
      <div>  
        <h2 className="text-xl font-bold">{book.title}</h2>
        <h3 className="text-lg mt-2 text-gray-700">{book.author}</h3>
      </div>


    {shelfStatus ? (
      <div className="flex items-center">
        <button className="bg-green-500 text-white py-2 px-4 rounded">
          {shelfStatus}
        </button>
        <button onClick={handleRemoveFromShelf} className="ml-2">
          <img src="/path/to/trashcan_icon.png" alt="Remove" />
        </button>
      </div>
    ) : (
      <select onChange={handleShelfSelection} className="mt-2">
        <option value="">Add to Shelf</option>
        <option value="Want to Read">Want to Read</option>
        <option value="Currently Reading">Currently Reading</option>
        <option value="Read">Read</option>
      </select>
    )}
  </div>
);

}
export default BookCard;