import { useState } from "react";
import supabase from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";

function Login({ switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null); // New state for error message
  const router = useRouter();
  const dispatch = useDispatch();

  async function handleLogin() {
    setErrorMessage(null); // Clear any previous error messages

    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Error logging in:", error.message);

        if (error.message.includes("No user found with this email")) {
          // Adjust the string if Supabase uses a different message
          setErrorMessage("This email hasn't been registered.");
        } else if (
          error.message.includes("Invalid password or authentication code.")
        ) {
          // Adjust the string if Supabase uses a different message
          setErrorMessage("The password is incorrect.");
        } else {
          setErrorMessage(error.message); // Display the default error message
        }
      } else {
        const userResponse = await supabase.auth.getUser();
        if (userResponse.data.user) {
          const user = userResponse.data.user;
          console.log("User logged in successfully:", user.id);
          console.log("User email:", user.email);
          // Setting userId in storage upon login
          localStorage.setItem("userId", user.id);
          dispatch(setUser({ id: user.id, email: user.email }));

          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setErrorMessage("An unexpected error occurred."); // Set a generic error message
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

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Log in to your account
        </h2>

        <div className="rounded-md shadow-sm space-y-4">
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
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </div>

        <div className="mt-4 text-center">
          Don't have an account?{" "}
          <button
            className="text-indigo-600 hover:text-indigo-800"
            onClick={switchToRegister}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
