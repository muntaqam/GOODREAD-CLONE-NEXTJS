import { createSlice } from "@reduxjs/toolkit";

// Define the initial state of the reviews
const initialState = {
  // You might want to store reviews by bookId
  reviewsByBook: {},
};

export const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    // Action to set whether the user has reviewed a specific book
    setUserReviewStatus: (state, action) => {
      const { bookId, hasReviewed } = action.payload;
      state.reviewsByBook[bookId] = {
        ...state.reviewsByBook[bookId],
        hasUserReviewed: hasReviewed,
      };
    },
    // Additional actions for other review-related functionalities can be added here
  },
});

// Export actions
export const { setUserReviewStatus } = reviewSlice.actions;

// Export selectors
export const selectUserReviewStatus = (state, bookId) =>
  state.review.reviewsByBook[bookId]?.hasUserReviewed;

// Export the reducer
export default reviewSlice.reducer;
