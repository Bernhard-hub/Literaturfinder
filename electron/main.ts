import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as https from 'https'
import * as http from 'http'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: true
  })

  // CORS-Bypass für externe APIs
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { ...details.requestHeaders, Origin: '*' } })
    }
  )

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Methods': ['GET, POST, PUT, DELETE, OPTIONS'],
          'Access-Control-Allow-Headers': ['*']
        }
      })
    }
  )

  if (isDev) {
    mainWindow.loadURL('http://localhost:4001')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()

    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null!
  })
}

app.whenReady().then(() => {
  createMainMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function createMainMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Datei',
      submenu: [
        {
          label: 'Neue Suche',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reload()
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Beenden',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Bearbeiten',
      submenu: [
        { label: 'Rückgängig', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Wiederholen', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Ausschneiden', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Kopieren', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Einfügen', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Ansicht',
      submenu: [
        { label: 'Neu laden', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Entwicklertools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Vollbild', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Hilfe',
      submenu: [
        {
          label: 'Über Literaturfinder',
          click: () => {
            // Hier könnte ein About-Dialog geöffnet werden
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ========================================
// IPC HANDLERS für automatische PDF-Downloads
// ========================================

// Ordner auswählen für Downloads
ipcMain.handle('select-download-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Ordner für Downloads auswählen'
  })

  if (result.canceled) {
    return null
  }

  return result.filePaths[0]
})

// Helper function für PDF-Download mit Redirect-Handling
function downloadPdfFile(
  url: string,
  destinationPath: string,
  paperId: string,
  redirectCount = 0
): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'))
      return
    }

    const client = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(destinationPath)
    let downloadedBytes = 0

    const request = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        const redirectUrl = response.headers.location
        file.close()

        if (redirectUrl) {
          // Follow redirect
          downloadPdfFile(redirectUrl, destinationPath, paperId, redirectCount + 1)
            .then(resolve)
            .catch(reject)
          return
        }
      }

      if (response.statusCode !== 200) {
        file.close()
        fs.unlink(destinationPath, () => {})
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        return
      }

      const totalBytes = parseInt(response.headers['content-length'] || '0', 10)

      response.pipe(file)

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length
        const progress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0

        // Sende Progress an Renderer
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('download-progress', {
            paperId,
            progress: Math.round(progress)
          })
        }
      })

      file.on('finish', () => {
        file.close()
        resolve({ success: true })
      })

      file.on('error', (err) => {
        fs.unlink(destinationPath, () => {})
        reject(err)
      })
    })

    request.on('error', (err) => {
      file.close()
      fs.unlink(destinationPath, () => {})
      reject(err)
    })

    request.setTimeout(30000, () => {
      request.destroy()
      file.close()
      fs.unlink(destinationPath, () => {})
      reject(new Error('Download timeout'))
    })
  })
}

// PDF herunterladen
ipcMain.handle('download-pdf', async (event, args: {
  url: string
  destinationPath: string
  paperId: string
}) => {
  const { url, destinationPath, paperId } = args
  return downloadPdfFile(url, destinationPath, paperId)
})

// Datei schreiben (für BibTeX und Metadaten)
ipcMain.handle('write-file', async (event, args: { filePath: string; content: string }) => {
  const { filePath, content } = args

  try {
    await fs.promises.writeFile(filePath, content, 'utf8')
    return { success: true }
  } catch (error) {
    console.error('Error writing file:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Ordner erstellen
ipcMain.handle('create-directory', async (event, dirPath: string) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true })
    return { success: true }
  } catch (error) {
    console.error('Error creating directory:', error)
    return { success: false, error: (error as Error).message }
  }
})

// DevTools Toggle
ipcMain.handle('toggle-devtools', async () => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools()
      return { isOpen: false }
    } else {
      mainWindow.webContents.openDevTools()
      return { isOpen: true }
    }
  }
  return { isOpen: false }
})