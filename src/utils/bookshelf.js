// src/utils/bookshelf.js

import supabase from "../lib/supabaseClient";

async function addBookToShelf(userId, bookId, status, cover_image_url) {
  const { data, error } = await supabase.from("userbookshelf").insert([
    {
      userid: userId,
      bookid: bookId,
      status: status,
      cover_image_url: cover_image_url,
    },
  ]);

  return { data, error };
}

async function getUserBookshelf(userId, status = null) {
  let query = supabase
    .from("userbookshelf")
    .select("id, status, bookid, books (*)")
    .eq("userid", userId);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  return { data, error };
}

async function updateBookStatus(userBookshelfId, newStatus) {
  const { data, error } = await supabase
    .from("userbookshelf")
    .update({ status: newStatus })
    .eq("id", userBookshelfId);

  return { data, error };
}

async function removeBookFromShelf(userBookshelfId) {
  const { data, error } = await supabase
    .from("userbookshelf")
    .delete()
    .eq("id", userBookshelfId);

  return { data, error };
}
async function checkBookExistsInDatabase(bookId) {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId);
    //.single();

    if (error) {
      if (error.message.includes("No rows found")) {
        return false;
      }
      throw error;
    }

    // return data !== null;
    return data.length > 0;
  } catch (error) {
    console.error("Unexpected error checking book existence:", error.message);
    return false;
  }
}

async function insertBookIntoDatabase(book) {
  const { data, error } = await supabase.from("books").insert([
    {
      id: book.id,
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors.join(", "),
      cover_image_url: book.volumeInfo.imageLinks?.thumbnail,
    },
  ]);

  if (error) {
    // console.log("this is the id ", book);
    // console.log("this is the id ", book.volumeInfo.title);
    // console.log("this is the author ", book.volumeInfo.authors.join(", "));
    // console.log("this is cover ", book.volumeInfo.imageLinks.thumbnail);
    // console.error("Error inserting book:", error);
    throw error;
  }
}

//displaying shelves
const fetchBooksForShelf = async (shelfName, userId) => {
  try {
    const { data, error } = await supabase
      .from("userbookshelf")
      .select("id, status, bookid, books(*)")
      .eq("userid", userId)
      .eq("status", shelfName);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching ${shelfName} books:`, error);
    return [];
  }
};

const bookshelf = {
  addBookToShelf,
  getUserBookshelf,
  updateBookStatus,
  removeBookFromShelf,
  checkBookExistsInDatabase,
  insertBookIntoDatabase,
  fetchBooksForShelf,
};

export default bookshelf;
