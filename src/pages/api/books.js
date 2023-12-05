// pages/api/books.js

// Cache object
let cache = {};

// Function to check if the cache is expired
function isCacheExpired(entry) {
  const EXPIRY_DURATION = 1000 * 60 * 60; // 1 hour
  return (Date.now() - entry.timestamp) > EXPIRY_DURATION;
}

// Function to update book covers using Google Books API
async function updateCover(isbn, googleBooksApiKey) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${googleBooksApiKey}`);
    const data = await response.json();
    let img = data.items[0]?.volumeInfo?.imageLinks?.thumbnail || 'default-thumbnail.jpg';
    img = img.replace(/^http:\/\//i, 'https://');
    return img;
  } catch (error) {
    console.error('Error fetching book cover:', error);
    return 'default-thumbnail.jpg'; // Return a default thumbnail if an error occurs
  }
}
// Function to fetch new data and update the cache
async function fetchBookCovers(isbns, googleBooksApiKey) {
  // Construct the individual requests for each ISBN
  const requests = isbns.map(isbn => ({
    "get": {
      "volumeId": isbn,
      // Include any other parameters you need for the request
    }
  }));

  // Construct the batch request payload
  const requestBody = {
    "requests": requests
  };

  // Send the batch request to the Google Books API
  try {
    const response = await fetch(`https://www.googleapis.com/batch/books/v1?key=${googleBooksApiKey}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Parse the batch response to extract the individual responses
    const batchResponse = await response.json();
    const bookCovers = batchResponse.replies.map(reply => {
      // Extract the thumbnail URL from each reply
      // This will depend on the structure of the reply object
      return reply.response.volumeInfo.imageLinks.thumbnail;
    });

    // Return an array of thumbnail URLs
    return bookCovers;
  } catch (error) {
    console.error('Error fetching book covers:', error);
    throw error; // Re-throw the error for further handling
  }
}



// API route handler
export default async function handler(req, res) {
  const { category } = req.query;
  const nytApiKey = process.env.NEXT_PUBLIC_NYT_API_KEY;
  const googleBooksApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  // Check if the category data is cached and not expired
  if (cache[category] && !isCacheExpired(cache[category])) {
    res.status(200).json(cache[category].data);
  } else {
    try {
      const data = await fetchAndUpdateCache(category, nytApiKey, googleBooksApiKey);
      cache[category] = { timestamp: Date.now(), data };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching data' });
    }
  }
}
