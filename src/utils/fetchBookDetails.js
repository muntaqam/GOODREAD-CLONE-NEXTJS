// utils/fetchBookDetails.js
async function fetchBookDetails(bookId) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${bookId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch book details");
  }
  const data = await response.json();
  return data;
}

async function fetchGoogleBookDetails(title) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const formattedTitle = encodeURIComponent(
    bookTitle.toLowerCase().replace(/ /g, "+")
  );
  const url = `https://www.googleapis.com/books/v1/volumes?q=${formattedTitle}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch book details");
    }
    const data = await response.json();
    return data.items ? data.items[0] : null;
  } catch (error) {
    console.error("Error fetching book details:", error);
    throw error;
  }
}

export default fetchBookDetails;
