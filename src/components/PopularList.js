import React, { useState, useEffect } from "react";

function PopularList() {
  const [booksData, setBooksData] = useState({});
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_NYT_API_KEY;

  const categories = [
    { name: "hardcover-fiction", label: "Hardcover Fiction" },
    { name: "hardcover-nonfiction", label: "Hardcover Nonfiction" },
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

  const renderBooksSection = (label, books) => (
    <div key={label} className="category-section">
      <h2>{label}</h2>
      <div className="book-list">
        {books.map((book) => (
          <div key={book.primary_isbn10} className="book">
            <div className="book-card">
              <img src={book.book_image} alt={book.title} />
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
              </div>
            </div>
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
      {categories.map((category) =>
        renderBooksSection(category.label, booksData[category.name])
      )}
    </div>
  );
}

export default PopularList;
