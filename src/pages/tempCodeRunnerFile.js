import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import BookList from "../components/BookCard/BookList";
import bookshelf from "../utils/bookshelf";
import { useSelector, useDispatch } from "react-redux";
import Loading from "src/components/Loading";
import {
  fetchBooksForShelf,
  removeBookFromUserShelf,
} from "../store/bookshelfSlice";

function Dashboard() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState("");
  const shelfBooks = useSelector((state) => state.bookshelf.books);
  const dispatch = useDispatch();

  const router = useRouter();
  const handleNavigateToBookDetail = (bookId) => {
    router.push(`/book-details/${bookId}`);
  };

  useEffect(() => {
    const session = supabase.auth.getSession();

    if (!session) {
      router.push("/auth");
    }
  }, [router]);


  useEffect(() => {
    const getUserData = async () => {
      const session = supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      } else {
        const response = await supabase.auth.getUser();
        if (!response || !response.data || !response.data.user) {
          console.log("No session found. Redirecting to login.");
          router.push("/auth");
          return;
        }
        setEmail(response.data.user.email);
        setUserId(response.data.user.id); 
        setIsLoading(false);
      }
    };

    getUserData();
  }, [router]);

  const handleShelfClick = (shelfName) => {
    setSelectedShelf(shelfName);
    if (userId) {
      dispatch(fetchBooksForShelf({ shelfName, userId }));
    }
  };

  const handleRemoveBook = (userBookshelfId) => {
    dispatch(removeBookFromUserShelf(userBookshelfId));
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Navbar />
      <div className="flex">
        <div className="w-1/4 min-h-screen bg-gray-100 p-4">
          <ul>
            <li
              className="my-2 p-2 hover:bg-gray-200"
              onClick={() => handleShelfClick("Read")}
            >
              Read
            </li>
            <li
              className="my-2 p-2 hover:bg-gray-200"
              onClick={() => handleShelfClick("Want to Read")}
            >
              Want to Read
            </li>
            <li
              className="my-2 p-2 hover:bg-gray-200"
              onClick={() => handleShelfClick("Currently Reading")}
            >
              Currently Reading
            </li>
          </ul>
        </div>
        <div className="w-3/4 p-4">
          <h2>Welcome to your dashboard</h2>
          <div>
            <h3>User Information</h3>
            <p>Email: {email}</p>
          </div>
          <div>
            <h3>{selectedShelf} Books</h3>
            <div>
              {shelfBooks.map((bookshelfEntry) => (
                <div
                  key={bookshelfEntry.books.id}
                  className="book-container flex cursor-pointer"
                  onClick={() =>
                    handleNavigateToBookDetail(bookshelfEntry.books.id)
                  }
                >
                  <img
                    src={
                      bookshelfEntry.books.cover_image_url ||
                      "src/images/bookCoverNA.png"
                    }
                    alt={bookshelfEntry.books.title}
                    className="book-cover w-32 h-48 mr-4 rounded object-cover"
                  />
                  <div className="book-info">
                    <h4 className="book-title">{bookshelfEntry.books.title}</h4>
                    <p className="book-author">{bookshelfEntry.books.author}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation
                      handleRemoveBook(bookshelfEntry.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
