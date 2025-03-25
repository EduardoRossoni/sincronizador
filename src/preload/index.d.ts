import { ElectronAPI } from '@electron-toolkit/preload'

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

interface DataServiceAPI {
  updateTransformedData: (data: unknown[]) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      server: ServerAPI
      dataService: DataServiceAPI
    }
  }
}
