import { openLibraryAPI, Book } from './openLibraryService'
import { academicSearchService } from './academicSearchService'
import { extendedAcademicService } from './extendedAcademicService'

// Erweiterte lokale Buchsammlung (deutsche Literatur)
const localBooks: Book[] = [
  {
    id: '1',
    title: 'Der Prozess',
    author: 'Franz Kafka',
    year: 1925,
    isbn: '978-3-15-009808-6',
    description: 'Ein surrealistischer Roman über Josef K., der eines Morgens verhaftet wird, ohne zu wissen warum.',
    image: '📚',
    categories: ['Klassiker', 'Literatur', 'Roman'],
    language: 'de',
    publisher: 'Reclam'
  },
  {
    id: '2',
    title: 'Faust',
    author: 'Johann Wolfgang von Goethe',
    year: 1808,
    isbn: '978-3-15-000001-5',
    description: 'Die Tragödie des Gelehrten Heinrich Faust, der einen Pakt mit dem Teufel eingeht.',
    image: '📖',
    categories: ['Klassiker', 'Drama', 'Deutsche Literatur'],
    language: 'de',
    publisher: 'Reclam'
  },
  {
    id: '3',
    title: 'Die Verwandlung',
    author: 'Franz Kafka',
    year: 1915,
    isbn: '978-3-15-009900-7',
    description: 'Gregor Samsa erwacht eines Morgens als ungeheueres Ungeziefer.',
    image: '📕',
    categories: ['Klassiker', 'Novelle', 'Surrealismus'],
    language: 'de',
    publisher: 'Reclam'
  },
  {
    id: '4',
    title: 'Der Zauberberg',
    author: 'Thomas Mann',
    year: 1924,
    isbn: '978-3-596-29433-4',
    description: 'Hans Castorp verbringt sieben Jahre in einem Schweizer Sanatorium.',
    image: '🏔️',
    categories: ['Klassiker', 'Roman', 'Deutsche Literatur'],
    language: 'de',
    publisher: 'Fischer'
  },
  {
    id: '5',
    title: 'Die Buddenbrooks',
    author: 'Thomas Mann',
    year: 1901,
    isbn: '978-3-596-29434-1',
    description: 'Der Verfall einer Lübecker Kaufmannsfamilie über vier Generationen.',
    image: '🏢',
    categories: ['Klassiker', 'Roman', 'Familiengeschichte'],
    language: 'de',
    publisher: 'Fischer'
  },
  {
    id: '6',
    title: 'Effi Briest',
    author: 'Theodor Fontane',
    year: 1896,
    isbn: '978-3-15-006001-5',
    description: 'Die Geschichte einer jungen Frau in der preußischen Gesellschaft.',
    image: '👩',
    categories: ['Klassiker', 'Roman', 'Realismus'],
    language: 'de',
    publisher: 'Reclam'
  },
  {
    id: '7',
    title: 'Berlin Alexanderplatz',
    author: 'Alfred Döblin',
    year: 1929,
    isbn: '978-3-423-13062-9',
    description: 'Franz Biberkopf versucht nach seiner Haftentlassung ein anständiges Leben zu führen.',
    image: '🏙️',
    categories: ['Klassiker', 'Roman', 'Moderne'],
    language: 'de',
    publisher: 'DTV'
  },
  {
    id: '8',
    title: 'Der Steppenwolf',
    author: 'Hermann Hesse',
    year: 1927,
    isbn: '978-3-518-36675-8',
    description: 'Harry Haller, ein 50-jähriger Intellektueller, kämpft mit seiner Zerrissenheit.',
    image: '🐺',
    categories: ['Klassiker', 'Roman', 'Philosophie'],
    language: 'de',
    publisher: 'Suhrkamp'
  },
  {
    id: '9',
    title: 'Siddhartha',
    author: 'Hermann Hesse',
    year: 1922,
    isbn: '978-3-518-36680-2',
    description: 'Die spirituelle Reise eines jungen Mannes zur Zeit Buddhas.',
    image: '🧘',
    categories: ['Klassiker', 'Roman', 'Spiritualität'],
    language: 'de',
    publisher: 'Suhrkamp'
  },
  {
    id: '10',
    title: 'Der Name der Rose',
    author: 'Umberto Eco',
    year: 1980,
    isbn: '978-3-423-10551-1',
    description: 'Ein Mönch löst Mordfälle in einem mittelalterlichen Kloster.',
    image: '🌹',
    categories: ['Roman', 'Krimi', 'Mittelalter'],
    language: 'de',
    publisher: 'DTV'
  },
  {
    id: '11',
    title: 'Die Leiden des jungen Werther',
    author: 'Johann Wolfgang von Goethe',
    year: 1774,
    isbn: '978-3-15-000067-1',
    description: 'Werthers unglückliche Liebe zu der vergebenen Charlotte.',
    image: '💔',
    categories: ['Klassiker', 'Roman', 'Sturm und Drang'],
    language: 'de',
    publisher: 'Reclam'
  },
  {
    id: '12',
    title: 'Im Westen nichts Neues',
    author: 'Erich Maria Remarque',
    year: 1929,
    isbn: '978-3-462-04020-3',
    description: 'Die Schrecken des Ersten Weltkriegs aus Sicht eines jungen Soldaten.',
    image: '⚔️',
    categories: ['Roman', 'Krieg', 'Geschichte'],
    language: 'de',
    publisher: 'Kiepenheuer & Witsch'
  }
]

