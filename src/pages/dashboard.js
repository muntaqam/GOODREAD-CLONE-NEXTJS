import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import BookList from "../components/BookCard/BookList"; // Import BookList component
import bookshelf from "../utils/bookshelf";
import { useSelector, useDispatch } from "react-redux";
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
      // Fetch profile data from your database
      // Assuming supabase is your client for fetching data
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId) // userId from your existing state
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile", error);
      } else {
        setProfile({
          username: data.username,
          profilePicUrl: data.profile_pic_url,
        });
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

    // Return an object with both data and error
    return { data, error };
  };

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
      const { error: uploadError } = await uploadImage(file, filePath);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return;
      }

      // Construct URL of the uploaded image
      const imageUrl = `https://[project-ref].supabase.co/storage/v1/object/public/profile-pictures/${filePath}`;

      // Update profile_pic_url in the database
      const { error: updateError } = await updateProfilePicture(imageUrl);
      if (updateError) {
        console.error("Error updating profile:", updateError);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="flex">
        <div className="w-1/4 min-h-screen bg-gray-100 p-4">
          {/* Profile section */}
          <div className="profile-section">
            <img
              src={profile.profilePicUrl || "/profpic.png"}
              //alt="Profile"
              style={{
                width: "100px", // Adjust size as needed
                height: "100px", // Adjust size as needed
                borderRadius: "50%", // Makes the image circular
                objectFit: "cover", // Ensures the image covers the area without distortion
              }}
            />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <h3>{profile.username}</h3>
          </div>
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
