import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactStars from "react-rating-stars-component";
import Loading from "../components/Loading";

import {
  faBookOpenReader,
  faClipboardList,
  faBook,
  faLayerGroup,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import {
  fetchBooksForShelf,
  removeBookFromUserShelf,
  fetchAllUserBooks,
} from "../store/bookshelfSlice";

function Dashboard() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState("All");
  const [profile, setProfile] = useState({ username: "", profilePicUrl: "" });
  const shelfBooks = useSelector((state) => state.bookshelf.books);
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const [bookCount, setBookCount] = useState(0);
  const router = useRouter();
  const modalRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isShelfDropdownVisible, setIsShelfDropdownVisible] = useState(false);

  const toggleShelfDropdown = () => {
    setIsShelfDropdownVisible(!isShelfDropdownVisible);
  };

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  const handleNavigateToBookDetail = (bookId) => {
    router.push(`/book-details/${bookId}`);
  };
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const session = supabase.auth.getSession();

    if (!session) {
      router.push("/auth");
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllUserBooks(userId));
    }
  }, [userId, dispatch]);

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

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile", error);
      }
      if (data) {
        setProfile({
          username: data.username,
          profilePicUrl: data.profile_pic_url,
        });
        console.log("this is the profile !!!!", profile.profilePicUrl);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  // --count books---
  useEffect(() => {
    const fetchBookCount = async () => {
      if (userId) {
        const response = await supabase
          .from("userbookshelf")
          .select("id", { count: "exact" })
          .eq("userid", userId);

        const error = response.error;
        const count = response.count;

        if (error) {
          console.error("Error fetching book count", error);
        } else {
          setBookCount(count);
          console.log("this is the count", count);
        }
      }
    };

    if (userId) {
      fetchBookCount();
    }
  }, [userId]);

  const handleShelfClick = (shelfName) => {
    setSelectedShelf(shelfName);
    if (userId) {
      if (shelfName === "All") {
        console.log("all books clicked ");
        dispatch(fetchAllUserBooks(userId));
      } else {
        dispatch(fetchBooksForShelf({ shelfName, userId }));
      }
    }
  };

  const handleShelfChange = (event) => {
    setSelectedShelf(event.target.value);
    if (userId) {
      if (event.target.value === "All") {
        dispatch(fetchAllUserBooks(userId));
      } else {
        dispatch(fetchBooksForShelf({ shelfName: event.target.value, userId }));
      }
    }
  };

  const handleRemoveBook = async (userBookshelfId) => {
    const { error } = await supabase
      .from("userbookshelf")
      .delete()
      .eq("id", userBookshelfId);

    if (!error) {
      setBookCount((prevCount) => prevCount - 1);
      setAlertMessage("Book removed successfully");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } else {
      console.error("Error removing book:", error);
    }
    dispatch(removeBookFromUserShelf(userBookshelfId));
  };

  //-----profile pic-------

  const uploadImage = async (file, filePath) => {
    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file);
    console.log("Fetched profile data:", data);
    return { data, error };
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePicUrl: reader.result });
      };
      reader.readAsDataURL(file);

      const filePath = `${userId}/${file.name}`;
      const uploadResponse = await uploadImage(file, filePath);

      if (uploadResponse.error) {
        console.error("Error uploading file:", uploadResponse.error);
        return;
      }

      const imageUrl = `https://hnxthzkrnsvdfewvhqjx.supabase.co/storage/v1/object/public/profile-pictures/${filePath}`;
      const updateResponse = await updateProfilePicture(imageUrl);

      if (updateResponse.error) {
        console.error("Error updating profile:", updateResponse.error);
      } else {
        setProfile({ ...profile, profilePicUrl: imageUrl });
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showModal]);

  //update
  const updateProfilePicture = async (imageUrl) => {
    let result = {};

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ profile_pic_url: imageUrl })
        .eq("id", userId);

      result = { data, error };
    } catch (error) {
      result = { error };
    }

    return result;
  };

  //delete

  const handleImageClick = () => {
    setShowModal(true);
    //fileInputRef.current.click();
  };
  const handleCloseModal = (e) => {
    e.stopPropagation();
    setShowModal(false);
  };
  const handleUpdatePicture = () => {
    fileInputRef.current.click();
    setShowModal(false);
  };
  const handleDeletePicture = async () => {
    try {
      const filePath = profile.profilePicUrl.split("profile-pictures/")[1];

      // Delete the image from storage
      const { error: deleteError } = await supabase.storage
        .from("profile-pictures")
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Update the profile record in the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_pic_url: null })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile({ ...profile, profilePicUrl: null }); //  set  default image URL
    } catch (error) {
      console.error("Error deleting profile picture:", error);
    } finally {
      // Close the modal
      setShowModal(false);
    }
  };
  //console.log(profile);
  if (isLoading) {
    <Loading />;
  }

  return (
    <div>
      <Navbar />
      {showAlert && <div className="alert-banner">{alertMessage}</div>}

      {/* <button onClick={() => setIsDarkMode((prevMode) => !prevMode)}>
        Toggle Dark Mode
      </button> */}

      {/* Header with Profile Section */}
      <div className="header bg-slate-200 p-4 relative">
        <div className="flex justify-center">
          <div
            className="profile-card bg-white shadow-lg p-4 rounded-lg text-center w-64"
            style={{ position: "relative" }}
          >
            <div
              className="profile-section"
              style={{ cursor: "pointer" }}
              onClick={handleImageClick}
            >
              {/* Flex container to center the image */}
              <div className="flex justify-center">
                <img
                  src={profile.profilePicUrl || "/profpic.png"}
                  alt="Profile"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #ddd",
                    marginBottom: "15px",
                    cursor: "pointer",
                  }}
                />
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                ref={fileInputRef}
              />

              {/* Modal for update/delete options */}
              {showModal && (
                <div className="modal bg-gray-100 shadow-xl rounded ">
                  <div className="modal-content" ref={modalRef}>
                    <span
                      className="close-button text-gray-600 hover:text-black cursor-pointer"
                      onClick={handleCloseModal}
                    >
                      &times;
                    </span>
                    <p className="text-gray-500">Edit Profile</p>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded m-2"
                      onClick={handleUpdatePicture}
                    >
                      Update
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded m-2"
                      onClick={handleDeletePicture}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              <h3 className="font-semibold text-lg">{`@${profile.username}`}</h3>

              <p className="text-gray-500">{bookCount} books</p>
            </div>
            <div className="edit-icon" onClick={() => setShowModal(true)}>
              <FontAwesomeIcon icon={faEdit} />
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown for small screens */}
      <div className="sm:hidden p-4">
        <label htmlFor="shelf-select" className="text-xl font-semibold">
          Select Shelf:
        </label>
        <select
          id="shelf-select"
          className="block w-full p-2 border border-gray-300 rounded mt-1"
          value={selectedShelf}
          onChange={handleShelfChange}
        >
          {["All", "Read", "Want to Read", "Currently Reading"].map(
            (shelfName) => (
              <option key={shelfName} value={shelfName}>
                {shelfName}
              </option>
            )
          )}
        </select>
      </div>

      <div className="flex ">
        {/* Sidebar with Shelves */}
        <div className="hidden sm:block w-1/4 min-h-screen bg-gray-800 p-4 shadow-xl shadow-blue-gray-900/5">
          <ul className="space-y-3 font-medium">
            {["All", "Read", "Want to Read", "Currently Reading"].map(
              (shelfName) => (
                <li
                  key={shelfName}
                  className={`my-2 py-3 px-4 text-left flex items-center ${selectedShelf === shelfName
                      ? "bg-gray-600 text-white" // Darker text for selected shelf
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-100" // Darker text on hover
                    } rounded transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer`}
                  onClick={() => handleShelfClick(shelfName)}
                  aria-label={shelfName}
                >
                  {shelfName === "All" && (
                    <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />
                  )}
                  {shelfName === "Currently Reading" && (
                    <FontAwesomeIcon icon={faBookOpenReader} className="mr-2" />
                  )}
                  {shelfName === "Want to Read" && (
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                  )}
                  {shelfName === "Read" && (
                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                  )}
                  {shelfName}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Main Content */}
        <div className=" flex flex-grow p-5 justify-center">
          <div>
            <h3 className="text-xl font-semibold mb-4">
              {selectedShelf} Books
            </h3>

            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <div className="flex flex-wrap justify-center">
                  {shelfBooks.map((bookshelfEntry) => (
                    <div
                      key={bookshelfEntry.books?.id}
                      className="book-container flex items-center bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg mb-22 mx-2"
                      onClick={() =>
                        handleNavigateToBookDetail(bookshelfEntry.books.id)
                      }
                    >
                      <img
                        src={
                          bookshelfEntry.books?.cover_image_url ||
                          "/bookCoverNA.png"
                        }
                        alt={bookshelfEntry.books?.title}
                        className="book-cover w-20 h-32 mr-4 rounded object-cover"
                      />
                      <div className="flex-grow">
                        <h4 className="book-title text-lg font-medium">
                          {bookshelfEntry.books?.title}
                        </h4>
                        <p className="book-author text-gray-600">
                          {bookshelfEntry.books?.author}
                        </p>

                        <div className="flex items-center">
                          <ReactStars
                            value={
                              parseFloat(bookshelfEntry.books?.averageRating) ||
                              0
                            }
                            count={5}
                            size={24}
                            isHalf={true}
                            edit={false}
                            activeColor="#ffd700"
                          />
                          <span className="ml-2 text-sm text-gray-500">
                            {"("}
                            {bookshelfEntry.books?.averageRating || "N/A"} avg)
                          </span>
                        </div>
                      </div>
                      {selectedShelf !== "All" && (
                        <div className="tooltip-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBook(bookshelfEntry.id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                          <span className="tooltip-text">
                            Remove from shelf?
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
