// src/store/searchReducer.js
import { SEARCH_INITIATED, SEARCH_RESULTS_RECEIVED } from "./actions";

const initialState = {
  query: "",
  results: [],
  loading: false,
};

export const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SEARCH_INITIATED:
      return { ...state, query: action.payload, loading: true, results: [] };

    case SEARCH_RESULTS_RECEIVED:
      return { ...state, results: action.payload, loading: false };
    default:
      return state;
  }
};
