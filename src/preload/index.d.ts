import { ElectronAPI } from '@electron-toolkit/preload'

interface ServerAPI {
  startServer: () => Promise<{ success: boolean; port?: number; error?: string }>
  stopServer: () => Promise<{ success: boolean; error?: string }>
  getServerStatus: () => Promise<{ running: boolean; port: number }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      server: ServerAPI
    }
  }
}
