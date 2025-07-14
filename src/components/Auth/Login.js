import { useState } from "react";
import supabase from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";

function Login({ switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();

  async function handleLogin() {
    setErrorMessage(null);

    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Error logging in:", error.message);

        if (error.message.includes("No user found with this email")) {
          setErrorMessage("This email hasn&apos;t been registered.");
        } else if (
          error.message.includes("Invalid password or authentication code.")
        ) {
          setErrorMessage("The password is incorrect.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        const userResponse = await supabase.auth.getUser();
        if (userResponse.data.user) {
          const user = userResponse.data.user;
          // console.log("User logged in successfully:", user.id);
          // console.log("User email:", user.email);
          localStorage.setItem("userId", user.id);

          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

          if (profileError) {
            throw profileError;
          }
          console.log("Dispatching user data:", {
            id: user.id,
            email: user.email,
            username: profileData.username,
          });
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userUsername", profileData.username);

          dispatch(
            setUser({
              id: user.id,
              email: user.email,
              username: profileData.username,
            })
          );

          router.push("/");
        }
      }
    } catch (error) {
      // console.error("Error logging in:", error.message);
      setErrorMessage("An unexpected error occurred.");
    }
  }

  async function handleGuestLogin() {
    setErrorMessage(null);

    try {
      const guestEmail = "guest@gmail.com";
      const guestPassword = "password123";
      const { user, error } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      });
      if (error) {
        console.error("Error logging in:", error.message);

        if (error.message.includes("No user found with this email")) {
          setErrorMessage("This email hasn&apos;t been registered.");
        } else if (
          error.message.includes("Invalid password or authentication code.")
        ) {
          setErrorMessage("The password is incorrect.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        const userResponse = await supabase.auth.getUser();
        if (userResponse.data.user) {
          const user = userResponse.data.user;
          // console.log("User logged in successfully:", user.id);
          // console.log("User email:", user.email);

          localStorage.setItem("userId", user.id);

          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

          if (profileError) {
            throw profileError;
          }
          console.log("Dispatching user data:", {
            id: user.id,
            email: user.email,
            username: profileData.username,
          });
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userUsername", profileData.username);

          dispatch(
            setUser({
              id: user.id,
              email: user.email,
              username: profileData.username,
            })
          );

          router.push("/");
        }
      }
    } catch (error) {
      // console.error("Error logging in:", error.message);
      setErrorMessage("An unexpected error occurred.");
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
          Log in to your account
        </h2>
        <button
          onClick={handleGuestLogin}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Login as Guest
        </button>

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
          {"Don't have an account?"}{" "}
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
