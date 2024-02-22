import { useState } from "react";
import supabase from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";

function Register({ switchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();

  async function handleRegister() {
    setErrorMessage(null);
    if (!username.trim()) {
      setErrorMessage("Username is required");
      return;
    }

    try {
      const { user, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        throw signUpError;
      }

      const fetchUser = async () => {
        const userResponse = await supabase.auth.getUser();
        return userResponse.data.user;
      };

      const currentUser = user || (await fetchUser());
      if (!currentUser) {
        throw new Error("User registration failed.");
      }

      // Insert the username into the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: currentUser.id, username: username.trim() }]);

      if (profileError) {
        throw profileError;
      }

      // console.log("User registered successfully, profile added:", username);
      dispatch(setUser({ id: currentUser.id, email: currentUser.email }));
      await supabase.auth.signOut();
      switchToLogin();
    } catch (error) {
      // console.error("Error registering user:", error.message);
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Error message */}
        {errorMessage && (
          <div className="text-red-500 border border-red-600 bg-red-100 rounded px-4 py-2 mb-4">
            {errorMessage}
          </div>
        )}

         <img src="/Gr8reads.png" alt="Greatreads Logo" />

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register an account
        </h2>

        <div className="rounded-md shadow-sm space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          />

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          />
        </div>

        <div>
          <button
            onClick={handleRegister}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
          </button>
        </div>

        {/*"Already have an account? */}
        <div className="mt-4 text-center">
          Already have an account?{" "}
          <button
            className="text-indigo-600 hover:text-indigo-800"
            onClick={switchToLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
