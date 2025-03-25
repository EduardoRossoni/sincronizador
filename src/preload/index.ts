import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Interface para os métodos relacionados ao servidor
interface ServerAPI {
  startServer: () => Promise<{ success: boolean; port?: number; ipAddress?: string; error?: string }>
  stopServer: () => Promise<{ success: boolean; error?: string }>
  getServerStatus: () => Promise<{ running: boolean; port: number; ipAddress: string }>
}

// Interface para os métodos relacionados ao DataService
interface DataServiceAPI {
  updateTransformedData: (data: unknown[]) => void
}

// Custom APIs for renderer
const api = {
  server: {
    startServer: () => ipcRenderer.invoke('server:start'),
    stopServer: () => ipcRenderer.invoke('server:stop'),
    getServerStatus: () => ipcRenderer.invoke('server:status')
  } as ServerAPI,

  dataService: {
    updateTransformedData: (data: unknown[]) => ipcRenderer.send('data-service:update-transformed-data', data)
  } as DataServiceAPI
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
