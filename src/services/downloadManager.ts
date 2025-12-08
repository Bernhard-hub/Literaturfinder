// Download Manager - Orchestriert parallele PDF-Downloads mit Progress-Tracking

import { DownloadablePaper, DownloadProgress } from './freePdfDownloadService'
import { freePdfDownloadService } from './freePdfDownloadService'

export interface DownloadStats {
  total: number
  completed: number
  failed: number
  inProgress: number
}

export class DownloadManager {
  private downloadQueue: DownloadablePaper[] = []
  private downloadProgress: Map<string, DownloadProgress> = new Map()
  private maxConcurrentDownloads = 3
  private activeDownloads = 0
  private baseFolder: string = ''

  // Callbacks
  onProgressUpdate?: (progress: Map<string, DownloadProgress>) => void
  onStatsUpdate?: (stats: DownloadStats) => void
  onComplete?: () => void

  constructor() {
    // Setup progress listener
    if (window.electronAPI) {
      window.electronAPI.onDownloadProgress((data) => {
        const progress = this.downloadProgress.get(data.paperId)
        if (progress) {
          progress.progress = data.progress
          this.notifyProgressUpdate()
        }
      })
    }
  }

  // Sanitize filename (entfernt ungültige Zeichen)
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 200) // Max 200 Zeichen
  }

  // Erstelle Ordnerstruktur: BaseFolder/Topic/Year/
  private async createFolderStructure(topic: string, year: number): Promise<string> {
    const sanitizedTopic = this.sanitizeFilename(topic)
    const yearFolder = year > 0 ? year.toString() : 'Unknown_Year'
    const folderPath = `${this.baseFolder}/${sanitizedTopic}/${yearFolder}`

    if (window.electronAPI) {
      await window.electronAPI.createDirectory(folderPath)
    }

    return folderPath
  }

  // Generiere Dateinamen
  private generateFilename(paper: DownloadablePaper): string {
    const year = paper.year || 'unknown'
    const firstAuthor = paper.authors.split(',')[0]?.trim() || 'Unknown'
    const sanitizedAuthor = this.sanitizeFilename(firstAuthor)
    const sanitizedTitle = this.sanitizeFilename(paper.title)

    return `${sanitizedAuthor}_${year}_${sanitizedTitle}.pdf`
  }

  // Starte Downloads für Papers
  async startDownloads(papers: DownloadablePaper[], topic: string, downloadFolder: string) {
    this.baseFolder = downloadFolder
    this.downloadQueue = [...papers]
    this.downloadProgress.clear()
    this.activeDownloads = 0

    // Initialisiere Progress für alle Papers
    papers.forEach(paper => {
      this.downloadProgress.set(paper.id, {
        paperId: paper.id,
        title: paper.title,
        status: 'pending',
        progress: 0
      })
    })

    this.notifyProgressUpdate()

    // Starte parallele Downloads
    const downloadPromises: Promise<void>[] = []
    for (let i = 0; i < Math.min(this.maxConcurrentDownloads, papers.length); i++) {
      downloadPromises.push(this.processQueue(topic))
    }

    await Promise.all(downloadPromises)

    // Generiere Metadaten-Dateien
    await this.generateMetadataFiles(papers, topic)

    this.onComplete?.()
  }

  // Verarbeite Download-Queue
  private async processQueue(topic: string): Promise<void> {
    while (this.downloadQueue.length > 0) {
      const paper = this.downloadQueue.shift()
      if (!paper) break

      await this.downloadPaper(paper, topic)
    }
  }

  // Hilfsfunktion: Validiere und normalisiere URL
  private normalizeUrl(url: string): string {
    // Wenn URL bereits absolut ist
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // Versuche, relative URLs zu korrigieren basierend auf bekannten Mustern
    if (url.includes('PMC') || url.includes('/pmc/')) {
      // PubMed Central URL
      const base = 'https://www.ncbi.nlm.nih.gov'
      const relative = url.startsWith('/') ? url : '/' + url
      return base + relative
    }

    // Wenn nichts passt, gebe ursprüngliche URL zurück
    console.warn(`Konnte URL nicht normalisieren: ${url}`)
    return url
  }

  // Download eines einzelnen Papers
  private async downloadPaper(paper: DownloadablePaper, topic: string): Promise<void> {
    const progress = this.downloadProgress.get(paper.id)
    if (!progress) return

    try {
      this.activeDownloads++
      progress.status = 'downloading'
      this.notifyProgressUpdate()
      this.notifyStatsUpdate()

      // Normalisiere URL (stelle sicher, dass sie absolut ist)
      const normalizedUrl = this.normalizeUrl(paper.pdfUrl)

      // Validiere URL
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        throw new Error(`Ungültige URL: ${normalizedUrl}`)
      }

      // Erstelle Ordnerstruktur
      const folderPath = await this.createFolderStructure(topic, paper.year)

      // Generiere Dateinamen
      const filename = this.generateFilename(paper)
      const destinationPath = `${folderPath}/${filename}`

      // Download PDF via Electron IPC
      if (window.electronAPI) {
        await window.electronAPI.downloadPdf({
          url: normalizedUrl,
          destinationPath: destinationPath,
          paperId: paper.id
        })

        progress.status = 'completed'
        progress.progress = 100
      } else {
        throw new Error('Electron API not available')
      }
    } catch (error) {
      console.error(`Download failed for ${paper.title}:`, error)
      progress.status = 'failed'
      progress.error = (error as Error).message
    } finally {
      this.activeDownloads--
      this.notifyProgressUpdate()
      this.notifyStatsUpdate()
    }
  }

  // Generiere Metadaten-Dateien (BibTeX + JSON)
  private async generateMetadataFiles(papers: DownloadablePaper[], topic: string): Promise<void> {
    if (!window.electronAPI) return

    const sanitizedTopic = this.sanitizeFilename(topic)
    const metadataFolder = `${this.baseFolder}/${sanitizedTopic}`

    // BibTeX File
    const bibtexContent = papers
      .map(paper => freePdfDownloadService.generateBibTeX(paper))
      .join('\n')

    await window.electronAPI.writeFile({
      filePath: `${metadataFolder}/references.bib`,
      content: bibtexContent
    })

    // JSON Metadata
    const metadataContent = freePdfDownloadService.generateMetadata(papers)

    await window.electronAPI.writeFile({
      filePath: `${metadataFolder}/metadata.json`,
      content: metadataContent
    })
  }

  // Notifications
  private notifyProgressUpdate() {
    this.onProgressUpdate?.(new Map(this.downloadProgress))
  }

  private notifyStatsUpdate() {
    const stats = this.getStats()
    this.onStatsUpdate?.(stats)
  }

  // Statistiken abrufen
  getStats(): DownloadStats {
    const progressArray = Array.from(this.downloadProgress.values())

    return {
      total: progressArray.length,
      completed: progressArray.filter(p => p.status === 'completed').length,
      failed: progressArray.filter(p => p.status === 'failed').length,
      inProgress: progressArray.filter(p => p.status === 'downloading').length
    }
  }

  // Progress Map abrufen
  getProgress(): Map<string, DownloadProgress> {
    return new Map(this.downloadProgress)
  }

  // Cleanup
  cleanup() {
    if (window.electronAPI) {
      window.electronAPI.removeDownloadProgressListener()
    }
    this.downloadProgress.clear()
    this.downloadQueue = []
  }
}

// Singleton instance
export const downloadManager = new DownloadManager()
