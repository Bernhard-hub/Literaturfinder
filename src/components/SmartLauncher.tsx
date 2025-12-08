// SmartLauncher.tsx - EVIDENRA Ultimate Design + i18n
import React, { useState } from 'react'
import { Search, ExternalLink, Copy, CheckCircle, Zap, Filter, Star, Sparkles } from 'lucide-react'
import { useI18n } from '../i18n/translations.js'

interface Source {
  id: string
  name: string
  icon: string
  category: 'free' | 'paid' | 'special'
  searchUrl: string
  description: { de: string; en: string }
  tags: string[]
  priority: number
}

const SmartLauncher = () => {
  const { language } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [filterCategory, setFilterCategory] = useState<'all' | 'free' | 'paid' | 'special'>('all')
  const [copied, setCopied] = useState(false)
  const [searchDelay, setSearchDelay] = useState(500)

  const t = {
    de: {
      title: 'Smart Literature Launcher 2.0',
      subtitle: 'Ultraschnell • Intelligent • Keine API-Calls • Zero Latenz',
      searchPlaceholder: "z.B. 'machine learning ethics', 'quantum computing'...",
      smartLaunch: 'Smart Launch',
      selectAllFree: 'Alle Kostenlosen',
      copyBibtex: 'BibTeX kopieren',
      copied: 'Kopiert!',
      tabDelay: 'Tab-Verzögerung',
      fast: 'schnell',
      normal: 'normal',
      slow: 'langsam',
      sourcesAvailable: 'Quellen verfügbar',
      selected: 'ausgewählt',
      auto: 'Auto',
      readyToLaunch: 'Bereit zum Launch!',
      all: 'Alle',
      free: 'Kostenlos',
      premium: 'Premium',
      special: 'Spezial',
      howItWorks: 'So funktioniert\'s',
      ultraFast: 'Ultra-Schnell',
      ultraFastDesc: 'Keine API-Calls, keine Wartezeiten',
      smart: 'Smart',
      smartDesc: 'Öffnet Tabs intelligent mit Verzögerung',
      flexible: 'Flexibel',
      flexibleDesc: 'Wähle deine Lieblingsquellen',
      efficient: 'Effizient',
      efficientDesc: 'Minimaler Ressourcenverbrauch',
      clipboard: 'Clipboard',
      clipboardDesc: 'Suchbegriff automatisch kopiert',
      enterSearchTerm: 'Bitte Suchbegriff eingeben',
      selectSource: 'Bitte wählen Sie mindestens eine Quelle aus'
    },
    en: {
      title: 'Smart Literature Launcher 2.0',
      subtitle: 'Ultra-fast • Intelligent • No API Calls • Zero Latency',
      searchPlaceholder: "e.g. 'machine learning ethics', 'quantum computing'...",
      smartLaunch: 'Smart Launch',
      selectAllFree: 'Select All Free',
      copyBibtex: 'Copy BibTeX',
      copied: 'Copied!',
      tabDelay: 'Tab Delay',
      fast: 'fast',
      normal: 'normal',
      slow: 'slow',
      sourcesAvailable: 'sources available',
      selected: 'selected',
      auto: 'Auto',
      readyToLaunch: 'Ready to launch!',
      all: 'All',
      free: 'Free',
      premium: 'Premium',
      special: 'Special',
      howItWorks: 'How it works',
      ultraFast: 'Ultra-Fast',
      ultraFastDesc: 'No API calls, no waiting',
      smart: 'Smart',
      smartDesc: 'Opens tabs intelligently with delay',
      flexible: 'Flexible',
      flexibleDesc: 'Choose your favorite sources',
      efficient: 'Efficient',
      efficientDesc: 'Minimal resource usage',
      clipboard: 'Clipboard',
      clipboardDesc: 'Search term automatically copied',
      enterSearchTerm: 'Please enter a search term',
      selectSource: 'Please select at least one source'
    }
  }

  const texts = t[language]

  const sources: Source[] = [
    {
      id: 'arxiv',
      name: 'arXiv',
      icon: '📚',
      category: 'free',
      searchUrl: 'https://arxiv.org/search/?query={query}&searchtype=all&order=-announced_date_first',
      description: { de: 'AI, Physik, Mathe - Alle PDFs frei', en: 'AI, Physics, Math - All PDFs free' },
      tags: ['ai', 'physics', 'math'],
      priority: 10
    },
    {
      id: 'scholar',
      name: 'Google Scholar',
      icon: '🎓',
      category: 'free',
      searchUrl: 'https://scholar.google.com/scholar?q={query}&hl=de',
      description: { de: 'Findet oft freie Versionen', en: 'Often finds free versions' },
      tags: ['universal'],
      priority: 10
    },
    {
      id: 'semantic',
      name: 'Semantic Scholar',
      icon: '🤖',
      category: 'free',
      searchUrl: 'https://www.semanticscholar.org/search?q={query}&sort=relevance',
      description: { de: 'KI-gestützte Suche mit PDFs', en: 'AI-powered search with PDFs' },
      tags: ['ai', 'universal'],
      priority: 9
    },
    {
      id: 'pubmed',
      name: 'PubMed',
      icon: '💊',
      category: 'free',
      searchUrl: 'https://pubmed.ncbi.nlm.nih.gov/?term={query}&filter=simsearch2.ffrft&filter=pubt.journalarticle',
      description: { de: '30+ Mio medizinische Artikel', en: '30M+ medical articles' },
      tags: ['medicine', 'biology'],
      priority: 9
    },
    {
      id: 'core',
      name: 'CORE',
      icon: '🌐',
      category: 'free',
      searchUrl: 'https://core.ac.uk/search?q={query}',
      description: { de: '200+ Mio Open Access Papers', en: '200M+ Open Access papers' },
      tags: ['universal'],
      priority: 8
    },
    {
      id: 'base',
      name: 'BASE',
      icon: '🔎',
      category: 'free',
      searchUrl: 'https://www.base-search.net/Search/Results?lookfor={query}&type=all&refid=dccresde',
      description: { de: '300+ Mio Dokumente', en: '300M+ documents' },
      tags: ['universal'],
      priority: 8
    },
    {
      id: 'doaj',
      name: 'DOAJ',
      icon: '📖',
      category: 'free',
      searchUrl: 'https://doaj.org/search/articles?ref=homepage-box&source=%7B%22query%22%3A%7B%22query_string%22%3A%7B%22query%22%3A%22{query}%22%7D%7D%7D',
      description: { de: '18.000+ OA Journals', en: '18,000+ OA Journals' },
      tags: ['universal'],
      priority: 7
    },
    {
      id: 'pmc',
      name: 'PMC',
      icon: '🏥',
      category: 'free',
      searchUrl: 'https://www.ncbi.nlm.nih.gov/pmc/?term={query}',
      description: { de: 'Biomedizin Volltext', en: 'Biomedical full text' },
      tags: ['medicine', 'biology'],
      priority: 7
    },
    {
      id: 'ssrn',
      name: 'SSRN',
      icon: '📊',
      category: 'free',
      searchUrl: 'https://papers.ssrn.com/sol3/results.cfm?RequestTimeout=50000000&txtWords={query}',
      description: { de: 'Sozialwissenschaften', en: 'Social Sciences' },
      tags: ['social', 'economics'],
      priority: 7
    },
    {
      id: 'researchgate',
      name: 'ResearchGate',
      icon: '👥',
      category: 'special',
      searchUrl: 'https://www.researchgate.net/search?q={query}',
      description: { de: 'Direkt von Autoren', en: 'Direct from authors' },
      tags: ['universal'],
      priority: 6
    },
    {
      id: 'sciencedirect',
      name: 'ScienceDirect',
      icon: '🔬',
      category: 'paid',
      searchUrl: 'https://www.sciencedirect.com/search?qs={query}',
      description: { de: 'Premium - Größte Datenbank', en: 'Premium - Largest database' },
      tags: ['universal'],
      priority: 5
    },
    {
      id: 'springer',
      name: 'SpringerLink',
      icon: '📚',
      category: 'paid',
      searchUrl: 'https://link.springer.com/search?query={query}',
      description: { de: 'Premium - Bücher & Artikel', en: 'Premium - Books & Articles' },
      tags: ['universal'],
      priority: 5
    },
    {
      id: 'ieee',
      name: 'IEEE Xplore',
      icon: '⚡',
      category: 'paid',
      searchUrl: 'https://ieeexplore.ieee.org/search/searchresult.jsp?queryText={query}',
      description: { de: 'Engineering & Tech', en: 'Engineering & Tech' },
      tags: ['engineering', 'cs'],
      priority: 5
    }
  ]

  const filteredSources = sources
    .filter(s => filterCategory === 'all' || s.category === filterCategory)
    .sort((a, b) => b.priority - a.priority)

  const toggleSource = (id: string) => {
    const newSelected = new Set(selectedSources)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedSources(newSelected)
  }

  const selectAllFree = () => {
    const freeIds = sources.filter(s => s.category === 'free').map(s => s.id)
    setSelectedSources(new Set(freeIds))
  }

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) {
      alert(texts.enterSearchTerm)
      return
    }

    const sourcesToSearch = selectedSources.size > 0
      ? sources.filter(s => selectedSources.has(s.id))
      : sources.filter(s => s.category === 'free' && s.priority >= 8)

    if (sourcesToSearch.length === 0) {
      alert(texts.selectSource)
      return
    }

    navigator.clipboard.writeText(searchQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    for (let i = 0; i < sourcesToSearch.length; i++) {
      const source = sourcesToSearch[i]
      const url = source.searchUrl.replace('{query}', encodeURIComponent(searchQuery))
      setTimeout(() => {
        window.open(url, '_blank')
      }, i * searchDelay)
    }
  }

  const copyBibTeXSearch = () => {
    const bibtexString = `@search{
  query = {${searchQuery}},
  date = {${new Date().toISOString().split('T')[0]}},
  sources = {${Array.from(selectedSources).join(', ')}}
}`
    navigator.clipboard.writeText(bibtexString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{texts.title}</h1>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              {texts.subtitle}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder={texts.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 text-lg transition-all"
              />
            </div>
            <button
              onClick={handleSmartSearch}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <Zap className="h-5 w-5" />
              {texts.smartLaunch}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={selectAllFree}
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 text-sm border border-green-500/30 flex items-center gap-2 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              {texts.selectAllFree}
            </button>
            <button
              onClick={copyBibTeXSearch}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 text-sm border border-blue-500/30 flex items-center gap-2 transition-all"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? texts.copied : texts.copyBibtex}
            </button>
            <div className="flex items-center gap-2 ml-auto bg-gray-800/50 rounded-xl px-3 py-2">
              <span className="text-sm text-gray-400">{texts.tabDelay}:</span>
              <select
                value={searchDelay}
                onChange={(e) => setSearchDelay(Number(e.target.value))}
                className="px-2 py-1 bg-gray-900/80 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="300">300ms ({texts.fast})</option>
                <option value="500">500ms ({texts.normal})</option>
                <option value="1000">1s ({texts.slow})</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              📊 {sources.length} {texts.sourcesAvailable}
            </span>
            <span className="flex items-center gap-1">
              ✓ {selectedSources.size || texts.auto} {texts.selected}
            </span>
            {searchQuery && (
              <span className="text-purple-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                {texts.readyToLaunch}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex gap-2">
            {(['all', 'free', 'paid', 'special'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-xl transition-all font-medium ${
                  filterCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {cat === 'all' && `🌍 ${texts.all}`}
                {cat === 'free' && `🆓 ${texts.free}`}
                {cat === 'paid' && `💰 ${texts.premium}`}
                {cat === 'special' && `⭐ ${texts.special}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map(source => (
          <div
            key={source.id}
            onClick={() => toggleSource(source.id)}
            className={`bg-gray-800/30 backdrop-blur-xl rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] border ${
              selectedSources.has(source.id)
                ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                : 'border-white/5 hover:border-white/10 hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{source.icon}</span>
                <div>
                  <h3 className="font-semibold text-white text-lg">{source.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: Math.min(5, Math.ceil(source.priority / 2)) }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              {selectedSources.has(source.id) && (
                <CheckCircle className="h-6 w-6 text-purple-400" />
              )}
            </div>
            <p className="text-sm text-gray-400 mb-3">{source.description[language]}</p>
            <div className="flex gap-2 flex-wrap">
              {source.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 bg-gray-700/50 text-gray-300 rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-lg">
          <ExternalLink className="h-5 w-5 text-purple-400" />
          💡 {texts.howItWorks}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <div>
              <strong className="text-white">{texts.ultraFast}:</strong>
              <p className="text-gray-400">{texts.ultraFastDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <div>
              <strong className="text-white">{texts.smart}:</strong>
              <p className="text-gray-400">{texts.smartDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <div>
              <strong className="text-white">{texts.flexible}:</strong>
              <p className="text-gray-400">{texts.flexibleDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <div>
              <strong className="text-white">{texts.efficient}:</strong>
              <p className="text-gray-400">{texts.efficientDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <div>
              <strong className="text-white">{texts.clipboard}:</strong>
              <p className="text-gray-400">{texts.clipboardDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartLauncher
