import Head from 'next/head';
import BookList from '../components/BookList';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Book List</title>
      </Head>

      <main>
        <BookList />
      </main>

      <footer>
        {/* Any footer content */}
      </footer>
    </div>
  );
}
