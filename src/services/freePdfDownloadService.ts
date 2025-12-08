// Free PDF Download Service - Nur kostenlose, frei verfügbare PDFs ohne API Keys
// Quellen: arXiv, Semantic Scholar, PubMed Central, DOAJ, bioRxiv

export interface DownloadablePaper {
  id: string
  title: string
  authors: string
  year: number
  pdfUrl: string
  source: 'arxiv' | 'semantic-scholar' | 'pubmed' | 'doaj' | 'biorxiv'
  doi?: string
  abstract?: string
  categories?: string[]
}

export interface DownloadProgress {
  paperId: string
  title: string
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  progress: number // 0-100
  error?: string
}

export class FreePdfDownloadService {
  // Hilfsfunktion: Stelle sicher, dass URLs absolut sind
  private normalizeUrl(url: string, baseUrl?: string): string {
    // Wenn URL bereits absolut ist (beginnt mit http:// oder https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // Wenn URL relativ ist und baseUrl gegeben ist
    if (baseUrl) {
      // Entferne trailing slash von baseUrl
      const base = baseUrl.replace(/\/$/, '')
      // Stelle sicher, dass relative URL mit / beginnt
      const relative = url.startsWith('/') ? url : '/' + url
      return base + relative
    }

    // Default: Gebe URL zurück (sollte nicht passieren, aber als Fallback)
    console.warn(`Konnte URL nicht normalisieren: ${url}`)
    return url
  }

  // arXiv: Alle PDFs sind frei verfügbar
  async searchArxivPdfs(query: string, maxResults = 20): Promise<DownloadablePaper[]> {
    try {
      const params = new URLSearchParams({
        search_query: `all:${query}`,
        start: '0',
        max_results: maxResults.toString(),
        sortBy: 'relevance',
        sortOrder: 'descending'
      })

      const response = await fetch(`https://export.arxiv.org/api/query?${params}`)
      const text = await response.text()

      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      const entries = xmlDoc.querySelectorAll('entry')

      const papers: DownloadablePaper[] = []

      entries.forEach((entry) => {
        const id = entry.querySelector('id')?.textContent || ''
        const arxivId = id.split('/').pop() || ''
        const title = entry.querySelector('title')?.textContent?.trim() || ''
        const published = entry.querySelector('published')?.textContent || ''

        // Authors
        const authorNodes = entry.querySelectorAll('author name')
        const authors = Array.from(authorNodes).map(node => node.textContent || '').join(', ')

        // PDF Link - arXiv stellt immer PDFs bereit!
        const pdfLink = entry.querySelector('link[type="application/pdf"]')?.getAttribute('href')

        // Abstract
        const abstract = entry.querySelector('summary')?.textContent?.trim()

        // Categories
        const categoryNodes = entry.querySelectorAll('category')
        const categories = Array.from(categoryNodes).map(node =>
          node.getAttribute('term') || ''
        ).filter(Boolean)

        if (pdfLink) {
          papers.push({
            id: `arxiv-${arxivId}`,
            title,
            authors: authors || 'Unknown Authors',
            year: published ? new Date(published).getFullYear() : 0,
            pdfUrl: pdfLink,
            source: 'arxiv',
            abstract,
            categories
          })
        }
      })

      return papers
    } catch (error) {
      console.error('arXiv PDF search error:', error)
      return []
    }
  }

