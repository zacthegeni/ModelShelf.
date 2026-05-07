import { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } from 'electron'
import { join } from 'path'
import { loadMetadata, updateMetadata, getMetadata } from './metadata'
import { startWatching } from './watcher'
import { pathToFileURL } from 'url'

let mainWindow: BrowserWindow | null = null
let currentWatchedFolder: string | null = null

protocol.registerSchemesAsPrivileged([
  { scheme: 'local', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
])

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Set CSP to allow our custom local protocol
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' local: blob: data:; img-src 'self' data: blob: local:; media-src 'self' local:;"]
      }
    })
  })

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  // Register custom protocol for safe file access
  protocol.handle('local', (request) => {
    const filePath = request.url.replace('local://', '')
    // Handle URL decoding properly
    const decodedPath = decodeURIComponent(filePath)
    return net.fetch(pathToFileURL(decodedPath).href)
  })

  await loadMetadata()
  const meta = getMetadata()
  if (meta._appSettings?.lastFolder) {
    currentWatchedFolder = meta._appSettings.lastFolder
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  if (currentWatchedFolder) {
    startFolderWatcher(currentWatchedFolder)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function startFolderWatcher(folder: string) {
  startWatching(folder, (models) => {
    if (mainWindow) {
      mainWindow.webContents.send('models-changed', models)
    }
  })
}

// IPC Handlers
ipcMain.handle('dialog:openDirectory', async () => {
  if (!mainWindow) return null
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  if (canceled) {
    return null
  } else {
    const folder = filePaths[0]
    currentWatchedFolder = folder
    await updateMetadata('_appSettings', { lastFolder: folder })
    startFolderWatcher(folder)
    return folder
  }
})

ipcMain.handle('app:getInitialFolder', () => {
  return currentWatchedFolder
})

ipcMain.handle('shell:openPath', async (_, path) => {
  await shell.openPath(path)
})

ipcMain.handle('shell:showItemInFolder', (_, path) => {
  shell.showItemInFolder(path)
})

ipcMain.handle('models:updateMetadata', async (_, filePath, data) => {
  return await updateMetadata(filePath, data)
})

ipcMain.handle('models:getMetadata', () => {
  return getMetadata()
})
