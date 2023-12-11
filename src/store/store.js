import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import bookshelfReducer from './bookshelfSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    bookshelf: bookshelfReducer,
    // Add any additional reducers here
  },
  // Redux DevTools are automatically set up by configureStore
});
