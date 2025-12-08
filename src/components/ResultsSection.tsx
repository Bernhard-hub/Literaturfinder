import React from 'react'
import BookCard from './BookCard'
import { Book } from '../services/bookService'
import './ResultsSection.css'

interface ResultsSectionProps {
  results: Book[]
  searchQuery: string
  isLoading: boolean
  onShowDetails: (book: Book) => void
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  results,
  searchQuery,
  isLoading,
  onShowDetails
}) => {
  if (isLoading) {
    return (
      <section className="results-section glass-card">
        <div className="loading-container">
          <div className="loading-spinner-large">📚</div>
          <p className="loading-text">Suche nach Literatur...</p>
        </div>
      </section>
    )
  }

  if (!searchQuery) {
    return (
      <section className="results-section glass-card">
        <div className="welcome-message">
          <div className="welcome-icon">📖</div>
          <h3>Willkommen beim Literaturfinder!</h3>
          <p>Geben Sie einen Suchbegriff ein, um mit der Literatursuche zu beginnen.</p>
        </div>
      </section>
    )
  }

  if (results.length === 0) {
    return (
      <section className="results-section glass-card">
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>Keine Ergebnisse gefunden</h3>
          <p>Für "{searchQuery}" wurden keine Bücher gefunden.</p>
          <p className="suggestion">Versuchen Sie es mit anderen Suchbegriffen.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="results-section glass-card">
      <div className="results-header">
        <h3 className="results-title">
          Suchergebnisse für "{searchQuery}"
        </h3>
        <p className="results-count">
          {results.length} {results.length === 1 ? 'Buch' : 'Bücher'} gefunden
        </p>
      </div>

      <div className="results-grid">
        {results.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            animationDelay={index * 0.1}
            onShowDetails={onShowDetails}
          />
        ))}
      </div>
    </section>
  )
}

export default ResultsSection