// src/store/actions.js
export const SEARCH_INITIATED = "SEARCH_INITIATED";
export const SEARCH_RESULTS_RECEIVED = "SEARCH_RESULTS_RECEIVED";

export const initiateSearch = (query) => ({
  type: SEARCH_INITIATED,
  payload: query,
});

export const setSearchResults = (results) => ({
  type: SEARCH_RESULTS_RECEIVED,
  payload: results,
});
