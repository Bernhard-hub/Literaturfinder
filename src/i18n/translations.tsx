// Internationalization - German & English translations for Literaturfinder

export type Language = 'de' | 'en'

export interface Translations {
  // App Header
  appTitle: string
  appSubtitle: string

  // Navigation
  navSmartLauncher: string
  navPaidLiterature: string
  navOpenAccess: string
  navBookSearch: string

  // Search
  searchPlaceholder: string
  searchButton: string
  searching: string
  noResults: string
  resultsFound: string

  // Paid Literature
  paidLiteratureTitle: string
  paidLiteratureSubtitle: string
  institutionalAccess: string
  selectUniversity: string
  openAccessVersions: string
  libgenLinks: string
  libgenWarning: string

  // Access Types
  accessOriginal: string
  accessOpenAccess: string
  accessInstitutional: string
  accessLibgen: string
  accessPaid: string
  accessGreenOA: string

  // Actions
  selectAll: string
  deselectAll: string
  selected: string
  exportEvidenra: string
  exportBibtex: string
  copyDoi: string
  copied: string

  // Paper Details
  abstract: string
  authors: string
  year: string
  journal: string
  publisher: string
  doi: string
  access: string

  // Settings
  settings: string
  language: string
  german: string
  english: string

  // Console
  consoleOn: string
  consoleOff: string

  // Countries/Regions
  austria: string
  germany: string
  switzerland: string
  usa: string
  uk: string
  netherlands: string
  scandinavia: string
  france: string
  spain: string
  italy: string
  canada: string
  australia: string
  asia: string

  // Messages
  exportSuccess: string
  importDetected: string
  searchError: string
  noAccessUrl: string
}

