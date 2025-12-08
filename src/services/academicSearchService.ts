// Academic Search Service - Integration für wissenschaftliche Literatur
// Unterstützt: arXiv, CrossRef, und indirekte Google Scholar Suche

import { Book } from './bookService'

interface ArXivEntry {
  id: string
  title: string
  summary: string
  authors: Array<{ name: string }>
  published: string
  updated: string
  links: Array<{ href: string; rel: string; type?: string }>
  categories: Array<{ term: string }>
  primary_category: { term: string }
}

interface ArXivResponse {
  feed: {
    entry?: ArXivEntry | ArXivEntry[]
    'opensearch:totalResults': { _text: string }
  }
}

interface CrossRefWork {
  DOI: string
  title: string[]
  author?: Array<{ given?: string; family: string }>
  'published-print'?: { 'date-parts': number[][] }
  'published-online'?: { 'date-parts': number[][] }
  publisher: string
  abstract?: string
  subject?: string[]
  type: string
  URL?: string
  page?: string
  volume?: string
  issue?: string
  'container-title'?: string[]
}

interface CrossRefResponse {
  status: string
  'message-type': string
  'message-version': string
  message: {
    items: CrossRefWork[]
    'total-results': number
  }
}

export class AcademicSearchService {
  private readonly arxivBaseUrl = 'https://export.arxiv.org/api/query'
  private readonly crossrefBaseUrl = 'https://api.crossref.org/works'

  // arXiv API Search (Open Source wissenschaftliche Arbeiten)
  async searchArXiv(query: string, maxResults = 10): Promise<Book[]> {
    try {
      const params = new URLSearchParams({
        search_query: `all:${query}`,
        start: '0',
        max_results: maxResults.toString(),
        sortBy: 'relevance',
        sortOrder: 'descending'
      })

      const response = await fetch(`${this.arxivBaseUrl}?${params}`)
      const text = await response.text()

      // Parse XML response
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')

      const entries = xmlDoc.querySelectorAll('entry')
      const books: Book[] = []

      entries.forEach((entry, index) => {
        const id = entry.querySelector('id')?.textContent || ''
        const title = entry.querySelector('title')?.textContent?.trim() || 'Unbekannter Titel'
        const summary = entry.querySelector('summary')?.textContent?.trim() || ''
        const published = entry.querySelector('published')?.textContent || ''
        const updated = entry.querySelector('updated')?.textContent || ''

        // Authors
        const authorNodes = entry.querySelectorAll('author name')
        const authors = Array.from(authorNodes).map(node => node.textContent || '').join(', ') || 'Unbekannter Autor'

        // Categories
        const categoryNodes = entry.querySelectorAll('category')
        const categories = Array.from(categoryNodes).map(node => {
          const term = node.getAttribute('term') || ''
          return term.replace(/^[a-z-]+\./, '') // Remove category prefix
        }).filter(Boolean)

        // Links
        const pdfLink = entry.querySelector('link[type="application/pdf"]')?.getAttribute('href')
        const abstractLink = entry.querySelector('link[type="text/html"]')?.getAttribute('href')

        const year = published ? new Date(published).getFullYear() : 0

        books.push({
          id: `arxiv-${id.split('/').pop()}`,
          title,
          author: authors,
          year,
          description: summary.length > 300 ? `${summary.substring(0, 300)}...` : summary,
          image: ['📄', '🔬', '📊', '🧮', '📐', '⚗️'][index % 6],
          categories: categories.length > 0 ? categories : ['Wissenschaft'],
          language: 'en',
          publisher: 'arXiv',
          openLibraryKey: abstractLink,
          coverUrl: pdfLink, // Use PDF link as cover URL for now
          hasFulltext: !!pdfLink
        })
      })

      return books
    } catch (error) {
      console.error('Fehler bei arXiv API:', error)
      return []
    }
  }

