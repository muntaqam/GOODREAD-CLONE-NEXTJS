import React, { useState, useEffect } from 'react';

function BestSellerList() {
    const categories = [
        { name: 'hardcover-fiction', label: 'Hardcover Fiction' },
         { name: 'childrens-middle-grade-hardcover', label: "Children's Books" },
         { name: 'graphic-books-and-manga', label: 'Graphic Books and Manga' },
         { name: 'hardcover-nonfiction', label: 'Hardcover Nonfiction' }
    ];

    const [booksData, setBooksData] = useState({});
    const [loading, setLoading] = useState(true);
    const nytApiKey = process.env.NEXT_PUBLIC_NYT_API_KEY;
    const googleBooksApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    const updateCover = async (isbn) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${googleBooksApiKey}`);
            const data = await response.json();
            let img = data.items[0].volumeInfo.imageLinks.thumbnail;
            img = img.replace(/^http:\/\//i, 'https://');
            return img;
        } catch (error) {
            console.error('Error fetching book cover:', error);
            return [];
        }
    };

    useEffect(() => {
  async function fetchCategories() {
    setLoading(true);
    const newBooksData = {};

    for (const category of categories) {
      try {
        const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists.json?list-name=${category.name}&api-key=${nytApiKey}`);
        const data = await response.json();

        const booksWithImages = await Promise.all(
          data.results.map(async (book) => {
            const imageLink = await updateCover(book.isbns[0].isbn10);
            return { ...book, imageUrl: imageLink };
          })
        );

        newBooksData[category.name] = booksWithImages;
      } catch (error) {
        console.error(`Error fetching NYT ${category.name}:`, error);
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
            {books?.slice(0, 8).map(book => (
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
