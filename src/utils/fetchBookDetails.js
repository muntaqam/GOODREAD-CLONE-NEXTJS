// utils/fetchBookDetails.js
async function fetchBookDetails(bookId) {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch book details');
  }
  const data = await response.json();
  return data;
}

export default fetchBookDetails;