  // CrossRef API Search (Akademische Publikationen)
  async searchCrossRef(query: string, maxResults = 10): Promise<Book[]> {
    try {
      const params = new URLSearchParams({
        query: query,
        rows: maxResults.toString(),
        sort: 'relevance',
        order: 'desc'
      })

      const response = await fetch(`${this.crossrefBaseUrl}?${params}`)
      const data: CrossRefResponse = await response.json()

      if (!data.message || !data.message.items) {
        return []
      }

      return data.message.items.map((work, index) => {
        const title = work.title?.[0] || 'Unbekannter Titel'
        const authors = work.author?.map(a =>
          `${a.given || ''} ${a.family}`.trim()
        ).join(', ') || 'Unbekannter Autor'

        const publishedDate = work['published-print'] || work['published-online']
        const year = publishedDate?.['date-parts']?.[0]?.[0] || 0

        const description = work.abstract ||
          `${work.type} veröffentlicht in ${work['container-title']?.[0] || work.publisher}`

        const categories = [
          work.type,
          ...(work.subject || []),
          ...(work['container-title'] || [])
        ].filter(Boolean).slice(0, 3)

        return {
          id: `crossref-${work.DOI?.replace('/', '-')}`,
          title,
          author: authors,
          year,
          isbn: work.DOI,
          description,
          image: ['📚', '📖', '📝', '🎓', '🔬', '📊'][index % 6],
          categories,
          language: 'en',
          publisher: work.publisher,
          openLibraryKey: work.URL,
          pageCount: work.page ? parseInt(work.page) : undefined
        }
      })
    } catch (error) {
      console.error('Fehler bei CrossRef API:', error)
      return []
    }
  }

  // Google Scholar indirekte Suche (über SerpAPI oder ähnliche Services)
  // Hinweis: Direkte Google Scholar API ist nicht öffentlich verfügbar
  async searchGoogleScholar(query: string, maxResults = 10): Promise<Book[]> {
    try {
      // Alternative: Semantic Scholar API (Open Source Alternative zu Google Scholar)
      const response = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=title,authors,year,abstract,venue,citationCount,url,openAccessPdf`
      )

      const data = await response.json()

      if (!data.data) {
        return []
      }

      return data.data.map((paper: any, index: number) => {
        const authors = paper.authors?.map((a: any) => a.name).join(', ') || 'Unbekannter Autor'
        const title = paper.title || 'Unbekannter Titel'
        const year = paper.year || 0
        const description = paper.abstract || `Veröffentlicht in ${paper.venue || 'Unbekanntem Journal'}`

        return {
          id: `semantic-scholar-${paper.paperId}`,
          title,
          author: authors,
          year,
          description: description.length > 300 ? `${description.substring(0, 300)}...` : description,
          image: ['📄', '🎓', '🔬', '📊', '🧪', '📝'][index % 6],
          categories: ['Wissenschaft', paper.venue].filter(Boolean),
          language: 'en',
          publisher: paper.venue || 'Semantic Scholar',
          openLibraryKey: paper.url,
          hasFulltext: !!paper.openAccessPdf,
          ratings: paper.citationCount ? {
            count: paper.citationCount,
            average: Math.min(5, Math.log10(paper.citationCount + 1) * 2) // Logarithmic rating based on citations
          } : undefined
        }
      })
    } catch (error) {
      console.error('Fehler bei Semantic Scholar API:', error)
      return []
    }
  }

  // Kombinierte akademische Suche
  async searchAcademic(query: string): Promise<Book[]> {
    try {
      const [arxivResults, crossrefResults, scholarResults] = await Promise.all([
        this.searchArXiv(query, 5),
        this.searchCrossRef(query, 5),
        this.searchGoogleScholar(query, 5)
      ])

      // Kombiniere und entferne Duplikate basierend auf Titel
      const allResults = [...arxivResults, ...crossrefResults, ...scholarResults]
      const uniqueResults = allResults.filter((book, index, self) =>
        index === self.findIndex(b =>
          b.title.toLowerCase().trim() === book.title.toLowerCase().trim()
        )
      )

      return uniqueResults.slice(0, 15)
    } catch (error) {
      console.error('Fehler bei akademischer Suche:', error)
      return []
    }
  }
}

// Singleton instance
export const academicSearchService = new AcademicSearchService()