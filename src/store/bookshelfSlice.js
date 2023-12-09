import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabase from '../lib/supabaseClient';
import bookshelf from '../utils/bookshelf';

export const fetchBooksForShelf = createAsyncThunk(
  'bookshelf/fetchBooksForShelf',
  async ({ shelfName, userId }) => {
    const { data, error } = await supabase
      .from('userbookshelf')
      .select('id, status, bookid, books(*)') 
      .eq('userid', userId)
      .eq('status', shelfName);

    if (error) {
      throw error;
    }

    return data; // This will include userBookshelfId for each entry
  }
);

// Async thunk for adding a book to the shelf
export const addBookToUserShelf = createAsyncThunk(
  'bookshelf/addBookToUserShelf',
  async ({ userId, book, shelf }, thunkAPI) => {
    try {
      // Call your utility function to add the book to the shelf
      console.log("adding book")
      const { data, error } = await bookshelf.addBookToShelf(
        userId, 
        book.id, 
        shelf, 
        book.thumbnailUrl
      );

      if (error) throw error;

      // You might want to return the book with shelf data or the response data
      return { ...book, shelf };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);




//remove book from userbookshelf

export const removeBookFromUserShelf = createAsyncThunk(
  'bookshelf/removeBookFromUserShelf',
  async (userBookshelfId, thunkAPI) => {
    try {
      const response = await bookshelf.removeBookFromShelf(userBookshelfId);
      if (response.error) throw response.error;
      return userBookshelfId; // Return the ID of the removed book
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  books: [], // This will hold the book data
};

const bookshelfSlice = createSlice({
  name: 'bookshelf',
  initialState,
  reducers: {
    addBookToShelf: (state, action) => {
      const { book, shelf } = action.payload;
      state.books.push({...book,shelf});
    },
    removeBookFromShelf: (state, action) => {
      state.books = state.books.filter(book => book.id !== action.payload.id);
    },
    // Other reducers...
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBooksForShelf.fulfilled, (state, action) => {
      // Update the state with the fetched books
      state.books = action.payload;
    })
    .addCase(addBookToUserShelf.rejected, (state, action) => {
        console.error('Failed to add book to shelf:', action.payload);
      });
      builder.addCase(removeBookFromUserShelf.fulfilled, (state, action) => {
      state.books = state.books.filter(book => book.id !== action.payload);
    });
    // You can also handle pending and rejected states if needed


  },
});

export const { addBookToShelf, removeBookFromShelf } = bookshelfSlice.actions;
export default bookshelfSlice.reducer;
