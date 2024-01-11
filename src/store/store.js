import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import bookshelfReducer from './bookshelfSlice';
import { searchReducer } from "./searchReducer";

export const store = configureStore({
  reducer: {
    user: userReducer,
    bookshelf: bookshelfReducer,
    search: searchReducer,
    
  },
 
});
