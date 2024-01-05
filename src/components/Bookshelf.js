import { BookCard } from "../components/BookCard/BookCard";

function BookShelf({ shelfType, books }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{shelfType}</h2>
      <div>
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
