import Head from 'next/head';
import BookList from '../components/BookCard/BookList';


export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Head>
        <title>Book List</title>
      </Head>

      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl">My Bookshelf</h1>
      </header>

      <main className="p-4">
        <BookList />
      </main>

      <footer className="bg-blue-600 text-white p-4 mt-6">
        {/* Any footer content */}
        <p className="text-center">All rights reserved. My Bookshelf © 2023.</p>
      </footer>
    </div>
  );
}
