import React, { useState } from 'react'
import { Book } from '../services/bookService'
import { bookmarkService } from '../services/bookmarkService'
import './BookCard.css'

interface BookCardProps {
  book: Book
  animationDelay?: number
  onShowDetails: (book: Book) => void
}

const BookCard: React.FC<BookCardProps> = ({ book, animationDelay = 0, onShowDetails }) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarkService.isBookmarked(book.id))

  const handleBookmark = () => {
    const newBookmarkState = bookmarkService.toggleBookmark(book)
    setIsBookmarked(newBookmarkState)
  }

  const handleShowDetails = () => {
    onShowDetails(book)
  }
  return (
    <div
      className="book-card glass-card"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="book-image">
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="book-thumbnail"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement!.innerHTML = `<span class="book-emoji">${book.image || '📚'}</span>`
            }}
          />
        ) : (
          <span className="book-emoji">{book.image || '📚'}</span>
        )}
      </div>

      <div className="book-content">
        <h4 className="book-title">{book.title}</h4>
        <p className="book-author">von {book.author}</p>
        <p className="book-year">📅 {book.year}</p>

        {book.isbn && (
          <p className="book-isbn">
            <span className="isbn-label">ISBN:</span> {book.isbn}
          </p>
        )}

        {book.pageCount && (
          <p className="book-pages">📄 {book.pageCount} Seiten</p>
        )}

        {book.categories && book.categories.length > 0 && (
          <div className="book-categories">
            {book.categories.slice(0, 3).map((category, index) => (
              <span key={index} className="category-tag">
                {category}
              </span>
            ))}
          </div>
        )}

        {book.editionCount && book.editionCount > 1 && (
          <p className="book-editions">📚 {book.editionCount} Ausgaben</p>
        )}

        {book.ratings && book.ratings.average && (
          <p className="book-rating">
            ⭐ {book.ratings.average.toFixed(1)}
            {book.ratings.count && ` (${book.ratings.count} Bewertungen)`}
          </p>
        )}

        {book.description && (
          <p className="book-description">
            {book.description.length > 150
              ? `${book.description.substring(0, 150)}...`
              : book.description
            }
          </p>
        )}
      </div>

      <div className="book-actions">
        <button
          className="btn btn-small action-btn"
          onClick={handleShowDetails}
          title="Details anzeigen"
        >
          📋 Details
        </button>
        <button
          className={`btn btn-small action-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmark}
          title={isBookmarked ? 'Aus Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
        >
          {isBookmarked ? '❤️ Gemerkt' : '🤍 Merken'}
        </button>
      </div>
    </div>
  )
}

export default BookCard