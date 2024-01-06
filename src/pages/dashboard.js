import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import BookList from "../components/BookCard/BookList"; // Import BookList component
import bookshelf from "../utils/bookshelf";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpenReader,
  faClipboardList,
  faBook,
} from "@fortawesome/free-solid-svg-icons";

import {
  fetchBooksForShelf,
  removeBookFromUserShelf,
} from "../store/bookshelfSlice";

function Dashboard() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [profile, setProfile] = useState({ username: "", profilePicUrl: "" });
  const shelfBooks = useSelector((state) => state.bookshelf.books);
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
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
        setUserId(response.data.user.id); // Set userId state
        setIsLoading(false);
      }
    };

    getUserData();
  }, [router]);

  useEffect(() => {
    // Fetch profile data
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

  const handleShelfClick = (shelfName) => {
    setSelectedShelf(shelfName);
    if (userId) {
      dispatch(fetchBooksForShelf({ shelfName, userId }));
    }
  };

  const handleRemoveBook = (userBookshelfId) => {
    dispatch(removeBookFromUserShelf(userBookshelfId));
  };

  //-----profile pic-------

  //bucket upload
  const uploadImage = async (file, filePath) => {
    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file);
    console.log("Fetched profile data:", data);

    // Return an object with both data and error
    return { data, error };
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Display preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePicUrl: reader.result });
      };
      reader.readAsDataURL(file);

      // Upload image to storage
      const filePath = `${userId}/${file.name}`;
      const uploadResponse = await uploadImage(file, filePath);

      if (uploadResponse.error) {
        console.error("Error uploading file:", uploadResponse.error);
        return;
      }

      // Construct URL of the uploaded image
      const imageUrl = `https://hnxthzkrnsvdfewvhqjx.supabase.co/storage/v1/object/public/profile-pictures/${filePath}`;

      // Update profile_pic_url in the database
      const updateResponse = await updateProfilePicture(imageUrl);

      if (updateResponse.error) {
        console.error("Error updating profile:", updateResponse.error);
      } else {
        // Update local profile state to reflect new image URL
        setProfile({ ...profile, profilePicUrl: imageUrl });
      }
    }
  };

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
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleUpdatePicture = () => {
    fileInputRef.current.click();
    setShowModal(false);
  };
  const handleDeletePicture = async () => {
    try {
      // Extract the file path from the profile picture URL
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
        .update({ profile_pic_url: null }) // or set to a default image URL
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile({ ...profile, profilePicUrl: null }); // or set to a default image URL
    } catch (error) {
      console.error("Error deleting profile picture:", error);
    } finally {
      // Close the modal
      setShowModal(false);
    }
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      {/* Header with Profile Section */}
      <div className="header bg-gray-200 p-4">
        <div className="flex justify-center">
          <div
            className="profile-card bg-white shadow-lg p-4 rounded-lg text-center"
            style={{ maxWidth: "300px" }}
          >
            <div className="profile-section onClick={openModal}">
              <img
                src={profile.profilePicUrl || "/profpic.png"}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={handleImageClick}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                ref={fileInputRef}
              />

              {/* Modal for update/delete options */}
              {showModal && (
                <div className="modal">
                  <div className="modal-content">
                    <span className="close-button" onClick={handleCloseModal}>
                      &times;
                    </span>
                    <button onClick={handleUpdatePicture}>Update </button>
                    <button onClick={handleDeletePicture}>Delete </button>
                    <button onClick={handleCloseModal}>Close</button>
                  </div>
                </div>
              )}
              <h3>{"@" + profile.username}</h3>
              <div>
                <p> 23 books</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex ">
        {/* Sidebar with Shelves */}
        <div className="w-1/4 min-h-screen bg-gray-800 p-4 shadow-xl shadow-blue-gray-900/5">
          <ul className="space-y-3 font-medium">
            {["Read", "Want to Read", "Currently Reading"].map((shelfName) => (
              <li
                key={shelfName}
                className={`my-2 py-3 px-4 text-left flex items-center ${
                  selectedShelf === shelfName
                    ? "bg-gray-400 text-slate-900" // Darker text for selected shelf
                    : "text-gray-100 hover:text-gray-900 hover:bg-gray-100" // Darker text on hover
                } rounded transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer`}
                onClick={() => handleShelfClick(shelfName)}
                aria-label={shelfName}
              >
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
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="w-3/4 p-4">
          <div>
            <h3>{selectedShelf} Books</h3>
            <div>
              {shelfBooks.map((bookshelfEntry) => (
                <div
                  key={bookshelfEntry.books?.id}
                  className="book-container flex cursor-pointer"
                  onClick={() =>
                    handleNavigateToBookDetail(bookshelfEntry.books.id)
                  }
                >
                  <img
                    src={
                      bookshelfEntry.books?.cover_image_url ||
                      "src/images/bookCoverNA.png"
                    }
                    alt={bookshelfEntry.books?.title}
                    className="book-cover w-32 h-48 mr-4 rounded object-cover"
                  />
                  <div className="book-info">
                    <h4 className="book-title">
                      {bookshelfEntry.books?.title}
                    </h4>
                    <p className="book-author">
                      {bookshelfEntry.books?.author}
                    </p>
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
