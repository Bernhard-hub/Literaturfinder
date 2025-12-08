declare global {
  interface Window {
    electronAPI?: {
      platform: string
      versions: {
        node: string
        chrome: string
        electron: string
      }
      openExternal: (url: string) => void
      selectDownloadFolder: () => Promise<string | null>
      downloadPdf: (args: {
        url: string
        destinationPath: string
        paperId: string
      }) => Promise<{ success: boolean }>
      writeFile: (args: {
        filePath: string
        content: string
      }) => Promise<{ success: boolean; error?: string }>
      createDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>
      onDownloadProgress: (callback: (data: { paperId: string; progress: number }) => void) => void
      removeDownloadProgressListener: () => void
      toggleDevTools: () => Promise<{ isOpen: boolean }>
    }
  }
}

export {}