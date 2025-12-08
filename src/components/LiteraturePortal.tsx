import React, { useState } from 'react'
import { Search, ExternalLink, BookOpen, Globe, ShoppingCart, Lock, Unlock, Star, AlertCircle } from 'lucide-react'

interface Platform {
  name: string
  url: string
  searchUrl?: string
  description: string
  icon: string
  subjects: string[]
  tip?: string
  priceRange?: string
}

const LiteraturePortal = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert('Bitte geben Sie einen Suchbegriff ein')
      return
    }
    searchAllPlatforms(searchTerm)
  }

  const searchAllPlatforms = (query: string) => {
    const encodedQuery = encodeURIComponent(query)

    // Kostenlose Plattformen
    window.open(`https://arxiv.org/search/?query=${encodedQuery}&searchtype=all`, '_blank')
    window.open(`https://doaj.org/search/articles?source=%7B%22query%22%3A%7B%22query_string%22%3A%7B%22query%22%3A%22${encodedQuery}%22%7D%7D%7D`, '_blank')
    window.open(`https://www.ncbi.nlm.nih.gov/pmc/?term=${encodedQuery}`, '_blank')
    window.open(`https://eric.ed.gov/?q=${encodedQuery}`, '_blank')

    // Kostenpflichtige Plattformen
    window.open(`https://www.sciencedirect.com/search?qs=${encodedQuery}`, '_blank')
    window.open(`https://link.springer.com/search?query=${encodedQuery}`, '_blank')
  }

  const freeResources: Platform[] = [
    {
      name: "arXiv",
      url: "https://arxiv.org",
      searchUrl: "https://arxiv.org/search/?query={query}&searchtype=all",
      description: "Physik, Mathematik, Informatik, Biologie - Preprints",
      icon: "📚",
      subjects: ["AI/ML", "Physik", "Mathematik", "Biologie"],
      tip: "Alle PDFs direkt downloadbar"
    },
    {
      name: "DOAJ",
      url: "https://doaj.org",
      searchUrl: "https://doaj.org/search/articles?source=%7B%22query%22%3A%7B%22query_string%22%3A%7B%22query%22%3A%22{query}%22%7D%7D%7D",
      description: "18.000+ peer-reviewed Open Access Journals",
      icon: "🔍",
      subjects: ["Alle Bereiche"],
      tip: "Direkter Volltext-Zugang"
    },
    {
      name: "PMC - PubMed Central",
      url: "https://www.ncbi.nlm.nih.gov/pmc/",
      searchUrl: "https://www.ncbi.nlm.nih.gov/pmc/?term={query}",
      description: "NIH Repository für Biomedizin",
      icon: "🏥",
      subjects: ["Medizin", "Life Sciences"],
      tip: "PDF + HTML Volltext"
    },
    {
      name: "ERIC",
      url: "https://eric.ed.gov",
      searchUrl: "https://eric.ed.gov/?q={query}",
      description: "Weltgrößte Bildungsforschung-Datenbank",
      icon: "🎓",
      subjects: ["Bildung", "Pädagogik"],
      tip: "Viele kostenlose PDF-Downloads"
    },
    {
      name: "PLOS ONE",
      url: "https://journals.plos.org/plosone/",
      searchUrl: "https://journals.plos.org/plosone/search?q={query}",
      description: "Multidisziplinäres Open Access Journal",
      icon: "🧬",
      subjects: ["Naturwissenschaften", "Medizin"],
      tip: "Alle Artikel frei zugänglich"
    },
    {
      name: "Zenodo",
      url: "https://zenodo.org",
      searchUrl: "https://zenodo.org/search?q={query}",
      description: "CERN Repository - alle Wissenschaftsbereiche",
      icon: "🗄️",
      subjects: ["Alle Bereiche", "Daten", "Software"],
      tip: "Forschungsdaten + Publikationen"
    },
    {
      name: "bioRxiv",
      url: "https://www.biorxiv.org",
      searchUrl: "https://www.biorxiv.org/search/{query}",
      description: "Biowissenschaften Preprints",
      icon: "🧬",
      subjects: ["Biologie", "Biochemie"],
      tip: "Neueste Forschung vor Peer-Review"
    },
    {
      name: "Semantic Scholar",
      url: "https://www.semanticscholar.org",
      searchUrl: "https://www.semanticscholar.org/search?q={query}",
      description: "KI-gestützte Suchmaschine",
      icon: "🤖",
      subjects: ["Alle Bereiche"],
      tip: "Intelligente Suche + kostenlose PDFs"
    },
    {
      name: "PubMed",
      url: "https://pubmed.ncbi.nlm.nih.gov",
      searchUrl: "https://pubmed.ncbi.nlm.nih.gov/?term={query}",
      description: "Medizinische Literatur-Datenbank",
      icon: "💊",
      subjects: ["Medizin", "Biomedizin", "Life Sciences"],
      tip: "30+ Millionen Artikel, viele mit Volltext"
    },
    {
      name: "CORE",
      url: "https://core.ac.uk",
      searchUrl: "https://core.ac.uk/search?q={query}",
      description: "200+ Millionen Open Access Artikel",
      icon: "🌐",
      subjects: ["Alle Bereiche"],
      tip: "Weltweit größter Aggregator von OA-Papern"
    },
    {
      name: "BASE",
      url: "https://www.base-search.net",
      searchUrl: "https://www.base-search.net/Search/Results?lookfor={query}&type=all",
      description: "Bielefeld Academic Search Engine",
      icon: "🔎",
      subjects: ["Alle Bereiche"],
      tip: "300+ Millionen Dokumente aus 10.000+ Quellen"
    },
    {
      name: "SSRN",
      url: "https://www.ssrn.com",
      searchUrl: "https://www.ssrn.com/index.cfm/en/search/?q={query}",
      description: "Social Science Research Network",
      icon: "📊",
      subjects: ["Sozialwissenschaften", "Wirtschaft", "Jura"],
      tip: "Kostenlose Preprints und Working Papers"
    },
    {
      name: "medRxiv",
      url: "https://www.medrxiv.org",
      searchUrl: "https://www.medrxiv.org/search/{query}",
      description: "Medizinische Preprints",
      icon: "🩺",
      subjects: ["Medizin", "Klinische Forschung"],
      tip: "Neueste medizinische Forschung"
    },
    {
      name: "OSF Preprints",
      url: "https://osf.io/preprints",
      searchUrl: "https://osf.io/preprints/discover?q={query}",
      description: "Open Science Framework Preprints",
      icon: "🔬",
      subjects: ["Alle Bereiche"],
      tip: "Multidisziplinäre Preprint-Plattform"
    },
    {
      name: "DOAB",
      url: "https://www.doabooks.org",
      searchUrl: "https://www.doabooks.org/doab?func=search&query={query}",
      description: "Directory of Open Access Books",
      icon: "📖",
      subjects: ["Geisteswissenschaften", "Sozialwissenschaften"],
      tip: "60.000+ Open Access Bücher"
    },
    {
      name: "SciELO",
      url: "https://scielo.org",
      searchUrl: "https://search.scielo.org/?q={query}",
      description: "Lateinamerikanische wissenschaftliche Literatur",
      icon: "🌎",
      subjects: ["Alle Bereiche", "Lateinamerika"],
      tip: "1.000+ Journals aus Lateinamerika"
    },
    {
      name: "Europe PMC",
      url: "https://europepmc.org",
      searchUrl: "https://europepmc.org/search?query={query}",
      description: "Europäisches Biomedizin-Repository",
      icon: "🇪🇺",
      subjects: ["Medizin", "Life Sciences"],
      tip: "40+ Millionen Publikationen"
    },
    {
      name: "Internet Archive Scholar",
      url: "https://scholar.archive.org",
      searchUrl: "https://scholar.archive.org/search?q={query}",
      description: "Digitale Bibliothek mit 25+ Mio. Artikeln",
      icon: "📚",
      subjects: ["Alle Bereiche", "Archiv"],
      tip: "Historische und aktuelle Forschung"
    }
  ]

  const paidPlatforms: Platform[] = [
    {
      name: "ScienceDirect (Elsevier)",
      url: "https://www.sciencedirect.com",
      searchUrl: "https://www.sciencedirect.com/search?qs={query}",
      description: "Größte wissenschaftliche Datenbank",
      icon: "🔬",
      priceRange: "$30-50 pro Artikel",
      subjects: ["Alle Naturwissenschaften"]
    },
    {
      name: "SpringerLink",
      url: "https://link.springer.com",
      searchUrl: "https://link.springer.com/search?query={query}",
      description: "Wissenschaftliche Bücher und Artikel",
      icon: "📖",
      priceRange: "$25-40 pro Artikel",
      subjects: ["Alle Bereiche"]
    },
    {
      name: "Wiley Online Library",
      url: "https://onlinelibrary.wiley.com",
      searchUrl: "https://onlinelibrary.wiley.com/action/doSearch?AllField={query}",
      description: "Peer-reviewed Journals",
      icon: "📚",
      priceRange: "$20-45 pro Artikel",
      subjects: ["Naturwissenschaften", "Medizin"]
    },
    {
      name: "Nature Portfolio",
      url: "https://www.nature.com",
      searchUrl: "https://www.nature.com/search?q={query}",
      description: "Premium wissenschaftliche Publikationen",
      icon: "🌟",
      priceRange: "$30-60 pro Artikel",
      subjects: ["High-Impact Research"]
    },
    {
      name: "JSTOR",
      url: "https://www.jstor.org",
      searchUrl: "https://www.jstor.org/action/doBasicSearch?Query={query}",
      description: "Geistes- und Sozialwissenschaften",
      icon: "🏛️",
      priceRange: "$15-35 pro Artikel",
      subjects: ["Geisteswissenschaften", "Sozialwissenschaften"]
    }
  ]

  const specializedSources: Platform[] = [
    {
      name: "Google Scholar",
      url: "https://scholar.google.com",
      searchUrl: "https://scholar.google.com/scholar?q={query}",
      description: "Kostenlos - findet oft frei verfügbare Versionen",
      icon: "🔍",
      subjects: [],
      tip: "Klicken Sie auf [PDF] Links für kostenlose Versionen"
    },
    {
      name: "Sci-Hub (Grauzone)",
      url: "https://sci-hub.se",
      description: "Umstrittener Zugang zu kostenpflichtigen Artikeln",
      icon: "⚠️",
      subjects: [],
      tip: "Rechtlich umstritten - nur zur Information"
    },
    {
      name: "ResearchGate",
      url: "https://www.researchgate.net",
      searchUrl: "https://www.researchgate.net/search?q={query}",
      description: "Forscher teilen oft ihre Arbeiten kostenlos",
      icon: "👥",
      subjects: [],
      tip: "Direkt von Autoren anfordern"
    }
  ]

  const searchOnPlatform = (platform: Platform) => {
    if (!searchTerm.trim()) {
      alert('Bitte geben Sie zuerst einen Suchbegriff ein')
      return
    }
    if (!platform.searchUrl) return
    const searchUrl = platform.searchUrl.replace('{query}', encodeURIComponent(searchTerm))
    window.open(searchUrl, '_blank')
  }

  const openPlatform = (platform: Platform) => {
    window.open(platform.url, '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="glassmorphism p-6">
        <div className="flex items-center mb-6">
          <BookOpen className="h-8 w-8 text-blue-300 mr-3" />
          <h1 className="text-3xl font-bold text-white">Wissenschaftliche Literatur Portal</h1>
        </div>

        <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-300 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-200">Direkter Zugang zu allen wichtigen Plattformen</h3>
              <p className="text-sm text-blue-100 mt-1">
                Dieses Portal öffnet echte Suchlinks zu allen wichtigen wissenschaftlichen Plattformen.
                Kostenlose Artikel sind sofort downloadbar, kostenpflichtige können gekauft werden.
              </p>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-5 w-5" />
              <input
                type="text"
                placeholder="Suche nach Thema... (z.B. 'machine learning', 'quantum physics', 'mediendidaktik')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-300 text-white placeholder-gray-300"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Search className="h-5 w-5" />
              Alle durchsuchen
            </button>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-3">
            <p className="text-sm text-yellow-100">
              <strong>Tipp:</strong> Der "Alle durchsuchen" Button öffnet 6 Plattformen gleichzeitig in neuen Tabs.
              Oder nutzen Sie einzelne Plattformen unten für gezielte Suche.
            </p>
          </div>
        </div>
      </div>

      {/* Free Resources */}
      <div className="glassmorphism p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Unlock className="h-6 w-6 text-green-400" />
          Kostenlose Open Access Plattformen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freeResources.map((resource, index) => (
            <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{resource.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{resource.name}</h3>
                    <p className="text-sm text-gray-300">{resource.description}</p>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {resource.subjects.map((subject, idx) => (
                    <span key={idx} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-400/30">
                      {subject}
                    </span>
                  ))}
                </div>
                {resource.tip && (
                  <p className="text-xs text-green-400 font-medium">{resource.tip}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openPlatform(resource)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-gray-300 rounded hover:bg-white/20 transition-colors text-sm border border-white/20"
                >
                  <Globe className="h-4 w-4" />
                  Öffnen
                </button>

                {searchTerm && (
                  <button
                    onClick={() => searchOnPlatform(resource)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition-colors text-sm border border-green-400/30"
                  >
                    <Search className="h-4 w-4" />
                    Suchen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Platforms */}
      <div className="glassmorphism p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-blue-400" />
          Kostenpflichtige Premium-Plattformen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paidPlatforms.map((platform, index) => (
            <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{platform.name}</h3>
                    <p className="text-sm text-gray-300">{platform.description}</p>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                {platform.priceRange && (
                  <p className="text-sm text-blue-400 font-medium mb-1">{platform.priceRange}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {platform.subjects.map((subject, idx) => (
                    <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-400/30">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openPlatform(platform)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-gray-300 rounded hover:bg-white/20 transition-colors text-sm border border-white/20"
                >
                  <Globe className="h-4 w-4" />
                  Öffnen
                </button>

                {searchTerm && (
                  <button
                    onClick={() => searchOnPlatform(platform)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors text-sm border border-blue-400/30"
                  >
                    <Search className="h-4 w-4" />
                    Suchen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Sources */}
      <div className="glassmorphism p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="h-6 w-6 text-orange-400" />
          Alternative Quellen & Tipps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {specializedSources.map((source, index) => (
            <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{source.icon}</span>
                <h3 className="font-semibold text-white">{source.name}</h3>
              </div>
              <p className="text-sm text-gray-300 mb-2">{source.description}</p>
              {source.tip && (
                <p className="text-xs text-orange-400 mb-3">{source.tip}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => openPlatform(source)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/20 text-orange-300 rounded hover:bg-orange-500/30 transition-colors text-sm border border-orange-400/30"
                >
                  <ExternalLink className="h-4 w-4" />
                  Besuchen
                </button>
                {source.searchUrl && searchTerm && (
                  <button
                    onClick={() => searchOnPlatform(source)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600/20 text-orange-200 rounded hover:bg-orange-600/30 transition-colors text-sm border border-orange-400/30"
                  >
                    <Search className="h-4 w-4" />
                    Suchen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LiteraturePortal