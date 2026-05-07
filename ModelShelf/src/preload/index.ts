import { contextBridge, ipcRenderer } from 'electron'

const api = {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  getInitialFolder: () => ipcRenderer.invoke('app:getInitialFolder'),
  openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
  showItemInFolder: (path: string) => ipcRenderer.invoke('shell:showItemInFolder', path),

  onModelsChanged: (callback: (models: any[]) => void) => {
    // Remove existing listeners to avoid duplicates on fast refresh
    ipcRenderer.removeAllListeners('models-changed')
    ipcRenderer.on('models-changed', (_, models) => callback(models))
  },

  updateMetadata: (filePath: string, data: any) => ipcRenderer.invoke('models:updateMetadata', filePath, data),
  getMetadata: () => ipcRenderer.invoke('models:getMetadata')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.api = api
}

export type API = typeof api
