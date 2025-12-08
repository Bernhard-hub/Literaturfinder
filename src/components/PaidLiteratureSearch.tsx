// PaidLiteratureSearch.tsx - Bezahlte Literatur mit Zugangs-Lösungen
// EVIDENRA Ultimate Design + DE/EN Internationalisierung
import React, { useState, useEffect } from 'react'
import {
  Search, BookOpen, ExternalLink, Download, Building2,
  Unlock, AlertTriangle, Settings, ChevronDown, ChevronUp,
  Copy, Check, FileText, Globe, Library, Key, Languages,
  Zap, CheckCircle, Sparkles, ToggleLeft, ToggleRight,
  FileDown, Play, Pause, List, FolderDown
} from 'lucide-react'
import {
  paidLiteratureService,
  PaidPaper,
  PaidLiteratureService
} from '../services/paidLiteratureService'
import { useI18n } from '../i18n/translations.js'

interface PaidLiteratureSearchProps {
  onExportToEvidenra?: (papers: PaidPaper[]) => void
}

const PaidLiteratureSearch: React.FC<PaidLiteratureSearchProps> = ({ onExportToEvidenra }) => {
  const { t, language, setLanguage } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PaidPaper[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set())
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [autoSelectAll, setAutoSelectAll] = useState(true) // Auto-select nach Suche

  // PDF Download
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<ReturnType<typeof PaidLiteratureService.createDownloadStatus> | null>(null)

  // Settings
  const [showSettings, setShowSettings] = useState(false)
  const [selectedResolver, setSelectedResolver] = useState<string>('')
  const [includeUnpaywall, setIncludeUnpaywall] = useState(true)
  const [includeLibGen, setIncludeLibGen] = useState(true)
  const [autoExport, setAutoExport] = useState(false) // Auto-Export Option

  // Get regions with translations
  const getRegionLabel = (region: string): string => {
    const labels: Record<string, string> = {
      'austria': t.austria,
      'germany': t.germany,
      'switzerland': t.switzerland,
      'usa': t.usa,
      'uk': t.uk,
      'netherlands': t.netherlands,
      'scandinavia': t.scandinavia,
      'france': t.france,
      'spain': t.spain,
      'italy': t.italy,
      'canada': t.canada,
      'australia': t.australia,
      'asia': t.asia
    }
    return labels[region] || region
  }

  // Configure OpenURL Resolver
  useEffect(() => {
    if (selectedResolver && PaidLiteratureService.KNOWN_RESOLVERS[selectedResolver]) {
      paidLiteratureService.setOpenURLConfig(
        PaidLiteratureService.KNOWN_RESOLVERS[selectedResolver]
      )
    }
  }, [selectedResolver])

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setResults([])
    setExportSuccess(false)

    try {
      const papers = await paidLiteratureService.searchAllPaidSources(query, {
        includeUnpaywall,
        includeLibGen,
        maxPerSource: 5
      })
      setResults(papers)

      // Auto-select alle Ergebnisse wenn aktiviert
      if (autoSelectAll && papers.length > 0) {
        setSelectedPapers(new Set(papers.map(p => p.id)))
      }

      // Auto-Export wenn aktiviert
      if (autoExport && papers.length > 0) {
        setTimeout(() => {
          performExport(papers)
        }, 500)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Zentrale Export-Funktion
  const performExport = (papersToExport: PaidPaper[]) => {
    if (papersToExport.length === 0) return

    if (onExportToEvidenra) {
      onExportToEvidenra(papersToExport)
    } else {
      // Download als JSON fuer EVIDENRA
      const json = paidLiteratureService.exportForEvidenra(papersToExport)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evidenra-import-${query.replace(/\s+/g, '-')}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 3000)
  }

  const toggleSelect = (paperId: string) => {
    setSelectedPapers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(paperId)) {
        newSet.delete(paperId)
      } else {
        newSet.add(paperId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedPapers(new Set(results.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedPapers(new Set())
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const exportSelected = () => {
    const selected = results.filter(p => selectedPapers.has(p.id))
    performExport(selected)
  }

  // Schnell-Export: Alle Ergebnisse sofort exportieren
  const quickExportAll = () => {
    performExport(results)
  }

  // PDF Download Funktionen
  const papersWithPdf = results.filter(p => paidLiteratureService.getBestPdfUrl(p))

  const startBatchDownload = async () => {
    const selected = results.filter(p => selectedPapers.has(p.id))
    const toDownload = selected.length > 0 ? selected : papersWithPdf

    if (toDownload.length === 0) {
      alert(language === 'de' ? 'Keine PDFs verfuegbar' : 'No PDFs available')
      return
    }

    setIsDownloading(true)
    await paidLiteratureService.batchDownloadPdfs(
      toDownload,
      (status) => setDownloadStatus({ ...status }),
      1500
    )
    setIsDownloading(false)
  }

  const exportDownloadList = () => {
    const list = paidLiteratureService.generateDownloadList(results)
    const blob = new Blob([list], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pdf-download-list-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportFullJson = () => {
    const json = paidLiteratureService.exportFullData(results)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evidenra-full-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 3000)
  }

  const exportBibTeX = () => {
    const selected = results.filter(p => selectedPapers.has(p.id))
    const bibtex = paidLiteratureService.exportBibTeX(selected)
    const blob = new Blob([bibtex], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `literaturfinder-export-${Date.now()}.bib`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getAccessBadge = (paper: PaidPaper) => {
    if (paper.openAccessUrl) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          <Unlock className="w-3 h-3 mr-1" />
          Open Access
        </span>
      )
    }
    if (paper.unpaywall?.oa_status === 'green') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Unlock className="w-3 h-3 mr-1" />
          {t.accessGreenOA}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <Key className="w-3 h-3 mr-1" />
        {t.accessPaid}
      </span>
    )
  }

  const resolversByRegion = PaidLiteratureService.getResolversByRegion()

  return (
    <div className="paid-literature-search p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 min-h-screen">
      {/* Header with Language Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            {t.paidLiteratureTitle}
          </h2>
          <p className="text-gray-400 mt-1 ml-13">
            {t.paidLiteratureSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all ${
              showSettings
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel - EVIDENRA Style */}
      {showSettings && (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/10 space-y-5 shadow-xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            {t.institutionalAccess}
          </h3>

          <select
            value={selectedResolver}
            onChange={(e) => setSelectedResolver(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-900/80 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">{t.selectUniversity}</option>
            {Object.entries(resolversByRegion).map(([region, unis]) => (
              <optgroup key={region} label={`${getRegionLabel(region)} (${unis.length})`}>
                {unis.map(uni => (
                  <option key={uni} value={uni}>
                    {PaidLiteratureService.getResolverDisplayName(uni)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeUnpaywall}
                onChange={(e) => setIncludeUnpaywall(e.target.checked)}
                className="w-5 h-5 rounded-lg bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 cursor-pointer"
              />
              <Unlock className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-white transition-colors">{t.openAccessVersions}</span>
            </label>

            <label className="flex items-center gap-2 text-gray-300 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeLibGen}
                onChange={(e) => setIncludeLibGen(e.target.checked)}
                className="w-5 h-5 rounded-lg bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 cursor-pointer"
              />
              <Library className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-white transition-colors">{t.libgenLinks}</span>
            </label>
          </div>

          {includeLibGen && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300/90">
                <strong>⚠️</strong> {t.libgenWarning}
              </p>
            </div>
          )}

          {/* Automatisierung */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-md font-semibold text-white flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              {language === 'de' ? 'Automatisierung' : 'Automation'}
            </h4>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer group bg-gray-900/30 px-4 py-3 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all">
                <button
                  onClick={() => setAutoSelectAll(!autoSelectAll)}
                  className="text-purple-400"
                >
                  {autoSelectAll ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-500" />}
                </button>
                <div>
                  <span className="font-medium group-hover:text-white transition-colors block">
                    {language === 'de' ? 'Auto-Auswahl' : 'Auto-Select'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {language === 'de' ? 'Alle Ergebnisse automatisch markieren' : 'Automatically select all results'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 text-gray-300 cursor-pointer group bg-gray-900/30 px-4 py-3 rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
                <button
                  onClick={() => setAutoExport(!autoExport)}
                  className="text-green-400"
                >
                  {autoExport ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-500" />}
                </button>
                <div>
                  <span className="font-medium group-hover:text-white transition-colors block">
                    {language === 'de' ? 'Auto-Export' : 'Auto-Export'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {language === 'de' ? 'Sofort JSON exportieren nach Suche' : 'Immediately export JSON after search'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar - EVIDENRA Style */}
      <div className="flex gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.searching}
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              {t.searchButton}
            </>
          )}
        </button>
      </div>

      {/* Export Success Banner */}
      {exportSuccess && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <span className="text-green-300 font-medium">
            {language === 'de'
              ? `Export erfolgreich! ${selectedPapers.size || results.length} Paper wurden als JSON gespeichert.`
              : `Export successful! ${selectedPapers.size || results.length} papers saved as JSON.`
            }
          </span>
        </div>
      )}

      {/* Quick Export Bar - PROMINENTER EIN-KLICK EXPORT */}
      {results.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/30 shadow-lg shadow-purple-500/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {language === 'de' ? 'Schnell-Export' : 'Quick Export'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {language === 'de'
                    ? `${results.length} Ergebnisse • ${papersWithPdf.length} PDFs verfuegbar`
                    : `${results.length} results • ${papersWithPdf.length} PDFs available`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={exportFullJson}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Zap className="w-5 h-5" />
                {language === 'de' ? 'JSON EXPORT' : 'JSON EXPORT'}
              </button>
              <button
                onClick={exportBibTeX}
                className="px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium flex items-center gap-2 transition-all"
              >
                <FileText className="w-5 h-5" />
                BibTeX
              </button>
            </div>
          </div>

          {/* PDF Download Section */}
          {papersWithPdf.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileDown className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      {language === 'de' ? 'PDF Downloads' : 'PDF Downloads'}
                    </h4>
                    <p className="text-gray-500 text-xs">
                      {language === 'de'
                        ? `${papersWithPdf.length} Open Access PDFs gefunden`
                        : `${papersWithPdf.length} Open Access PDFs found`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={startBatchDownload}
                    disabled={isDownloading}
                    className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                      isDownloading
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {language === 'de' ? 'Lade...' : 'Loading...'}
                      </>
                    ) : (
                      <>
                        <FolderDown className="w-5 h-5" />
                        {language === 'de' ? 'ALLE PDFs OEFFNEN' : 'OPEN ALL PDFs'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={exportDownloadList}
                    className="px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium flex items-center gap-2 transition-all"
                    title={language === 'de' ? 'Download-Liste fuer wget/curl' : 'Download list for wget/curl'}
                  >
                    <List className="w-5 h-5" />
                    {language === 'de' ? 'URL-Liste' : 'URL List'}
                  </button>
                </div>
              </div>

              {/* Download Progress */}
              {downloadStatus && isDownloading && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {language === 'de' ? 'Fortschritt' : 'Progress'}: {downloadStatus.completed}/{downloadStatus.total}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {downloadStatus.failed > 0 && `${downloadStatus.failed} ${language === 'de' ? 'fehlgeschlagen' : 'failed'}`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                      style={{ width: `${(downloadStatus.completed / downloadStatus.total) * 100}%` }}
                    />
                  </div>
                  {downloadStatus.current && (
                    <p className="text-gray-400 text-xs mt-2 truncate">
                      {language === 'de' ? 'Aktuell' : 'Current'}: {downloadStatus.current}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Actions - EVIDENRA Style */}
      {results.length > 0 && (
        <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-xl rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-4">
            <span className="text-gray-300 font-medium">
              {results.length} {t.resultsFound}
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {t.selectAll}
            </button>
            <button
              onClick={deselectAll}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              {t.deselectAll}
            </button>
          </div>

          {selectedPapers.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">
                {selectedPapers.size} {t.selected}
              </span>
              <button
                onClick={exportSelected}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                {t.exportEvidenra}
              </button>
              <button
                onClick={exportBibTeX}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                {t.exportBibtex}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results List - EVIDENRA Style */}
      <div className="space-y-4">
        {results.map((paper) => (
          <div
            key={paper.id}
            className={`bg-gray-800/30 backdrop-blur-xl rounded-2xl border transition-all hover:shadow-xl ${
              selectedPapers.has(paper.id)
                ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            {/* Paper Header */}
            <div className="p-5">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedPapers.has(paper.id)}
                  onChange={() => toggleSelect(paper.id)}
                  className="mt-1.5 w-5 h-5 rounded-lg bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg line-clamp-2 leading-tight">
                        {paper.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-2">
                        {paper.authors} ({paper.year})
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-lg">
                          {paper.publisher}
                        </span>
                        {paper.journal && (
                          <span className="text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-lg">
                            {paper.journal}
                          </span>
                        )}
                        {getAccessBadge(paper)}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedPaper(
                        expandedPaper === paper.id ? null : paper.id
                      )}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      {expandedPaper === paper.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedPaper === paper.id && (
              <div className="px-5 pb-5 pt-0 border-t border-white/5 mt-2">
                {/* Abstract */}
                {paper.abstract && (
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">{t.abstract}</h4>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                      {paper.abstract}
                    </p>
                  </div>
                )}

                {/* DOI */}
                {paper.doi && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-900/50 rounded-xl">
                    <span className="text-sm text-gray-400 font-medium">{t.doi}:</span>
                    <code className="text-sm text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg font-mono">
                      {paper.doi}
                    </code>
                    <button
                      onClick={() => copyToClipboard(paper.doi!, paper.id)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title={t.copyDoi}
                    >
                      {copiedId === paper.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* Access Links */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">{t.access}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Original Publisher Link */}
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all group"
                    >
                      <Globe className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{t.accessOriginal} ({paper.publisher})</span>
                      <ExternalLink className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
                    </a>

                    {/* Open Access via Unpaywall */}
                    {paper.openAccessUrl && (
                      <a
                        href={paper.openAccessUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-all group border border-green-500/20"
                      >
                        <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{t.accessOpenAccess}</span>
                        <ExternalLink className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}

                    {/* Institutional Access */}
                    {paper.institutionalUrl && (
                      <a
                        href={paper.institutionalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all group border border-blue-500/20"
                      >
                        <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{t.accessInstitutional}</span>
                        <ExternalLink className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}

                    {/* Library Genesis */}
                    {paper.libgenUrl && includeLibGen && (
                      <a
                        href={paper.libgenUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-all group border border-amber-500/20"
                      >
                        <Library className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{t.accessLibgen}</span>
                        <AlertTriangle className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State - EVIDENRA Style */}
      {!isLoading && query && results.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400">
            {t.noResults}
          </h3>
          <p className="text-gray-500 mt-2">
            {language === 'de'
              ? 'Versuche andere Suchbegriffe oder prüfe die Schreibweise'
              : 'Try different search terms or check the spelling'
            }
          </p>
        </div>
      )}

      {/* Initial State */}
      {!isLoading && !query && results.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
            <Search className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            {language === 'de'
              ? 'Wissenschaftliche Literatur finden'
              : 'Find Scientific Literature'
            }
          </h3>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">
            {language === 'de'
              ? 'Durchsuche Millionen von Publikationen bei Elsevier, Wiley, Springer und mehr. Finde Open Access Versionen und nutze deinen Uni-Zugang.'
              : 'Search millions of publications from Elsevier, Wiley, Springer and more. Find open access versions and use your institutional access.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default PaidLiteratureSearch
