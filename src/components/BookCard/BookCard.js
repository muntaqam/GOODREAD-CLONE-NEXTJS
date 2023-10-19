import React from 'react';

function BookCard({ book }) {
    return (
        <div className=" bg-red-500 flex mb-6 mt-6 p-4 rounded-lg shadow-md items-center">
            <img src={book.thumbnailUrl} alt={book.title} className="w-32 h-48 mr-4 rounded object-cover"/>
            <div>
                <h2 className="text-xl font-bold">{book.title}</h2>
                <h3 className="text-lg mt-2 text-gray-700">{book.author}</h3>
                {/* You can add additional details here, like page count and publication date, once you fetch them */}
            </div>
        </div>
    );
}

export default BookCard;
