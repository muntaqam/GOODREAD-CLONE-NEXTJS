import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../lib/supabaseClient";
import bookshelf from "../utils/bookshelf";

export const fetchBooksForShelf = createAsyncThunk(
  "bookshelf/fetchBooksForShelf",
  async ({ shelfName, userId }) => {
    try {
      // Fetch books along with their average ratings
      const { data: bookData, error: bookError } = await supabase
        .from("userbookshelf")
        .select(
          `
          id,
          status,
          bookid,
          books (
            *,
            ratings (rating)
          )
        `
        )
        .eq("userid", userId)
        .eq("status", shelfName);

      if (bookError) throw bookError;

      // Calculate average ratings for each book
      const booksWithRatings = bookData.map((bookEntry) => {
        const ratings = bookEntry.books.ratings.map((r) => r.rating);
        const averageRating =
          ratings.length > 0
            ? ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length
            : 0;

        return {
          ...bookEntry,
          books: {
            ...bookEntry.books,
            averageRating: averageRating.toFixed(1),
          },
        };
      });

      return booksWithRatings;
    } catch (error) {
      throw error;
    }
  }
);

export const addBookToUserShelf = createAsyncThunk(
  "bookshelf/addBookToUserShelf",
  async ({ userId, book, shelf }, thunkAPI) => {
    try {
      //check if the book is already on the [x] shelf
      const { data: existingBookOnShelf, error: existingBookError } =
        await supabase
          .from("userbookshelf")
          .select("*")
          .eq("userid", userId)
          .eq("bookid", book.id)
          .eq("status", shelf)
          .maybeSingle();

      if (existingBookError) {
        throw existingBookError;
      }

      if (existingBookOnShelf) {
        return thunkAPI.rejectWithValue(
          `Book is already in the '${shelf}' shelf.`
        );
      }

      // console.log("adding book");
      // console.log("BOOOOOOK: -------_> ", book.volumeInfo.imageLinks);
      // console.log("this is the id----- ", userId);
      //console.log("this is the book id----- ", book);
      // console.log("this is the shelf----- ", shelf);
      // console.log(
      //   "this is the thumbnail----- ",
      //   book.volumeInfo.imageLinks.thumbnail
      // );

      const bookExists = await bookshelf.checkBookExistsInDatabase(book.id);
      if (!bookExists) {
        console.log("this is the book object to insert", book);
        await bookshelf.insertBookIntoDatabase(book);
      }

      const { data, error } = await bookshelf.addBookToShelf(
        userId,
        book.id,
        shelf,
        book.volumeInfo.imageLinks?.thumbnail
      );

      if (error) throw error;

      return { ...book, shelf };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//retrieve all books for user
export const fetchAllUserBooks = createAsyncThunk(
  "bookshelf/fetchAllUserBooks",
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("userbookshelf")
        .select(
          `
          bookid,
          books (
            *,
            ratings (rating)
          )
        `
        )
        .eq("userid", userId);

      if (error) throw error;

      // Process to get unique books with average ratings
      const processedBooks = data.reduce((acc, item) => {
        if (!acc.some((book) => book.bookid === item.bookid)) {
          const ratings = item.books.ratings.map((r) => r.rating);
          const averageRating =
            ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) /
                ratings.length
              : 0;
          acc.push({
            ...item,
            books: {
              ...item.books,
              averageRating: averageRating.toFixed(1),
            },
          });
        }
        return acc;
      }, []);

      console.log("these are all the books with avg ratings", processedBooks);
      return processedBooks;
    } catch (error) {
      console.error("Error fetching all books:", error);
      return rejectWithValue(error.message);
    }
  }
);

//remove book from userbookshelf

export const removeBookFromUserShelf = createAsyncThunk(
  "bookshelf/removeBookFromUserShelf",
  async (userBookshelfId, thunkAPI) => {
    try {
      const response = await bookshelf.removeBookFromShelf(userBookshelfId);
      if (response.error) throw response.error;
      return userBookshelfId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  books: [],
};

const bookshelfSlice = createSlice({
  name: "bookshelf",
  initialState,
  reducers: {
    addBookToShelf: (state, action) => {
      const { book, shelf } = action.payload;
      state.books.push({ ...book, shelf });
    },
    removeBookFromShelf: (state, action) => {
      state.books = state.books.filter((book) => book.id !== action.payload.id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooksForShelf.fulfilled, (state, action) => {
        state.books = action.payload;
      })
      .addCase(addBookToUserShelf.fulfilled, (state, action) => {
        state.books.push(action.payload);
      })
      .addCase(addBookToUserShelf.rejected, (state, action) => {
        console.error("Failed to add book to shelf:", action.payload);
      })
      .addCase(removeBookFromUserShelf.fulfilled, (state, action) => {
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(fetchAllUserBooks.fulfilled, (state, action) => {
        state.books = action.payload;
      });
  },
});

export const { addBookToShelf, removeBookFromShelf } = bookshelfSlice.actions;
export default bookshelfSlice.reducer;
