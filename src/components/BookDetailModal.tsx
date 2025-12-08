import React from 'react'
import { Book } from '../services/bookService'
import './BookDetailModal.css'

interface BookDetailModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, isOpen, onClose }) => {
  if (!isOpen || !book) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const openExternalLink = (url: string) => {
    if (window.electronAPI) {
      // Electron environment - use shell to open external links
      window.electronAPI.openExternal(url)
    } else {
      // Browser environment
      window.open(url, '_blank')
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2 className="modal-title">{book.title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="book-detail-layout">
            <div className="book-detail-image">
              {book.thumbnail || book.coverUrl ? (
                <img
                  src={book.thumbnail || book.coverUrl}
                  alt={book.title}
                  className="detail-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `<div class="detail-emoji">${book.image || '📚'}</div>`
                  }}
                />
              ) : (
                <div className="detail-emoji">{book.image || '📚'}</div>
              )}
            </div>

            <div className="book-detail-info">
              <div className="detail-row">
                <strong>Autor:</strong> {book.author}
              </div>

              {book.year && (
                <div className="detail-row">
                  <strong>Jahr:</strong> {book.year}
                </div>
              )}

              {book.publisher && (
                <div className="detail-row">
                  <strong>Verlag:</strong> {book.publisher}
                </div>
              )}

              {book.isbn && (
                <div className="detail-row">
                  <strong>ISBN:</strong> {book.isbn}
                </div>
              )}

              {book.pageCount && (
                <div className="detail-row">
                  <strong>Seiten:</strong> {book.pageCount}
                </div>
              )}

              {book.language && (
                <div className="detail-row">
                  <strong>Sprache:</strong> {book.language}
                </div>
              )}

              {book.editionCount && book.editionCount > 1 && (
                <div className="detail-row">
                  <strong>Ausgaben:</strong> {book.editionCount}
                </div>
              )}

              {book.ratings && book.ratings.average && (
                <div className="detail-row">
                  <strong>Bewertung:</strong> ⭐ {book.ratings.average.toFixed(1)}
                  {book.ratings.count && ` (${book.ratings.count} Bewertungen)`}
                </div>
              )}

              {book.hasFulltext && (
                <div className="detail-row">
                  <strong>Volltext:</strong> ✅ Verfügbar
                </div>
              )}
            </div>
          </div>

          {book.categories && book.categories.length > 0 && (
            <div className="detail-categories">
              <strong>Kategorien:</strong>
              <div className="categories-container">
                {book.categories.map((category, index) => (
                  <span key={index} className="category-tag">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {book.description && (
            <div className="detail-description">
              <strong>Beschreibung:</strong>
              <p>{book.description}</p>
            </div>
          )}

          {book.readingStats && (
            <div className="reading-stats">
              <strong>Lesestatistiken:</strong>
              <div className="stats-grid">
                {book.readingStats.wantToRead && (
                  <div className="stat-item">
                    📋 {book.readingStats.wantToRead} möchten lesen
                  </div>
                )}
                {book.readingStats.currentlyReading && (
                  <div className="stat-item">
                    📖 {book.readingStats.currentlyReading} lesen gerade
                  </div>
                )}
                {book.readingStats.alreadyRead && (
                  <div className="stat-item">
                    ✅ {book.readingStats.alreadyRead} haben gelesen
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {book.openLibraryKey && (
            <button
              className="btn external-link-btn"
              onClick={() => openExternalLink(`https://openlibrary.org${book.openLibraryKey}`)}
            >
              🔗 Open Library ansehen
            </button>
          )}

          {book.isbn && (
            <button
              className="btn external-link-btn"
              onClick={() => openExternalLink(`https://www.worldcat.org/isbn/${book.isbn}`)}
            >
              🌐 WorldCat suchen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookDetailModal