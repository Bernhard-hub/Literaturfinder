import React, { useState } from 'react'
import { Search, Globe, Zap, Terminal, BookOpen, Languages } from 'lucide-react'
import SearchSection from './components/SearchSection'
import ResultsSection from './components/ResultsSection'
import BookDetailModal from './components/BookDetailModal'
import LiteraturePortal from './components/LiteraturePortal'
import SmartLauncher from './components/SmartLauncher'
import PaidLiteratureSearch from './components/PaidLiteratureSearch'
import { searchBooks, Book } from './services/bookService'
import { PaidPaper } from './services/paidLiteratureService'
import { I18nProvider, useI18n } from './i18n/translations.js'
import './App.css'

function AppContent() {
  const { t, language, setLanguage } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<'search' | 'portal' | 'smart-launcher' | 'paid' | 'evidenra'>('smart-launcher')
  const [devToolsOpen, setDevToolsOpen] = useState(false)
  const [evidenraExport, setEvidenraExport] = useState<PaidPaper[]>([])

  // Export für EVIDENRA - öffnet EVIDENRA Ultimate mit den ausgewählten Papers
  const handleExportToEvidenra = async (papers: PaidPaper[]) => {
    setEvidenraExport(papers)

    // Speichere Export-Daten für EVIDENRA
    const exportData = {
      source: 'Literaturfinder',
      exportedAt: new Date().toISOString(),
      papers: papers.map(p => ({
        id: p.id,
        title: p.title,
        authors: p.authors,
        year: p.year,
        journal: p.journal,
        publisher: p.publisher,
        doi: p.doi,
        abstract: p.abstract,
        url: p.url,
        openAccessUrl: p.openAccessUrl,
        institutionalUrl: p.institutionalUrl,
        libgenUrl: p.libgenUrl
      }))
    }

    // Speichere in localStorage für EVIDENRA
    localStorage.setItem('literaturfinder_export', JSON.stringify(exportData))

    // Versuche EVIDENRA zu öffnen via Deep Link oder Electron IPC
    if (window.electronAPI?.openEvidenra) {
      await window.electronAPI.openEvidenra(exportData)
    } else {
      // Fallback: Download als JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evidenra-import-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      alert(t.exportSuccess)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setSearchQuery(query)

    try {
      const results = await searchBooks(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Fehler bei der Suche:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowDetails = (book: Book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBook(null)
  }

  const handleToggleDevTools = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.toggleDevTools()
      setDevToolsOpen(result.isOpen)
    }
  }

  return (
    <div className="app bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 min-h-screen">
      <div className="container">
        <header className="app-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <h1 className="app-title text-white flex items-center gap-2">
                <span className="text-2xl">📚</span> {t.appTitle}
              </h1>
              <p className="app-subtitle text-gray-400">
                {t.appSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('de')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    language === 'de'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  DE
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    language === 'en'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
              <button
                onClick={handleToggleDevTools}
                className="devtools-toggle"
                style={{
                  padding: '8px 16px',
                  background: devToolsOpen ? '#10b981' : 'rgba(99, 102, 241, 0.3)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                title={devToolsOpen ? t.consoleOn : t.consoleOff}
              >
                <Terminal size={18} />
                {devToolsOpen ? t.consoleOn : t.consoleOff}
              </button>
            </div>
          </div>

          {/* Navigation - EVIDENRA Style */}
          <div className="mode-navigation flex gap-2 mt-4 p-1 bg-gray-800/30 rounded-xl backdrop-blur-xl">
            <button
              onClick={() => setCurrentMode('smart-launcher')}
              className={`mode-button flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                currentMode === 'smart-launcher'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="h-5 w-5" />
              {t.navSmartLauncher}
            </button>
            <button
              onClick={() => setCurrentMode('paid')}
              className={`mode-button flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                currentMode === 'paid'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              {t.navPaidLiterature}
            </button>
            <button
              onClick={() => setCurrentMode('portal')}
              className={`mode-button flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                currentMode === 'portal'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="h-5 w-5" />
              {t.navOpenAccess}
            </button>
            <button
              onClick={() => setCurrentMode('search')}
              className={`mode-button flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                currentMode === 'search'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="h-5 w-5" />
              {t.navBookSearch}
            </button>
          </div>
        </header>

        {currentMode === 'smart-launcher' ? (
          <SmartLauncher />
        ) : currentMode === 'paid' ? (
          <PaidLiteratureSearch onExportToEvidenra={handleExportToEvidenra} />
        ) : currentMode === 'portal' ? (
          <LiteraturePortal />
        ) : (
          <>
            <SearchSection
              onSearch={handleSearch}
              isLoading={isLoading}
            />

            <ResultsSection
              results={searchResults}
              searchQuery={searchQuery}
              isLoading={isLoading}
              onShowDetails={handleShowDetails}
            />

            <BookDetailModal
              book={selectedBook}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
            />
          </>
        )}
      </div>
    </div>
  )
}

// Main App with I18n Provider
function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App