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
  const [isLoading, setIsLoading] = useState(true); // New state for loading status
  const [openDropdown, setOpenDropdown] = useState(null);
  const [shelfAdded, setShelfAdded] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState("");

  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      console.log("this is book", book);
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
        setAvgRating(averageRating.toFixed(1)); // Round to one decimal place
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
        setIsLoading(true); // Start loading
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
          user:profiles!inner(username, profile_pic_url)  // Ensure this join is correctly specified
        `
          )
          .eq("bookid", id)
          .order("timestamp", { ascending: false });

        if (error) {
          console.error("Error fetching reviews:", error);
          throw error;
        }

        setReviews(data);
        console.log("this is the current userid", userId);
        console.log("these are the reviews", data);
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
          // Add other necessary fields
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
        user:profiles!inner(username)  // Joining with profiles table
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
        if (
          !window.confirm(
            "You have already rated this book. Do you want to change your rating?"
          )
        ) {
          return;
        }

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

    dispatch(addBookToUserShelf({ userId, book, shelf }));
    console.log("this is the book : ", book);
    setShelfAdded(true);
    setTimeout(() => {
      setShelfAdded(false);
      setSelectedShelf("");
    }, 4000);
    // console.log("this is id: ", userId);
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
    event.preventDefault(); // Prevent default anchor behavior
    console.log("Editing review: ", review); // Debugging log
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
        .update({ review_text: reviewText })
        .eq("id", editingReview.id);

      if (error) throw error;

      // Update local state
      setReviews(
        reviews.map((r) =>
          r.id === editingReview.id ? { ...r, review_text: reviewText } : r
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

        // Update local reviews state to remove the deleted review
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
    return <div>Loading...</div>;
  }
  // console.log("this is the end : ", yes);

  ///description loading
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const renderDescription = () => {
    if (!book?.volumeInfo?.description) return null;

    const maxLength = 900; // Max length of truncated text
    const description = book.volumeInfo.description;

    if (showFullDescription || description.length <= maxLength) {
      return description;
    }

    return `${description.substring(0, maxLength)}...`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex justify-center py-12">
        <div className="bg-white p-6 rounded-lg shadow-lg w-4/5  mx-auto ">
          <div className="flex flex-row gap04 md:gap-8 ">
            <div className="column1-basic-info flex-1 p-4 flex flex-col items-center ">
              {/* Book Details */}
              <img
                src={
                  book.volumeInfo.imageLinks?.thumbnail ||
                  "src/images/bookCoverNA.png"
                }
                alt={`Cover of ${book.volumeInfo.title}`}
                className="mx-auto w-56 h-auto rounded-sm"
              />
              <h2 className="text-2xl font-bold mt-4 flex justify-center items-center text-center">
                {book.volumeInfo.title}
              </h2>

              <div className="flex flex-col items-center justify-center mt-2">
                <p className="text-gray-600 text-lg">
                  {book.volumeInfo.authors
                    ? book.volumeInfo.authors.join(", ")
                    : "Unknown Author"}
                </p>
                <p className="text-sky-900 text-md">Avg Rating: {avgRating}</p>
              </div>

              {/* Rating and Review Section */}
              <div className="flex justify-center mt-2">
                <ReactStars
                  key={userRating}
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
                    className="ml-4 text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                )}
              </div>

              {/* Shelf Selection Dropdown */}
              <div className="flex flex-col justify-center items-center mt-4">
                <select
                  onChange={handleShelfSelection}
                  className="p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:shadow-md transition duration-300 ease-in-out focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={selectedShelf}
                >
                  <option value="">Add to shelf</option>
                  <option value="Want to Read">Want to Read</option>
                  <option value="Currently Reading">Currently Reading</option>
                  <option value="Read">Read</option>
                </select>
                {shelfAdded && (
                  <span className="mt-2 text-sm text-green-600">
                    Added to {selectedShelf}!
                  </span>
                )}
              </div>
            </div>
            {/* column2 */}
            <div className="description flex-1 p-4 scrollable-div mb-8">
              {/* Description with See More/Less */}
              <div className="mt-8 mb-4">
                <h2 className="text-2xl font-bold text-black">
                  About this book
                </h2>
              </div>
              <hr className="my-4 border-t border-gray-300" />

              <div
                className="text-gray-700 descriptionText"
                dangerouslySetInnerHTML={{ __html: renderDescription() }}
              />
              {book?.volumeInfo?.description?.length > 900 && (
                <button
                  onClick={toggleDescription}
                  className="text-blue-500 hover:text-blue-700 mt-2 flex flex-1 p-4"
                >
                  {showFullDescription ? "See Less" : "See More"}
                </button>
              )}

              {/* ------------- COMMUNITY REVIEWS  -------------*/}

              <div className="container mx-auto p-4 mt-16 ">
                <h1 className="text-2xl font-bold mb-4 text-gray-800 ">
                  Community Reviews
                </h1>
                <hr className="my-4 border-t border-gray-300" />
                {/* Add/Edit Review Section */}
                {(!hasUserReviewed || editingReview) && !isLoading && (
                  <div className="review-section mt-4 p-10  mx-auto card-container mb-8 ">
                    <TextareaAutosize
                      placeholder="Write a review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      maxRows={5}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={
                        editingReview ? handleUpdateReview : handlePostReview
                      }
                      className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                    >
                      {editingReview ? "Update Review" : "Post Review"}
                    </button>
                  </div>
                )}

                {/* Display Reviews */}
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-4 rounded-lg shadow mb-4  mx-auto"
                  >
                    <div className="flex justify-between items-start">
                      {/* Left Section: Profile Pic, Username, and Review */}
                      <div className="flex items-start ">
                        <img
                          src="/profpic.png"
                          alt="Profile"
                          className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <strong className="text-lg text-gray-800 mr-2">
                            {review.user.username}
                          </strong>
                          <span className="text-xs text-gray-500">
                            {
                              (" ",
                              formatDistanceToNow(new Date(review.timestamp), {
                                addSuffix: true,
                              }))
                            }
                          </span>
                          <p className="text-gray-600">{review.review_text}</p>
                        </div>
                      </div>

                      {/* Right Section: Hamburger Icon */}
                      {currentUsername === review.user.username && (
                        <div className="relative inline-block text-right">
                          <button
                            onClick={() => toggleDropdown(review.id)}
                            className=" text-white font-bold py-2 px-4 rounded"
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              style={{ color: "gray" }}
                            />
                          </button>
                          {/* Dropdown Menu */}
                          {openDropdown === review.id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                              <div className="py-1" role="none">
                                {/* Edit option */}
                                <a
                                  href="#"
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  role="menuitem"
                                  onClick={(e) => handleEditClick(review, e)}
                                >
                                  Edit
                                </a>
                                {/* Delete option */}
                                <a
                                  href="#"
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  role="menuitem"
                                  onClick={() => {
                                    handleDeleteReview(review.id);
                                    toggleDropdown(null);
                                  }}
                                >
                                  Delete
                                </a>
                              </div>
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
    </div>
  );
}

export default BookDetail;
