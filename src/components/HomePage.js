import SearchBar from './SearchBar';
import BookList from './BookList';

function HomePage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    const handleSearch = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${apiKey}`);
            const data = await response.json();
            setBooks(data.items);
        } catch (error) {
            console.error("Error fetching Google Books:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 flex flex-col">
            <SearchBar onSearch={handleSearch} />
            {loading ? <div>Loading...</div> : <BookList books={books} />}
        </div>
    );
}

export default HomePage;
