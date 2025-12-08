// Original Open Library API TypeScript/TSX Implementation
// Open Source: https://openlibrary.org/dev/docs/api/search

interface OpenLibrarySearchResponse {
  start: number
  num_found: number
  docs: OpenLibraryDocument[]
}

interface OpenLibraryDocument {
  cover_i?: number
  has_fulltext?: boolean
  edition_count?: number
  title: string
  author_name?: string[]
  first_publish_year?: number
  key: string
  ia?: string[]
  author_key?: string[]
  public_scan_b?: boolean
  isbn?: string[]
  publisher?: string[]
  language?: string[]
  subject?: string[]
  person?: string[]
  place?: string[]
  time?: string[]
  subtitle?: string
  number_of_pages_median?: number
  edition_key?: string[]
  publish_date?: string[]
  publish_year?: number[]
  first_sentence?: string[]
  ratings_average?: number
  ratings_count?: number
  want_to_read_count?: number
  currently_reading_count?: number
  already_read_count?: number
}

interface Book {
  id: string
  title: string
  author: string
  year: number
  isbn?: string
  description?: string
  image?: string
  thumbnail?: string
  pageCount?: number
  categories?: string[]
  language?: string
  publisher?: string
  coverUrl?: string
  openLibraryKey?: string
  editionCount?: number
  hasFulltext?: boolean
  ratings?: {
    average?: number
    count?: number
  }
  readingStats?: {
    wantToRead?: number
    currentlyReading?: number
    alreadyRead?: number
  }
}

// Open Library Search API Class (Original Open Source Implementation)
export class OpenLibrarySearchAPI {
  private readonly baseUrl = 'https://openlibrary.org/search.json'
  private readonly coversUrl = 'https://covers.openlibrary.org/b'

  async search(query: string, options: {
    fields?: string
    sort?: 'new' | 'old' | 'random' | 'key'
    lang?: string
    limit?: number
    offset?: number
  } = {}): Promise<Book[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        fields: options.fields || '*',
        limit: (options.limit || 12).toString(),
        offset: (options.offset || 0).toString()
      })

      if (options.sort) params.append('sort', options.sort)
      if (options.lang) params.append('lang', options.lang)

      const response = await fetch(`${this.baseUrl}?${params}`)

      if (!response.ok) {
        throw new Error(`Open Library API Error: ${response.status}`)
      }

      const data: OpenLibrarySearchResponse = await response.json()

      return this.transformToBooks(data.docs)
    } catch (error) {
      console.error('Open Library Search Error:', error)
      return []
    }
  }

  async searchByAuthor(author: string, limit = 12): Promise<Book[]> {
    return this.search(`author:${author}`, { limit, sort: 'new' })
  }

  async searchByTitle(title: string, limit = 12): Promise<Book[]> {
    return this.search(`title:${title}`, { limit })
  }

  async searchBySubject(subject: string, limit = 12): Promise<Book[]> {
    return this.search(`subject:${subject}`, { limit, sort: 'new' })
  }

  async searchInGerman(query: string, limit = 12): Promise<Book[]> {
    return this.search(query, { limit, lang: 'ger' })
  }

  private transformToBooks(docs: OpenLibraryDocument[]): Book[] {
    return docs.map((doc, index) => {
      const authors = doc.author_name?.join(', ') || 'Unbekannter Autor'
      const publisher = doc.publisher?.[0] || undefined
      const isbn = doc.isbn?.[0] || undefined
      const language = doc.language?.[0] || 'de'
      const year = doc.first_publish_year || doc.publish_year?.[0] || 0

      // Generate cover URL if cover_i exists
      const coverUrl = doc.cover_i
        ? `${this.coversUrl}/id/${doc.cover_i}-M.jpg`
        : undefined

      // Extract first sentence as description
      const description = doc.first_sentence?.[0] ||
                         `${doc.title} von ${authors}` +
                         (doc.subtitle ? ` - ${doc.subtitle}` : '')

      // Generate categories from subjects
      const categories = [
        ...(doc.subject?.slice(0, 3) || []),
        ...(doc.person?.slice(0, 2) || []),
        ...(doc.place?.slice(0, 2) || [])
      ].filter(Boolean)

      return {
        id: `openlibrary-${doc.key.replace('/works/', '')}`,
        title: doc.title + (doc.subtitle ? `: ${doc.subtitle}` : ''),
        author: authors,
        year,
        isbn,
        description,
        image: this.getRandomBookEmoji(index),
        thumbnail: coverUrl,
        coverUrl,
        pageCount: doc.number_of_pages_median,
        categories: categories.length > 0 ? categories : undefined,
        language,
        publisher,
        openLibraryKey: doc.key,
        editionCount: doc.edition_count,
        hasFulltext: doc.has_fulltext,
        ratings: doc.ratings_average ? {
          average: doc.ratings_average,
          count: doc.ratings_count
        } : undefined,
        readingStats: {
          wantToRead: doc.want_to_read_count,
          currentlyReading: doc.currently_reading_count,
          alreadyRead: doc.already_read_count
        }
      }
    })
  }

  private getRandomBookEmoji(index: number): string {
    const bookEmojis = ['📚', '📖', '📕', '📗', '📘', '📙', '📔', '📓', '📒', '📜']
    return bookEmojis[index % bookEmojis.length]
  }

  // Get direct book URL for Open Library
  getBookUrl(openLibraryKey: string): string {
    return `https://openlibrary.org${openLibraryKey}`
  }

  // Get cover URL in different sizes
  getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
    return `${this.coversUrl}/id/${coverId}-${size}.jpg`
  }
}

// Export singleton instance
export const openLibraryAPI = new OpenLibrarySearchAPI()

export type { Book, OpenLibraryDocument, OpenLibrarySearchResponse }