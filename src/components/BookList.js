import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

function BookList() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBooks() {
            const { data, error } = await supabase.from('books').select('*');
            
            if (error) {
                console.error("Error fetching books:", error);
            } else {
                console.log("Fetched books:", data);  // Log the fetched data
                setBooks(data);
            }

            setLoading(false);
        }

        fetchBooks();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>All Books</h1>
            <ul>
                {books.map(book => {
                    console.log("Rendering book:", book);  // Log each book being rendered
                    return (
                        <li key={book.id}>
                            <h2>{book.title}</h2>
                            <p>{book.author}</p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default BookList;
