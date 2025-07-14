import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import {
  addBookToUserShelf,
  removeBookFromShelf,
} from "../../store/bookshelfSlice";

function BookCard({ book, userId }) {
  const { title, author, thumbnailUrl } = book;

  const dispatch = useDispatch();
  const router = useRouter();
  // console.log("this is the book ", book);

  const handleShelfSelection = (e) => {
    const shelf = e.target.value;
    // console.log("this is the shelf", shelf);
    // console.log("this is the book---->", book)
    // console.log("this is the userID", userId);
    dispatch(addBookToUserShelf({ userId, book, shelf }));
  };

  const handleRemoveFromShelf = () => {
    // console.log("this is the book id", book.id);
    dispatch(removeBookFromShelf(book.id));
  };

  const navigateToBookDetails = () => {
    router.push(`/book-details/${book.id}`);
  };

  return (
    <div
      onClick={navigateToBookDetails}
      className="bg-gray-300 flex mb-6 mt-6 p-4 rounded-lg shadow-md items-start cursor-pointer book-card"
    >
      <img
        src={
          book.volumeInfo.imageLinks?.thumbnail || "src/images/bookCoverNA.png"
        }
        alt={book.volumeInfo.title}
        className="w-32 h-48 mr-4 rounded object-cover"
      />
      <div className="flex-grow pl-4">
        <h2 className="text-xl font-bold">{book.volumeInfo.title}</h2>
        <h3 className="text-sm mt-2 text-gray-700">
          {book.volumeInfo.authors
            ? book.volumeInfo.authors.join(", ")
            : "Unknown Author"}
        </h3>
      </div>
    </div>
  );
}

export default BookCard;