// Google Books API Suche
async function searchGoogleBooks(query: string): Promise<Book[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=de&maxResults=10`
    )

    if (!response.ok) {
      throw new Error('Google Books API Fehler')
    }

    const data = await response.json()

    if (!data.items) {
      return []
    }

    return data.items.map((item: any, index: number) => {
      const volumeInfo = item.volumeInfo
      const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unbekannter Autor'
      const publishedDate = volumeInfo.publishedDate
      const year = publishedDate ? parseInt(publishedDate.split('-')[0]) : 0

      return {
        id: `google-${item.id}`,
        title: volumeInfo.title || 'Unbekannter Titel',
        author: authors,
        year: year,
        isbn: volumeInfo.industryIdentifiers?.[0]?.identifier,
        description: volumeInfo.description || 'Keine Beschreibung verfügbar.',
        image: ['📚', '📖', '📕', '📗', '📘', '📙'][index % 6],
        thumbnail: volumeInfo.imageLinks?.thumbnail,
        pageCount: volumeInfo.pageCount,
        categories: volumeInfo.categories || [],
        language: volumeInfo.language || 'de',
        publisher: volumeInfo.publisher
      }
    })
  } catch (error) {
    console.error('Fehler bei Google Books API:', error)
    return []
  }
}

// Lokale Suche in der Buchsammlung
function searchLocalBooks(query: string): Book[] {
  const searchTerm = query.toLowerCase()

  return localBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm) ||
    book.description?.toLowerCase().includes(searchTerm) ||
    book.categories?.some(cat => cat.toLowerCase().includes(searchTerm)) ||
    book.publisher?.toLowerCase().includes(searchTerm)
  )
}

// Open Library API Suche (Original Open Source Implementation)
async function searchOpenLibrary(query: string): Promise<Book[]> {
  try {
    // Verwende die originale Open Library API
    const results = await openLibraryAPI.search(query, {
      limit: 8,
      lang: 'ger' // Deutsche Bücher bevorzugen
    })

    // Auch allgemeine Suche für mehr Ergebnisse
    if (results.length < 4) {
      const generalResults = await openLibraryAPI.search(query, { limit: 8 })
      results.push(...generalResults.filter(book =>
        !results.find(existing => existing.id === book.id)
      ))
    }

    return results.slice(0, 8)
  } catch (error) {
    console.error('Fehler bei Open Library API:', error)
    return []
  }
}

// Erweiterte Haupt-Suchfunktion mit allen Quellen
export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) {
    return []
  }

  // Parallel alle Quellen durchsuchen
  const [localResults, googleResults, openLibraryResults, academicResults, extendedAcademicResults] = await Promise.all([
    Promise.resolve(searchLocalBooks(query)),
    searchGoogleBooks(query),
    searchOpenLibrary(query),
    academicSearchService.searchAcademic(query),
    extendedAcademicService.searchExtendedAcademic(query)
  ])

  // Ergebnisse kombinieren: Lokale zuerst, dann Open Library, dann Google, dann Akademisch, dann Erweiterte Akademische Quellen
  const allResults = [...localResults, ...openLibraryResults, ...googleResults, ...academicResults, ...extendedAcademicResults]

  // Duplikate entfernen basierend auf Titel und Autor
  const uniqueResults = allResults.filter((book, index, self) =>
    index === self.findIndex(b =>
      b.title.toLowerCase().trim() === book.title.toLowerCase().trim() &&
      b.author.toLowerCase().trim() === book.author.toLowerCase().trim()
    )
  )

  return uniqueResults.slice(0, 20) // Maximal 20 Ergebnisse
}

// Spezielle Suchfunktionen für verschiedene Bereiche
export async function searchAcademicOnly(query: string): Promise<Book[]> {
  return academicSearchService.searchAcademic(query)
}

export async function searchArXivOnly(query: string): Promise<Book[]> {
  return academicSearchService.searchArXiv(query)
}

export async function searchCrossRefOnly(query: string): Promise<Book[]> {
  return academicSearchService.searchCrossRef(query)
}

export async function searchScholarOnly(query: string): Promise<Book[]> {
  return academicSearchService.searchGoogleScholar(query)
}

// Erweiterte akademische Suchfunktionen
export async function searchSpringerOnly(query: string): Promise<Book[]> {
  return extendedAcademicService.searchSpringer(query)
}

export async function searchPubMedOnly(query: string): Promise<Book[]> {
  return extendedAcademicService.searchPubMed(query)
}

export async function searchDOAJOnly(query: string): Promise<Book[]> {
  return extendedAcademicService.searchDOAJ(query)
}

export async function searchCOREOnly(query: string): Promise<Book[]> {
  return extendedAcademicService.searchCORE(query)
}

export async function searchIEEEOnly(query: string): Promise<Book[]> {
  return extendedAcademicService.searchIEEE(query)
}

export async function searchExtendedAcademicOnly(query: string): Promise<Book[]> {
  return extendedAcademicService.searchExtendedAcademic(query)
}

export type { Book }