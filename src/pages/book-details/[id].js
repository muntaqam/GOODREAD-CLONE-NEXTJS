import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import fetchBookDetails from "../../utils/fetchBookDetails";
import Navbar from "../../components/Navbar";
import { setUser } from "../../store/userSlice";
import ReactStars from "react-rating-stars-component";
import supabase from "../../lib/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { addBookToUserShelf } from "../../store/bookshelfSlice";

function BookDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.id);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchBookDetails(id)
        .then((data) => setBook(data))
        .catch((error) => setError(error.message));
    }
  }, [id]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      dispatch(setUser({ id: storedUserId }));
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!userId || !id) return;

      console.log("Fetching rating for user:", userId, "and book:", id);

      try {
        const { data, error } = await supabase
          .from("ratings")
          .select("rating")
          .eq("userid", userId)
          .eq("bookid", id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user rating:", error);
          return;
        }

        console.log("Fetched user rating:", data);
        if (data) {
          setUserRating(data.rating);
        } else {
          setUserRating(0);
        }
      } catch (error) {
        console.error("Error fetching user rating:", error);
      }
    };

    fetchUserRating();
  }, [id, userId]);

  // ... rest of the component ...

  const handleRating = async (newRating) => {
    try {
      // Check if the user already rated the book
      const { data: existingRating, error: fetchError } = await supabase
        .from("ratings")
        .select("*")
        .eq("userid", userId)
        .eq("bookid", id)
        .maybeSingle();

      if (fetchError && !fetchError.message.includes("No rows found"))
        throw fetchError;

      if (existingRating) {
        if (
          !window.confirm(
            "You have already rated this book. Do you want to change your rating?"
          )
        ) {
          return; // User chose not to change the rating
        }

        // Delete the existing rating
        const { error: deleteError } = await supabase
          .from("ratings")
          .delete()
          .match({ id: existingRating.id });

        if (deleteError) throw deleteError;
      }

      // Insert the new rating
      const { data, error: insertError } = await supabase
        .from("ratings")
        .insert([{ userid: userId, bookid: id, rating: newRating }])
        .select();

      if (insertError) throw insertError;

      console.log("Rating added:", data);
    } catch (error) {
      console.error("Error in rating process:", error);
    }
  };

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
          <div className="flex justify-center mt-4">
            <ReactStars
              key={userRating} // Use userRating as a key to force update
              count={5}
              onChange={handleRating}
              size={24}
              activeColor="#ffd700"
              value={userRating}
              isHalf={true}
            />
          </div>

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
