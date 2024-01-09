import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

function PopularList() {
  const [booksData, setBooksData] = useState({});
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_NYT_API_KEY;

  const categories = [
    { name: "hardcover-fiction", label: "Hardcover Fiction" },
    { name: "hardcover-nonfiction", label: "Hardcover Nonfiction" },
    {
      name: "paperback-nonfiction",
      label: "Paperback Nonfiction",
    },
    {
      name: "childrens-middle-grade-hardcover",
      label: "Children’s Middle Grade Hardcover",
    },

    { name: "young-adult-hardcover", label: "Young Adult Hardcover" },
  ];

  useEffect(() => {
    setLoading(true);

    const fetchData = async (category) => {
      const cachedData = localStorage.getItem(category.name);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      try {
        const response = await fetch(
          `https://api.nytimes.com/svc/books/v3/lists/current/${category.name}.json?api-key=${apiKey}`
        );
        if (!response.ok) {
          throw new Error("API request failed");
        }
        const data = await response.json();
        localStorage.setItem(category.name, JSON.stringify(data.results.books));
        return data.results.books;
      } catch (error) {
        console.error(
          "Error fetching books for category",
          category.name,
          ":",
          error
        );
        return []; // Return an empty array in case of error
      }
    };

    Promise.all(categories.map((category) => fetchData(category)))
      .then((results) => {
        const newBooksData = categories.reduce((acc, category, index) => {
          acc[category.name] = results[index];
          return acc;
        }, {});
        setBooksData(newBooksData);
      })
      .catch((error) => console.error("Error in fetching books:", error))
      .finally(() => setLoading(false));
  }, []);

  const scrollList = (direction, categoryIndex) => {
    const bookList = document.querySelector(`.category-${categoryIndex}`);
    if (direction === "left") {
      bookList.scrollLeft -= 150;
    } else {
      bookList.scrollLeft += 150;
    }
  };
  const renderBooksSection = (label, books, categoryIndex) => (
    <div key={label} className="category-section px-12 mt-4 relative">
      <div className="flex items-center my-4">
        <div className="flex-grow h-0.5 bg-gray-400"></div>
        <span className="mx-4 text-lg font-semibold text-gray-700">
          {label}
        </span>
        <div className="flex-grow h-0.5 bg-gray-400"></div>
      </div>

      {/* Left arrow button on top of the first book */}
      <button
        onClick={() => scrollList("left", categoryIndex)}
        className="left-arrow absolute left-0 top-1/2 transform -translate-y-1/2"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <div className={`book-list category-${categoryIndex}`}>
        {books.map((book, index) => (
          <div key={book.primary_isbn10} className="book">
            <div className="book-card">
              <img src={book.book_image} alt={book.title} />
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
              </div>
            </div>
            {/* Right arrow button on top of the first book on the right */}
            {index === 0 && (
              <button
                onClick={() => scrollList("right", categoryIndex)}
                className="right-arrow absolute right-0 top-1/2 transform -translate-y-1/2"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {categories.map((category, categoryIndex) =>
        renderBooksSection(
          category.label,
          booksData[category.name],
          categoryIndex
        )
      )}
    </div>
  );
}

export default PopularList;