export const translations: Record<Language, Translations> = {
  de: {
    // App Header
    appTitle: 'Literaturfinder',
    appSubtitle: 'Wissenschaftliche Literatur weltweit finden',

    // Navigation
    navSmartLauncher: 'Smart Launcher',
    navPaidLiterature: 'Bezahlte Literatur',
    navOpenAccess: 'Open Access',
    navBookSearch: 'Buch-Suche',

    // Search
    searchPlaceholder: 'Suche nach Titel, Autor, DOI oder Thema...',
    searchButton: 'Suchen',
    searching: 'Suche...',
    noResults: 'Keine Ergebnisse gefunden',
    resultsFound: 'Ergebnisse gefunden',

    // Paid Literature
    paidLiteratureTitle: 'Bezahlte Literatur',
    paidLiteratureSubtitle: 'Elsevier, Wiley, Springer, Taylor & Francis, SAGE, De Gruyter und mehr',
    institutionalAccess: 'Institutioneller Zugang (OpenURL Resolver)',
    selectUniversity: '-- Universität auswählen --',
    openAccessVersions: 'Unpaywall (legale Open Access Versionen)',
    libgenLinks: 'Library Genesis Links',
    libgenWarning: 'Library Genesis befindet sich in einer rechtlichen Grauzone. Die Nutzung erfolgt auf eigene Verantwortung. Wir empfehlen, zuerst institutionelle Zugänge und Unpaywall zu nutzen.',

    // Access Types
    accessOriginal: 'Publisher',
    accessOpenAccess: 'Open Access (Unpaywall)',
    accessInstitutional: 'Uni-Zugang (OpenURL)',
    accessLibgen: 'Library Genesis',
    accessPaid: 'Bezahlt',
    accessGreenOA: 'Green OA',

    // Actions
    selectAll: 'Alle auswählen',
    deselectAll: 'Auswahl aufheben',
    selected: 'ausgewählt',
    exportEvidenra: 'Export für EVIDENRA',
    exportBibtex: 'BibTeX',
    copyDoi: 'DOI kopieren',
    copied: 'Kopiert!',

    // Paper Details
    abstract: 'Abstract',
    authors: 'Autor(en)',
    year: 'Jahr',
    journal: 'Journal',
    publisher: 'Verlag',
    doi: 'DOI',
    access: 'Zugang',

    // Settings
    settings: 'Einstellungen',
    language: 'Sprache',
    german: 'Deutsch',
    english: 'English',

    // Console
    consoleOn: 'Konsole EIN',
    consoleOff: 'Konsole AUS',

    // Countries/Regions
    austria: 'Österreich',
    germany: 'Deutschland',
    switzerland: 'Schweiz',
    usa: 'USA',
    uk: 'Großbritannien',
    netherlands: 'Niederlande',
    scandinavia: 'Skandinavien',
    france: 'Frankreich',
    spain: 'Spanien',
    italy: 'Italien',
    canada: 'Kanada',
    australia: 'Australien',
    asia: 'Asien',

    // Messages
    exportSuccess: 'Paper exportiert! Öffne die Datei in EVIDENRA Ultimate um sie zu importieren.',
    importDetected: 'Literaturfinder Export erkannt - starte Import...',
    searchError: 'Fehler bei der Suche',
    noAccessUrl: 'Keine Zugangs-URL verfügbar'
  },

  en: {
    // App Header
    appTitle: 'Literature Finder',
    appSubtitle: 'Find scientific literature worldwide',

    // Navigation
    navSmartLauncher: 'Smart Launcher',
    navPaidLiterature: 'Paid Literature',
    navOpenAccess: 'Open Access',
    navBookSearch: 'Book Search',

    // Search
    searchPlaceholder: 'Search by title, author, DOI or topic...',
    searchButton: 'Search',
    searching: 'Searching...',
    noResults: 'No results found',
    resultsFound: 'results found',

    // Paid Literature
    paidLiteratureTitle: 'Paid Literature',
    paidLiteratureSubtitle: 'Elsevier, Wiley, Springer, Taylor & Francis, SAGE, De Gruyter and more',
    institutionalAccess: 'Institutional Access (OpenURL Resolver)',
    selectUniversity: '-- Select University --',
    openAccessVersions: 'Unpaywall (legal open access versions)',
    libgenLinks: 'Library Genesis Links',
    libgenWarning: 'Library Genesis operates in a legal gray area. Use at your own responsibility. We recommend using institutional access and Unpaywall first.',

    // Access Types
    accessOriginal: 'Publisher',
    accessOpenAccess: 'Open Access (Unpaywall)',
    accessInstitutional: 'Uni Access (OpenURL)',
    accessLibgen: 'Library Genesis',
    accessPaid: 'Paid',
    accessGreenOA: 'Green OA',

    // Actions
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    selected: 'selected',
    exportEvidenra: 'Export for EVIDENRA',
    exportBibtex: 'BibTeX',
    copyDoi: 'Copy DOI',
    copied: 'Copied!',

    // Paper Details
    abstract: 'Abstract',
    authors: 'Author(s)',
    year: 'Year',
    journal: 'Journal',
    publisher: 'Publisher',
    doi: 'DOI',
    access: 'Access',

    // Settings
    settings: 'Settings',
    language: 'Language',
    german: 'Deutsch',
    english: 'English',

    // Console
    consoleOn: 'Console ON',
    consoleOff: 'Console OFF',

    // Countries/Regions
    austria: 'Austria',
    germany: 'Germany',
    switzerland: 'Switzerland',
    usa: 'USA',
    uk: 'United Kingdom',
    netherlands: 'Netherlands',
    scandinavia: 'Scandinavia',
    france: 'France',
    spain: 'Spain',
    italy: 'Italy',
    canada: 'Canada',
    australia: 'Australia',
    asia: 'Asia',

    // Messages
    exportSuccess: 'Papers exported! Open the file in EVIDENRA Ultimate to import.',
    importDetected: 'Literature Finder export detected - starting import...',
    searchError: 'Search error',
    noAccessUrl: 'No access URL available'
  }
}

// Hook for using translations
import { useState, useEffect, createContext, useContext } from 'react'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

export const I18nContext = createContext<I18nContextType>({
  language: 'de',
  setLanguage: () => {},
  t: translations.de
})

export const useI18n = () => useContext(I18nContext)

export const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem('literaturfinder_language')
  if (stored === 'en' || stored === 'de') return stored
  // Auto-detect from browser
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('de')) return 'de'
  return 'en'
}

export const setStoredLanguage = (lang: Language) => {
  localStorage.setItem('literaturfinder_language', lang)
}

// I18n Provider Component
import React, { ReactNode } from 'react'

interface I18nProviderProps {
  children: ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setStoredLanguage(lang)
  }

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language]
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
