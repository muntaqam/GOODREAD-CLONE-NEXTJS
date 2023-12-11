import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import fetchBookDetails from "../../utils/fetchBookDetails";
import Navbar from "../../components/Navbar";
import { setUser } from "../../store/userSlice";

import { useDispatch, useSelector } from "react-redux";
import { addBookToUserShelf } from "../../store/bookshelfSlice";

function BookDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.id);

  useEffect(() => {
    // Fetch the book details based on the ID
    if (id) {
      fetchBookDetails(id)
        .then((data) => setBook(data))
        .catch((error) => setError(error.message));
    }
    // Check if userId is stored in local storage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      // Update Redux store with userId from local storage
      dispatch(setUser({ id: storedUserId })); // Assuming setUser action updates userId in state
    }
  }, [id, dispatch]);

  const handleShelfSelection = (e) => {
    const shelf = e.target.value;
    // console.log("this is the shelf", shelf);
    // console.log("this is the userID", userId);
    // console.log("UserId from store:", userId);

    dispatch(addBookToUserShelf({ userId, book, shelf }));
    //console.log("this is the book : ", book);
    // console.log("this is id: ", userId);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="bg-gray-300 p-10 rounded-lg shadow-lg text-center">
          <div
            className=" book-details-container "
            style={{ textAlign: "center", marginTop: "20px" }}
          ></div>
          <img
            src={book.volumeInfo.imageLinks.thumbnail}
            alt={`Cover of ${book.volumeInfo.title}`}
            className="mx-auto w-38 h-auto"
          />
          <h2 className="text-xl font-bold mt-4">{book.volumeInfo.title}</h2>
          <p className="text-gray-600 mt-2">
            {book.volumeInfo.authors.join(", ")}
          </p>

          {/* Dropdown and add to shelf functionality */}
          <div className="mt-4">
            <select
              onChange={handleShelfSelection}
              className="p-2 rounded border"
            >
              <option value="">Select shelf</option>
              <option value="Want to Read">Want to Read</option>
              <option value="Currently Reading">Currently Reading</option>
              <option value="Read">Read</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
