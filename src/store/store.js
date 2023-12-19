import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { persistReducer, persistStore } from "redux-persist";

import userReducer from "./userSlice";
import bookshelfReducer from "./bookshelfSlice";
import reviewReducer from "./reviewSlice"; // Assuming you have a reviewSlice
import { searchReducer } from "./searchReducer";

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  // Add any other configurations here
};

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  bookshelf: bookshelfReducer,
  review: reviewReducer, // Make sure to include your reviewReducer
  search: searchReducer,
  // other reducers...
});

// Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  // other configurations...
});

// Create a persistor based on the store
export const persistor = persistStore(store);
