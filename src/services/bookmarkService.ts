import { Book } from './bookService'

const STORAGE_KEY = 'literaturfinder-bookmarks'

export class BookmarkService {
  private bookmarks: Book[] = []

  constructor() {
    this.loadBookmarks()
  }

  private loadBookmarks(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.bookmarks = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Merkliste:', error)
      this.bookmarks = []
    }
  }

  private saveBookmarks(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks))
    } catch (error) {
      console.error('Fehler beim Speichern der Merkliste:', error)
    }
  }

  addBookmark(book: Book): boolean {
    if (this.isBookmarked(book.id)) {
      return false
    }

    this.bookmarks.unshift(book) // Neueste zuerst
    this.saveBookmarks()
    return true
  }

  removeBookmark(bookId: string): boolean {
    const index = this.bookmarks.findIndex(book => book.id === bookId)
    if (index === -1) {
      return false
    }

    this.bookmarks.splice(index, 1)
    this.saveBookmarks()
    return true
  }

  toggleBookmark(book: Book): boolean {
    if (this.isBookmarked(book.id)) {
      this.removeBookmark(book.id)
      return false
    } else {
      this.addBookmark(book)
      return true
    }
  }

  isBookmarked(bookId: string): boolean {
    return this.bookmarks.some(book => book.id === bookId)
  }

  getBookmarks(): Book[] {
    return [...this.bookmarks]
  }

  getBookmarkCount(): number {
    return this.bookmarks.length
  }

  clearAllBookmarks(): void {
    this.bookmarks = []
    this.saveBookmarks()
  }

  exportBookmarks(): string {
    return JSON.stringify(this.bookmarks, null, 2)
  }

  importBookmarks(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData)
      if (Array.isArray(imported)) {
        this.bookmarks = imported
        this.saveBookmarks()
        return true
      }
      return false
    } catch (error) {
      console.error('Fehler beim Importieren der Merkliste:', error)
      return false
    }
  }
}

// Singleton instance
export const bookmarkService = new BookmarkService()