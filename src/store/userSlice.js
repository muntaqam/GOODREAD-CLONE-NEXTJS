// store/userSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  email: "",
  username: "",
  // other user details
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.username = action.payload.username;
      console.log("this is userslice id", state.id);
      console.log("this is userslice email", state.email);
      console.log("this is userslice username", state.username);
      // set other user details
    },
    clearUser: (state) => {
      state.id = null;
      state.email = "";
      state.username = "";
      // clear other user details
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
