import { ElectronAPI } from '@electron-toolkit/preload'

// Tipos para dados do Gepec
interface Trato {
  id: number;
  data: string | Date;
  external_id: number;
  quantidade: number;
  usa_horario: boolean;
  numero_trato: number;
  [key: string]: unknown;
}

interface Batida {
  [key: string]: unknown;
}

interface LeituraFeitaSinc {
  [key: string]: unknown;
}

interface GepecData {
  tratos: Trato[];
  batidas: Batida[];
  leituraFeitaSinc: LeituraFeitaSinc;
}

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

interface GepecAPI {
  onGepecDataReceived: (callback: (data: GepecData) => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      server: ServerAPI
      dataService: DataServiceAPI
      gepec: GepecAPI
    }
  }
}
