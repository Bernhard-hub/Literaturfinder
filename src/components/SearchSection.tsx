import React, { useState } from 'react'
import './SearchSection.css'

interface SearchSectionProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <section className="search-section glass-card">
      <h2 className="search-title">Literatur suchen</h2>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Titel, Autor oder Stichwort eingeben..."
            className="input-field search-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`btn search-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <span className="loading-spinner">🔍</span>
            ) : (
              '🔍 Suchen'
            )}
          </button>
        </div>
      </form>

      <div className="search-tips">
        <p className="tip-title">💡 Suchtipps:</p>
        <ul className="tips-list">
          <li>Suchen Sie nach Titel, Autor oder Genre</li>
          <li>Verwenden Sie Teilwörter für breitere Ergebnisse</li>
          <li>Probieren Sie verschiedene Schreibweisen</li>
        </ul>
      </div>
    </section>
  )
}

export default SearchSection