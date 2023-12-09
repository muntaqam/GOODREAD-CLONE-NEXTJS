import { useRouter } from 'next/router';

function BookDetails() {
  const router = useRouter();
  const { bookId ,title, thumbnailUrl} = router.query;

  // Here you would fetch the book details using the bookId
  // For example, you might make an API call to fetch the book data

  return (
    <div>
      <h1>Book Details</h1>
      {/* Display the book details here */}
      <p>Book ID: {bookId}</p>
      {/* Add more book details */}
    </div>
  );
}

export default BookDetails;