  // Semantic Scholar: Nur Papers mit openAccessPdf
  async searchSemanticScholarPdfs(query: string, maxResults = 20): Promise<DownloadablePaper[]> {
    try {
      const response = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=title,authors,year,abstract,openAccessPdf,externalIds`
      )

      const data = await response.json()

      if (!data.data) {
        return []
      }

      return data.data
        .filter((paper: any) => paper.openAccessPdf?.url) // Nur Papers mit freiem PDF!
        .map((paper: any) => ({
          id: `semantic-${paper.paperId}`,
          title: paper.title || 'Unknown Title',
          authors: paper.authors?.map((a: any) => a.name).join(', ') || 'Unknown Authors',
          year: paper.year || 0,
          pdfUrl: paper.openAccessPdf.url,
          source: 'semantic-scholar' as const,
          doi: paper.externalIds?.DOI,
          abstract: paper.abstract
        }))
    } catch (error) {
      console.error('Semantic Scholar PDF search error:', error)
      return []
    }
  }

  // PubMed Central: Freie medizinische Papers
  async searchPubMedPdfs(query: string, maxResults = 20): Promise<DownloadablePaper[]> {
    try {
      // Schritt 1: Suche nach PMC IDs (nur Open Access)
      const searchResponse = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(query)}+AND+open+access[filter]&retmax=${maxResults}&retmode=json`
      )

      const searchData = await searchResponse.json()
      const pmcIds = searchData.esearchresult?.idlist || []

      if (pmcIds.length === 0) {
        return []
      }

      // Schritt 2: Hole Details
      const detailsResponse = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&id=${pmcIds.join(',')}&retmode=json`
      )

      const detailsData = await detailsResponse.json()

      const papers: DownloadablePaper[] = []

      for (const pmcId of pmcIds) {
        const article = detailsData.result?.[pmcId]
        if (!article) continue

        // PMC PDF URL Format - stelle sicher, dass URL absolut ist
        const pdfUrl = this.normalizeUrl(
          `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcId}/pdf/`,
          'https://www.ncbi.nlm.nih.gov'
        )

        papers.push({
          id: `pubmed-${pmcId}`,
          title: article.title || 'Unknown Title',
          authors: article.authors?.map((a: any) => a.name).join(', ') || 'Unknown Authors',
          year: parseInt(article.pubdate?.split(' ')[0]) || 0,
          pdfUrl,
          source: 'pubmed',
          doi: article.elocationid
        })
      }

      return papers
    } catch (error) {
      console.error('PubMed PDF search error:', error)
      return []
    }
  }

  // DOAJ: Open Access Journals mit PDF Links
  async searchDoajPdfs(query: string, maxResults = 20): Promise<DownloadablePaper[]> {
    try {
      const response = await fetch(
        `https://doaj.org/api/v2/search/articles/${encodeURIComponent(query)}?pageSize=${maxResults}`
      )

      const data = await response.json()
      const articles = data.results || []

      return articles
        .filter((article: any) => {
          // Nur Articles mit PDF fulltext link
          const pdfLink = article.bibjson?.link?.find((link: any) =>
            link.type === 'fulltext' && link.content_type === 'PDF'
          )
          return !!pdfLink
        })
        .map((article: any) => {
          const bibjson = article.bibjson
          const pdfLink = bibjson.link.find((link: any) =>
            link.type === 'fulltext' && link.content_type === 'PDF'
          )

          return {
            id: `doaj-${article.id}`,
            title: bibjson.title || 'Unknown Title',
            authors: bibjson.author?.map((a: any) => a.name).join(', ') || 'Unknown Authors',
            year: parseInt(bibjson.year) || 0,
            pdfUrl: pdfLink.url,
            source: 'doaj' as const,
            doi: bibjson.identifier?.find((id: any) => id.type === 'doi')?.id,
            abstract: bibjson.abstract
          }
        })
    } catch (error) {
      console.error('DOAJ PDF search error:', error)
      return []
    }
  }

  // bioRxiv: Biologie Preprints (alle frei verfügbar)
  async searchBioRxivPdfs(query: string, maxResults = 20): Promise<DownloadablePaper[]> {
    try {
      // bioRxiv API - https://api.biorxiv.org/details/biorxiv/
      // Verwende die Collection API
      const response = await fetch(
        `https://api.biorxiv.org/details/biorxiv/2020-01-01/2025-12-31/0/json`
      )

      const data = await response.json()

      if (!data.collection) {
        return []
      }

      // Filter nach Query
      const filtered = data.collection
        .filter((paper: any) =>
          paper.title?.toLowerCase().includes(query.toLowerCase()) ||
          paper.abstract?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, maxResults)

      return filtered.map((paper: any) => ({
        id: `biorxiv-${paper.doi}`,
        title: paper.title || 'Unknown Title',
        authors: paper.authors || 'Unknown Authors',
        year: parseInt(paper.date?.split('-')[0]) || 0,
        pdfUrl: `https://www.biorxiv.org/content/${paper.doi}v${paper.version}.full.pdf`,
        source: 'biorxiv' as const,
        doi: paper.doi,
        abstract: paper.abstract,
        categories: [paper.category]
      }))
    } catch (error) {
      console.error('bioRxiv PDF search error:', error)
      return []
    }
  }

  // MASTER FUNKTION: Alle freien PDFs sammeln
  async searchAllFreePdfs(query: string): Promise<DownloadablePaper[]> {
    try {
      console.log(`🔍 Suche nach freien PDFs für: "${query}"`)

      const [
        arxivPapers,
        semanticPapers,
        pubmedPapers,
        doajPapers,
        biorxivPapers
      ] = await Promise.all([
        this.searchArxivPdfs(query, 10),
        this.searchSemanticScholarPdfs(query, 10),
        this.searchPubMedPdfs(query, 10),
        this.searchDoajPdfs(query, 10),
        this.searchBioRxivPdfs(query, 10)
      ])

      const allPapers = [
        ...arxivPapers,
        ...semanticPapers,
        ...pubmedPapers,
        ...doajPapers,
        ...biorxivPapers
      ]

      // Entferne Duplikate basierend auf Titel
      const uniquePapers = allPapers.filter((paper, index, self) =>
        index === self.findIndex(p =>
          p.title.toLowerCase().trim() === paper.title.toLowerCase().trim()
        )
      )

      console.log(`✅ Gefunden: ${uniquePapers.length} freie PDFs`)
      console.log(`   - arXiv: ${arxivPapers.length}`)
      console.log(`   - Semantic Scholar: ${semanticPapers.length}`)
      console.log(`   - PubMed: ${pubmedPapers.length}`)
      console.log(`   - DOAJ: ${doajPapers.length}`)
      console.log(`   - bioRxiv: ${biorxivPapers.length}`)

      return uniquePapers
    } catch (error) {
      console.error('Error searching free PDFs:', error)
      return []
    }
  }

  // Generiere BibTeX für ein Paper
  generateBibTeX(paper: DownloadablePaper): string {
    const sanitizeTitle = (title: string) => title.replace(/[{}]/g, '')
    const year = paper.year || new Date().getFullYear()

    return `@article{${paper.id},
  title = {${sanitizeTitle(paper.title)}},
  author = {${paper.authors}},
  year = {${year}},
  url = {${paper.pdfUrl}},
  source = {${paper.source}}${paper.doi ? `,\n  doi = {${paper.doi}}` : ''}
}\n`
  }

  // Generiere Metadaten JSON
  generateMetadata(papers: DownloadablePaper[]): string {
    return JSON.stringify({
      generated: new Date().toISOString(),
      totalPapers: papers.length,
      papers: papers.map(paper => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        source: paper.source,
        doi: paper.doi,
        pdfUrl: paper.pdfUrl,
        abstract: paper.abstract,
        categories: paper.categories
      }))
    }, null, 2)
  }
}

// Singleton instance
export const freePdfDownloadService = new FreePdfDownloadService()
