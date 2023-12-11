// store/userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  email: '',
  // other user details
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id;
      console.log("this is userslice id",state.id)
      state.email = action.payload.email;
      // set other user details
    },
    clearUser: (state) => {
      state.id = null;
      state.email = '';
      // clear other user details
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
