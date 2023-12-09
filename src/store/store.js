// src/store/store.js

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import bookshelfReducer from './bookshelfSlice';

export const store = configureStore({
  reducer: {
        user: userReducer,
        bookshelf: bookshelfReducer,
     
    // Add your reducers here
  },
});
