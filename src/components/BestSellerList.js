import React, { useState, useEffect } from 'react';

// Define your categories outside of the component for better organization
const categories = [
  { name: 'hardcover-fiction', label: 'Hardcover Fiction' },
  { name: 'childrens-middle-grade-hardcover', label: "Children's Books" },
  { name: 'graphic-books-and-manga', label: 'Graphic Books and Manga' },
  { name: 'hardcover-nonfiction', label: 'Hardcover Nonfiction' }
];

// Initialize booksData with an object that contains an empty array for each category
const initialBooksData = categories.reduce((acc, category) => {
  acc[category.name] = [];
  return acc;
}, {});

function BestSellerList() {
  // State initialization using the initialBooksData
  const [booksData, setBooksData] = useState(initialBooksData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const newBooksData = { ...initialBooksData };

      for (const category of categories) {
        try {
          const response = await fetch(`/api/books?category=${category.name}`);
          const booksWithImages = await response.json();
          newBooksData[category.name] = booksWithImages;
        } catch (error) {
          console.error(`Error fetching category ${category.name}:`, error);
        }
      }

      setBooksData(newBooksData);
      setLoading(false);
    }

    fetchCategories();
  }, []);

  const renderBooksSection = (label, books) => (
    <div className="book-section mt-8">
      <h2 className="text-xl font-bold mb-4">{label}</h2>
      <div className="flex overflow-x-scroll hide-scrollbar space-x-4 p-4">
        {Array.isArray(books) && books.slice(0, 8).map(book => (
          <div key={book.rank} className="bestseller-book flex-none relative w-48">
            <img src={book.imageUrl} alt={book.book_details[0].title} className="object-cover w-full h-72 rounded-md shadow-lg"/>
            <h3 className="text-center mt-2 text-sm font-bold">{book.book_details[0].title}</h3>
            <p className="text-center text-xs text-gray-500">{book.book_details[0].author}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div>
      {categories.map((category) => 
        renderBooksSection(category.label, booksData[category.name])
      )}
    </div>
  );
}

export default BestSellerList;
