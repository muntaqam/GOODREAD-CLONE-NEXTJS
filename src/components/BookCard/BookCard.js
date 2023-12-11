import React from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { addBookToUserShelf, removeBookFromShelf } from '../../store/bookshelfSlice';

function BookCard({ book, userId }) {
  const { title, author, thumbnailUrl } = book;

  const dispatch = useDispatch();
  const router = useRouter();
  //  console.log("this is the book ", book)
  //  console.log("this is the book id", book.id)

  const handleShelfSelection = (e) => {
  const shelf = e.target.value;
  console.log("this is the shelf", shelf);
  // console.log("this is the book---->", book)
  console.log("this is the userID",userId)
  dispatch(addBookToUserShelf({ userId, book, shelf }));
};


  const handleRemoveFromShelf = () => {
    console.log("this is the book id", book.id)
    dispatch(removeBookFromShelf(book.id)); // Dispatch action to remove book from shelf
  };


  const navigateToBookDetails = () => {
   router.push(`/book-details/${book.id}`);
  };


  return (
    <div onClick={navigateToBookDetails} className="bg-gray-300 flex mb-6 mt-6 p-4 rounded-lg shadow-md items-center cursor-pointer book-card">
      <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} className="w-32 h-48 mr-4 rounded object-cover" />
      <div className="flex-grow">
        <h2 className="text-xl font-bold">{book.volumeInfo.title}</h2>
        <h3 className="text-lg mt-2 text-gray-700">
  {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author'}
</h3>
      </div>

      <div className="flex items-center">
        <select onChange={handleShelfSelection} className="mt-2">
          <option value="">Select shelf</option>
          <option value="Want to Read">Want to Read</option>
          <option value="Currently Reading">Currently Reading</option>
          <option value="Read">Read</option>
        </select>
        <button onClick={handleRemoveFromShelf} className="ml-2 bg-red-500 text-white py-2 px-4 rounded">
          Remove
        </button>
      </div>
    </div>
  );
}

export default BookCard;