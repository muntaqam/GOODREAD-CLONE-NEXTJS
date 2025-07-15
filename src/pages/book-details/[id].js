import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import fetchBookDetails from "../../utils/fetchBookDetails";
import Navbar from "../../components/Navbar";
import { setUser } from "../../store/userSlice";
import ReactStars from "react-rating-stars-component";
import supabase from "../../lib/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { addBookToUserShelf } from "../../store/bookshelfSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import TextareaAutosize from "react-textarea-autosize";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Loading from "src/components/Loading";

function BookDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.id);
  const currentUsername = useSelector((state) => state.user.username);
  // console.log("current user: ", currentUsername);
  const [editingReview, setEditingReview] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [yes, setyes] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [shelfAdded, setShelfAdded] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [shelfMessage, setShelfMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [profPic, setProfPic] = useState("");

  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (book) {
      console.log("this is book", book);
    }
  }, [book]);

  useEffect(() => {
    if (id) {

      fetchBookDetails(id)
        .then((data) => setBook(data))
        .catch((error) => setError(error.message));
    }

  }, [id]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserEmail = localStorage.getItem("userEmail");
    const storedUserUsername = localStorage.getItem("userUsername");

    if (storedUserId) {
      dispatch(
        setUser({
          id: storedUserId,
          email: storedUserEmail,
          username: storedUserUsername,
        })
      );
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

  useEffect(() => {
    const fetchAvgRating = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("ratings")
          .select("rating")
          .eq("bookid", id);

        if (error) throw error;

        const totalRating = data.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = data.length > 0 ? totalRating / data.length : 0;
        setAvgRating(averageRating.toFixed(1));
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    };

    fetchAvgRating();
  }, [id]);

  useEffect(() => {
    const checkAndSetReviewStatus = async () => {
      if (!userId || !id) {
        setIsLoading(false);
        return;
      }
      console.log("checkign if reveiw exists");

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("userid", userId)
          .eq("bookid", id)
          .maybeSingle();

        //setHasUserReviewed(!!data);
        console.log(data);
        if (data !== null) {
          setHasUserReviewed(true);
          // console.log("something exists", hasUserReviewed);
        }
      } catch (error) {
        console.error("Error checking review status:", error);
      } finally {
        setIsLoading(false); // Stop loading regardless of result
      }
    };

    checkAndSetReviewStatus();
  }, [userId, id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("reviews")
          .select(
            `
          id,
          review_text,
          timestamp,
          user:profiles!inner(username, profile_pic_url)  
        `
          )
          .eq("bookid", id)
          .order("timestamp", { ascending: false });

        if (error) {
          console.error("Error fetching reviews:", error);
          throw error;
        }

        setReviews(data);
        // console.log("this is the current userid", userId);
        // console.log("these are the reviews", data);
        // setProfPic()
        const userReview = data.find((review) => review.userid === userId);
        //setHasUserReviewed(!!userReview); //true if review exists
      } catch (error) {
        // Log any errors that might occur
        console.error("An error occurred while fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [id]);

  const handlePostReview = async () => {
    console.log("Posting review...");
    if (reviewText.length > 800) {
      alert("Review must be less than 800 characters.");
      return;
    }

    try {
      // Ensure book is in 'books' table before posting review
      const { data: bookInDb, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (bookError || !bookInDb) {
        // Book not in 'books' table, add it
        const newBook = {
          id: id,
          title: book.volumeInfo.title,
          author: book.volumeInfo.authors?.join(", ") || "Unknown Author",
        };
        const { error: newBookError } = await supabase
          .from("books")
          .insert([newBook]);
        if (newBookError) {
          throw newBookError;
        }
      }

      // Post the review
      const { error: reviewError } = await supabase
        .from("reviews")
        .insert([{ userid: userId, bookid: id, review_text: reviewText }]);

      if (reviewError) {
        throw reviewError;
      }
      localStorage.setItem(`hasReviewed_${id}_${userId}`, "true");

      fetchReviews();
      setHasUserReviewed(true);
      setReviewText(""); // Reset review input
    } catch (error) {
      console.error("Error posting review:", error.message);
      alert("Failed to post review: " + error.message);
    }
  };

  // Fetch reviews function
  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id,
          review_text,
          timestamp,
          user:profiles!inner(username, profile_pic_url)  
        `
        )
        .eq("bookid", id)
        .order("timestamp", { ascending: false });

      if (error) throw error;

      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // const handleRemoveReview = async () => {

  //   try{
  //     const{data: existingReview} = await supabase
  //     .from("reviews")
  //     .select("*")
  //     .eq("userid", userId)
  //     .eq("bookid",id)
  //     .maybeSingle();

  //   }

  // }

  // ... rest of the component ...

  const handleRating = async (newRating) => {
    try {
      // Ensure the book exists in the 'books' table
      const { data: bookData } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!bookData) {
        await supabase.from("books").insert([
          {
            id: id,
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors.join(", "),
            cover_image_url:
              book.volumeInfo.imageLinks?.thumbnail ||
              "src/images/bookCoverNA.png",
          },
        ]);
      }

      // Check if the user already rated the book
      const { data: existingRating } = await supabase
        .from("ratings")
        .select("*")
        .eq("userid", userId)
        .eq("bookid", id)
        .maybeSingle();

      if (existingRating) {
        // if (
        //   !window.confirm(
        //     "You have already rated this book. Do you want to change your rating?"
        //   )
        // ) {
        //   return;
        // }

        await supabase
          .from("ratings")
          .delete()
          .match({ id: existingRating.id });
      }

      await supabase
        .from("ratings")
        .insert([{ userid: userId, bookid: id, rating: newRating }]);

      // Update userRating and avgRating state
      setUserRating(newRating);
      // Refetch average rating
      const { data: avgData } = await supabase
        .from("ratings")
        .select("rating")
        .eq("bookid", id);

      const totalRating = avgData.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating =
        avgData.length > 0 ? totalRating / avgData.length : 0;
      setAvgRating(averageRating.toFixed(1));
    } catch (error) {
      console.error("Error in rating process:", error);
    }
  };
  const handleRemoveRating = async () => {
    try {
      const { data: existingRating } = await supabase
        .from("ratings")
        .select("*")
        .eq("userid", userId)
        .eq("bookid", id)
        .maybeSingle();

      if (!existingRating) {
        console.log("No rating to remove");
        return;
      }

      await supabase.from("ratings").delete().match({ id: existingRating.id });

      // Reset userRating
      setUserRating(0);

      // Refetch average rating
      const { data: avgData } = await supabase
        .from("ratings")
        .select("rating")
        .eq("bookid", id);

      const totalRating = avgData.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating =
        avgData.length > 0 ? totalRating / avgData.length : 0;
      setAvgRating(averageRating.toFixed(1));
    } catch (error) {
      console.error("Error removing rating:", error);
    }
  };

  const handleShelfSelection = (e) => {
    const shelf = e.target.value;
    setSelectedShelf(shelf);
    // console.log("this is the shelf", shelf);
    // console.log("this is the userID", userId);
    // console.log("UserId from store:", userId);
    console.log("this is book", book);

    dispatch(addBookToUserShelf({ userId, book, shelf })).then((action) => {
      if (addBookToUserShelf.fulfilled.match(action)) {
        setShelfMessage(`Added to ${shelf} shelf!`);
        setMessageType("success");
        setTimeout(() => {
          setShelfMessage("");
          setMessageType("");
        }, 4000);
      } else if (addBookToUserShelf.rejected.match(action)) {
        setShelfMessage(action.payload || `Already on the ${shelf} shelf`);
        setMessageType("error");
        setTimeout(() => {
          setShelfMessage("");
          setMessageType("");
        }, 4000);
      }
    });
  };
  //--------REVIEW-----
  const checkUserReviewStatus = async (userId, bookId) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("userid", userId)
      .eq("bookid", bookId)
      .maybeSingle();

    return { hasReviewed: !!data, error };
  };

  //EDIT REVIEW
  const handleEditClick = (review, event) => {
    event.preventDefault();
    // console.log("Editing review: ", review);
    setEditingReview(review);
    setReviewText(review.review_text);
    toggleDropdown(null);
  };
  //editing review dropdown
  const toggleDropdown = (reviewId) => {
    setOpenDropdown(openDropdown === reviewId ? null : reviewId);
  };

  //update review
  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      const { error } = await supabase
        .from("reviews")
        .update({
          review_text: reviewText,
          last_updated: new Date().toISOString(),
        })
        .eq("id", editingReview.id);

      if (error) throw error;

      // Update local state
      setReviews(
        reviews.map((r) =>
          r.id === editingReview.id
            ? {
              ...r,
              review_text: reviewText,
              last_updated: new Date().toISOString(),
            }
            : r
        )
      );
      setEditingReview(null);
      setReviewText("");
    } catch (error) {
      console.error("Error updating review:", error.message);
      alert("Failed to update review: " + error.message);
    }
  };

  //delete review
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const { error } = await supabase
          .from("reviews")
          .delete()
          .eq("id", reviewId);

        if (error) throw error;
        setReviews(reviews.filter((review) => review.id !== reviewId));

        // Allow the user to add a new review
        setHasUserReviewed(false);
      } catch (error) {
        console.error("Error deleting review:", error.message);
        alert("Failed to delete review: " + error.message);
      }
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!book) {
    return <Loading />;
  }
  // console.log("this is the end : ", yes);

  ///description loading
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const renderDescription = () => {
    if (!book?.volumeInfo?.description) return null;

    const maxLength = 600; //text seemore limit
    const description = book.volumeInfo.description;

    if (showFullDescription || description.length <= maxLength) {
      return description;
    }

    return `${description.substring(0, maxLength)}...`;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-5xl w-full px-4 md:px-8 mx-auto py-8">


        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block text-sm">
          ← Back to Home
        </Link>


        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT: Book Info */}
          <div className="md:w-1/3 flex flex-col items-center text-center">
            <img
              src={book.volumeInfo.imageLinks?.thumbnail || "/images/bookCoverNA.png"}
              alt={`Cover of ${book.volumeInfo.title}`}
              className="w-48 h-auto rounded shadow-sm"
            />

            <h1 className="text-3xl font-bold text-gray-900 mt-4">
              {book.volumeInfo.title}
            </h1>

            <p className="text-lg text-gray-600 italic mt-1">
              {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
            </p>



            {/* Rating */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Rating</h2>
              <ReactStars
                count={5}
                onChange={handleRating}
                size={24}
                activeColor="#ffd700"
                value={userRating}
                isHalf={true}
              />
              {userRating > 0 && (
                <button
                  onClick={handleRemoveRating}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  Remove Rating
                </button>
              )}
              <p className="text-gray-600 mt-1">{avgRating} / 5</p>
            </div>

            {/* Shelf Dropdown */}
            <div className="mt-6">
              <select
                onChange={handleShelfSelection}
                value={selectedShelf}
                className="p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:shadow-md transition duration-300 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Add to shelf</option>
                <option value="Want to Read">Want to Read</option>
                <option value="Currently Reading">Currently Reading</option>
                <option value="Read">Read</option>
              </select>
              {shelfMessage && (
                <p className={`mt-2 text-sm ${messageType === "error" ? "text-red-600" : "text-green-600"}`}>
                  {shelfMessage}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Book Details & Reviews */}
          <div className="md:w-2/3">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-1">Description</h2>
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderDescription() }}
            />
            {book?.volumeInfo?.description?.length > 900 && (
              <button
                onClick={toggleDescription}
                className="text-blue-500 hover:text-blue-700 mt-2 block"
              >
                {showFullDescription ? "See Less" : "See More"}
              </button>
            )}

            {/* Meta Info */}
            <div className="flex gap-8 mt-6 text-gray-700">
              <p>
                <span className="font-semibold">Published:</span>{" "}
                {book.volumeInfo.publishedDate || "Unknown"}
              </p>
              <p>
                <span className="font-semibold">Genre:</span>{" "}
                {book.volumeInfo.categories?.[0] || "N/A"}
              </p>
            </div>

            {/* Community Reviews */}
            <h2 className="text-xl font-semibold text-gray-800 mt-12 mb-4 border-b pb-1">
              Community Reviews
              <p className="text-sm text-gray-500 mb-1">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </p>

            </h2>


            {(!hasUserReviewed || editingReview) && !isLoading && (
              <div className="bg-white p-4 rounded shadow-sm mb-6">
                <TextareaAutosize
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxRows={5}
                  className="w-full p-3 border border-gray-300 rounded text-gray-800"
                />
                <button
                  onClick={editingReview ? handleUpdateReview : handlePostReview}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  {editingReview ? "Update Review" : "Post Review"}
                </button>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded shadow-md p-4 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    {/* Left: Reviewer info */}
                    <div className="flex gap-4">
                      <img
                        src={review.user.profile_pic_url || "/profpic.png"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {review.user.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(review.last_updated || review.timestamp),
                            { addSuffix: true }
                          )}
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-1">
                          {review.review_text}
                        </p>
                      </div>
                    </div>

                    {/* Right: Dropdown */}
                    {currentUsername === review.user.username && (
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => toggleDropdown(review.id)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        {openDropdown === review.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-10">
                            <button
                              onClick={(e) => handleEditClick(review, e)}
                              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteReview(review.id);
                                toggleDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default BookDetail;
