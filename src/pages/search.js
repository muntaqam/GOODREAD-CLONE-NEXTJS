import { useSelector } from "react-redux";
import BookCard from "../components/BookCard/BookCard";

function SearchPage() {
  const { results } = useSelector((state) => state.search);

  return (
    <div>
      <h1>Search Resultssss</h1>
      <div>
        {results.map((book, index) => (
          <BookCard key={index} book={book} />
        ))}
      </div>
    </div>
  );
}

export default SearchPage;
