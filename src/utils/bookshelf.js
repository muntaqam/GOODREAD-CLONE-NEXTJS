// src/utils/bookshelf.js

import supabase from '../lib/supabaseClient';

async function addBookToShelf(userId, bookId, status) {
  const { data, error } = await supabase
    .from('userbookshelf')
    .insert([
      { userid: userId, bookid: bookId, status: status }
    ]);

  return { data, error };
}


async function getUserBookshelf(userId, status = null) {
  let query = supabase
    .from('userbookshelf')
    .select('id, status, bookid, books (*)')
    .eq('userid', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  return { data, error };
}

async function updateBookStatus(userBookshelfId, newStatus) {
  const { data, error } = await supabase
    .from('userbookshelf')
    .update({ status: newStatus })
    .eq('id', userBookshelfId);

  return { data, error };
}

async function removeBookFromShelf(userBookshelfId) {
  const { data, error } = await supabase
    .from('userbookshelf')
    .delete()
    .eq('id', userBookshelfId);

  return { data, error };
}

const bookshelf = {
  addBookToShelf,
  getUserBookshelf,
  updateBookStatus,
  removeBookFromShelf
};

export default bookshelf;