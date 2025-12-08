import React, { useState, useEffect } from 'react'
import { Download, FolderOpen, CheckCircle, XCircle, Loader, FileText, Database } from 'lucide-react'
import { freePdfDownloadService, DownloadablePaper } from '../services/freePdfDownloadService'
import { downloadManager, DownloadStats } from '../services/downloadManager'
import { DownloadProgress } from '../services/freePdfDownloadService'

const AutoDownloader = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [downloadFolder, setDownloadFolder] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [availablePapers, setAvailablePapers] = useState<DownloadablePaper[]>([])
  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map())
  const [stats, setStats] = useState<DownloadStats>({ total: 0, completed: 0, failed: 0, inProgress: 0 })

  useEffect(() => {
    // Setup download manager callbacks
    downloadManager.onProgressUpdate = (progress) => {
      setDownloadProgress(new Map(progress))
    }

    downloadManager.onStatsUpdate = (newStats) => {
      setStats(newStats)
    }

    downloadManager.onComplete = () => {
      setIsDownloading(false)
      alert(`Download abgeschlossen!\n✅ Erfolgreich: ${stats.completed}\n❌ Fehler: ${stats.failed}`)
    }

    return () => {
      downloadManager.cleanup()
    }
  }, [stats])

  // Ordner auswählen
  const handleSelectFolder = async () => {
    if (!window.electronAPI) {
      alert('Electron API nicht verfügbar. Bitte in der Desktop-App ausführen.')
      return
    }

    const folder = await window.electronAPI.selectDownloadFolder()
    if (folder) {
      setDownloadFolder(folder)
    }
  }

  // Suche nach verfügbaren PDFs
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Bitte geben Sie ein Suchthema ein')
      return
    }

    setIsSearching(true)
    setAvailablePapers([])

    try {
      const papers = await freePdfDownloadService.searchAllFreePdfs(searchQuery)
      setAvailablePapers(papers)

      if (papers.length === 0) {
        alert('Keine freien PDFs gefunden. Versuchen Sie einen anderen Suchbegriff.')
      }
    } catch (error) {
      console.error('Fehler bei der Suche:', error)
      alert('Fehler bei der Suche. Bitte versuchen Sie es erneut.')
    } finally {
      setIsSearching(false)
    }
  }

  // Starte automatischen Download
  const handleStartDownload = async () => {
    if (!downloadFolder) {
      alert('Bitte wählen Sie zuerst einen Download-Ordner aus')
      return
    }

    if (availablePapers.length === 0) {
      alert('Keine PDFs zum Download verfügbar')
      return
    }

    setIsDownloading(true)
    setDownloadProgress(new Map())
    setStats({ total: 0, completed: 0, failed: 0, inProgress: 0 })

    try {
      await downloadManager.startDownloads(availablePapers, searchQuery, downloadFolder)
    } catch (error) {
      console.error('Fehler beim Download:', error)
      alert('Fehler beim Download. Siehe Console für Details.')
      setIsDownloading(false)
    }
  }

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      'arxiv': '📚',
      'semantic-scholar': '🤖',
      'pubmed': '🏥',
      'doaj': '🔓',
      'biorxiv': '🧬'
    }
    return icons[source] || '📄'
  }

  const getSourceName = (source: string) => {
    const names: Record<string, string> = {
      'arxiv': 'arXiv',
      'semantic-scholar': 'Semantic Scholar',
      'pubmed': 'PubMed',
      'doaj': 'DOAJ',
      'biorxiv': 'bioRxiv'
    }
    return names[source] || source
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="glassmorphism p-6">
        <div className="flex items-center mb-4">
          <Download className="h-8 w-8 text-green-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">Automatischer Literatur-Download</h1>
        </div>
        <p className="text-gray-300">
          Suchen Sie nach einem Thema und laden Sie automatisch alle verfügbaren freien PDFs herunter!
        </p>
      </div>

      {/* Schritt 1: Ordner auswählen */}
      <div className="glassmorphism p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-blue-400" />
          Schritt 1: Download-Ordner auswählen
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectFolder}
            className="px-6 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-400/30 flex items-center gap-2"
          >
            <FolderOpen className="h-5 w-5" />
            Ordner wählen
          </button>
          {downloadFolder && (
            <div className="flex-1 bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2">
              <span className="text-green-300 text-sm">✓ Ausgewählt: {downloadFolder}</span>
            </div>
          )}
        </div>
      </div>

      {/* Schritt 2: Thema suchen */}
      <div className="glassmorphism p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database className="h-6 w-6 text-purple-400" />
          Schritt 2: Freie PDFs suchen
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Suchthema eingeben... (z.B. 'quantum computing', 'machine learning')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-300 text-white placeholder-gray-300"
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Suche...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  PDFs suchen
                </>
              )}
            </button>
          </div>

          {availablePapers.length > 0 && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
              <p className="text-green-300 font-medium">
                ✓ {availablePapers.length} freie PDFs gefunden!
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['arxiv', 'semantic-scholar', 'pubmed', 'doaj', 'biorxiv'].map(source => {
                  const count = availablePapers.filter(p => p.source === source).length
                  if (count === 0) return null
                  return (
                    <span key={source} className="text-xs bg-white/10 px-2 py-1 rounded border border-white/20 text-gray-200">
                      {getSourceIcon(source)} {getSourceName(source)}: {count}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schritt 3: Download starten */}
      {availablePapers.length > 0 && (
        <div className="glassmorphism p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Download className="h-6 w-6 text-green-400" />
            Schritt 3: Automatischen Download starten
          </h2>
          <button
            onClick={handleStartDownload}
            disabled={isDownloading || !downloadFolder}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-bold"
          >
            {isDownloading ? (
              <>
                <Loader className="h-6 w-6 animate-spin" />
                Download läuft... ({stats.completed} / {stats.total})
              </>
            ) : (
              <>
                <Download className="h-6 w-6" />
                Alle {availablePapers.length} PDFs herunterladen
              </>
            )}
          </button>
        </div>
      )}

      {/* Download Progress */}
      {isDownloading && (
        <div className="glassmorphism p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Loader className="h-6 w-6 text-blue-400 animate-spin" />
            Download-Fortschritt
          </h2>

          {/* Statistiken */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-300">{stats.total}</div>
              <div className="text-xs text-blue-200">Gesamt</div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-300">{stats.inProgress}</div>
              <div className="text-xs text-yellow-200">Läuft</div>
            </div>
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-300">{stats.completed}</div>
              <div className="text-xs text-green-200">Fertig</div>
            </div>
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-300">{stats.failed}</div>
              <div className="text-xs text-red-200">Fehler</div>
            </div>
          </div>

          {/* Einzelne Downloads */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Array.from(downloadProgress.values()).map((progress) => (
              <div key={progress.paperId} className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {progress.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />}
                    {progress.status === 'failed' && <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />}
                    {progress.status === 'downloading' && <Loader className="h-5 w-5 text-blue-400 animate-spin flex-shrink-0" />}
                    {progress.status === 'pending' && <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />}
                    <span className="text-sm text-white truncate">{progress.title}</span>
                  </div>
                  <span className="text-xs text-gray-300 ml-2 flex-shrink-0">{progress.progress}%</span>
                </div>
                {progress.status === 'downloading' && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                )}
                {progress.error && (
                  <div className="text-xs text-red-300 mt-1">Fehler: {progress.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hinweis */}
      <div className="glassmorphism p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p><strong>Hinweis:</strong> Nur freie, Open-Access PDFs werden heruntergeladen (keine API Keys erforderlich).</p>
            <p className="mt-1">Quellen: arXiv, Semantic Scholar, PubMed Central, DOAJ, bioRxiv</p>
            <p className="mt-1">Die PDFs werden automatisch nach Thema/Jahr organisiert. BibTeX und Metadaten werden ebenfalls gespeichert.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutoDownloader
