import { contextBridge, shell, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  openExternal: (url: string) => {
    shell.openExternal(url)
  },

  // PDF Download API
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),

  downloadPdf: (args: { url: string; destinationPath: string; paperId: string }) =>
    ipcRenderer.invoke('download-pdf', args),

  writeFile: (args: { filePath: string; content: string }) =>
    ipcRenderer.invoke('write-file', args),

  createDirectory: (dirPath: string) =>
    ipcRenderer.invoke('create-directory', dirPath),

  // Download Progress Listener
  onDownloadProgress: (callback: (data: { paperId: string; progress: number }) => void) => {
    ipcRenderer.on('download-progress', (event, data) => callback(data))
  },

  removeDownloadProgressListener: () => {
    ipcRenderer.removeAllListeners('download-progress')
  },

  // DevTools Toggle
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools')
})