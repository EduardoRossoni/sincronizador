import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Tipos para dados do Gepec
interface Trato {
  id: number
  data: string | Date
  external_id: number
  quantidade: number
  usa_horario: boolean
  numero_trato: number
  [key: string]: unknown
}

interface Batida {
  [key: string]: unknown
}

interface LeituraFeitaSinc {
  [key: string]: unknown
}

interface GepecData {
  tratos: Trato[]
  batidas: Batida[]
  leituraFeitaSinc: LeituraFeitaSinc
}

// Interface para os métodos relacionados ao servidor
interface ServerAPI {
  startServer: () => Promise<{
    success: boolean
    port?: number
    ipAddress?: string
    error?: string
  }>
  stopServer: () => Promise<{ success: boolean; error?: string }>
  getServerStatus: () => Promise<{ running: boolean; port: number; ipAddress: string }>
}

// Interface para os métodos relacionados ao DataService
interface DataServiceAPI {
  updateTransformedData: (data: unknown[]) => void
}

// Interface para os métodos relacionados ao serviço de transformação para Gepec
interface GepecAPI {
  onGepecDataReceived: (callback: (data: GepecData) => void) => () => void
}

// Custom APIs for renderer
const api = {
  server: {
    startServer: () => ipcRenderer.invoke('server:start'),
    stopServer: () => ipcRenderer.invoke('server:stop'),
    getServerStatus: () => ipcRenderer.invoke('server:status')
  } as ServerAPI,

  dataService: {
    updateTransformedData: (data: unknown[]) =>
      ipcRenderer.send('data-service:update-transformed-data', data)
  } as DataServiceAPI,

  gepec: {
    // Método para escutar eventos de dados do Gepec recebidos
    onGepecDataReceived: (callback: (data: GepecData) => void) => {
      // Adicionar um listener para eventos de dados do Gepec
      const subscription: (_: unknown, data: GepecData) => void = (_: unknown, data: GepecData) =>
        callback(data)
      ipcRenderer.on('gepec-data:received', subscription)

      // Retornar uma função para remover o listener quando não for mais necessário
      return (): void => {
        ipcRenderer.removeListener('gepec-data:received', subscription)
      }
    }
  } as GepecAPI
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
