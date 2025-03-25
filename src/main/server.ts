import express from 'express'
import cors from 'cors'
import { app } from 'electron'
import { Server } from 'http'
import { networkInterfaces } from 'os'

// Interfaces para o modelo de dados
export interface Trato {
  id: number
  data: string | Date
  external_id: number
  quantidade: number
  usa_horario: boolean
  numero_trato: number
  [key: string]: unknown
}

export interface Batida {
  [key: string]: unknown
}

export interface LeituraFeitaSinc {
  [key: string]: unknown
}

export interface PostData {
  tratos: Trato[]
  batidas: Batida[]
  leituraFeitaSinc: LeituraFeitaSinc
}

export interface PostData {
  tratos: Trato[]
  batidas: Batida[]
  leituraFeitaSinc: LeituraFeitaSinc
}

export class TabletServer {
  private app = express()
  private server: Server | null = null
  private port = 3000
  private isRunning = false
  private tratoData: unknown[] = []
  // Armazenar dados transformados recebidos do renderer
  private transformedData: unknown[] = []

  constructor() {
    this.app.use(cors())
    this.app.use(express.json())

    this.setupRoutes()
  }

  // Método para atualizar os dados transformados
  updateTransformedData(data: unknown[]): void {
    this.transformedData = data
    console.log(`Dados transformados atualizados: ${this.transformedData.length} registros`)
  }

  // Método para emitir evento com dados do Gepec para o renderer process
  emitGepecData(data: PostData): void {
    console.log('Emitindo dados do Gepec para o renderer process:')
    console.log('Tratos recebidos:', data.tratos?.length || 0)
    console.log('Batidas recebidas:', data.batidas?.length || 0)
    console.log('Leitura Feita Sinc:', data.leituraFeitaSinc)

    // Garantir que os arrays estão presentes mesmo que vazios
    const normalizedData: PostData = {
      tratos: Array.isArray(data.tratos) ? data.tratos : [],
      batidas: Array.isArray(data.batidas) ? data.batidas : [],
      leituraFeitaSinc: data.leituraFeitaSinc || {}
    }

    // Enviamos o evento para o processo principal (index.ts)
    // que então o encaminhará para o renderer
    if (this.onGepecDataReceived) {
      console.log('Chamando callback onGepecDataReceived com dados normalizados')
      try {
        this.onGepecDataReceived(normalizedData)
      } catch (error) {
        console.error('Erro ao chamar callback onGepecDataReceived:', error)
      }
    } else {
      console.warn('Nenhum callback onGepecDataReceived registrado')
    }
  }

  // Callback para quando dados do Gepec são recebidos
  onGepecDataReceived: ((data: PostData) => void) | null = null

  private setupRoutes(): void {
    // Endpoint para obter dados dos tratos convertidos do DataService
    this.app.get('/api/tratos', (req, res) => {
      // Retornar dados transformados diretamente
      res.json(this.transformedData)
    })

    // Endpoint POST atualizado para receber o novo formato de dados
    this.app.post('/api/tratos', (req, res) => {
      try {
        const data = req.body as PostData
        console.log('Dados recebidos:', data)

        // Verificar se os dados estão no formato esperado
        if (data && (data.tratos || data.batidas || data.leituraFeitaSinc)) {
          // Garantir que os arrays estão presentes mesmo que vazios
          const normalizedData: PostData = {
            tratos: Array.isArray(data.tratos) ? data.tratos : [],
            batidas: Array.isArray(data.batidas) ? data.batidas : [],
            leituraFeitaSinc: data.leituraFeitaSinc || {}
          }

          // Processar os dados recebidos e emitir para o renderer
          this.emitGepecData(normalizedData)

          // Armazenar os dados recebidos com timestamp
          this.tratoData.push({
            ...normalizedData,
            receivedAt: new Date().toISOString()
          })

          res.json({
            success: true,
            message: 'Dados recebidos com sucesso!',
            timestamp: new Date().toISOString(),
            tratos: normalizedData.tratos.length,
            batidas: normalizedData.batidas.length
          })
        } else {
          // Dados em formato inválido
          res.status(400).json({
            success: false,
            message:
              'Formato de dados inválido. Esperado: { tratos: [], batidas: [], leituraFeitaSinc: {} }',
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Erro ao processar a requisição:', error)
        res.status(500).json({
          success: false,
          message: 'Erro ao processar a requisição',
          timestamp: new Date().toISOString()
        })
      }
    })

    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'ok',
        serverTime: new Date().toISOString(),
        version: app.getVersion()
      })
    })
  }

  // Obter endereço IP local
  getLocalIpAddress(): string {
    const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        // Pular interfaces de loopback e não IPv4
        if (net.family === 'IPv4' && !net.internal) {
          return net.address
        }
      }
    }
    return '127.0.0.1' // Fallback para localhost
  }

  start(): Promise<{ port: number; ipAddress: string }> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        reject(new Error('Servidor já está em execução na porta ' + this.port))
        return
      }

      try {
        this.server = this.app.listen(this.port, () => {
          this.isRunning = true
          const ipAddress = this.getLocalIpAddress()
          console.log(`Servidor tablet iniciado em ${ipAddress}:${this.port}`)
          resolve({ port: this.port, ipAddress })
        })

        this.server.on('error', (err: Error) => {
          console.error('Erro ao iniciar o servidor:', err)
          reject(err)
        })
      } catch (error) {
        console.error('Erro ao criar o servidor:', error)
        reject(error)
      }
    })
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isRunning || !this.server) {
        // Mesmo se não estiver rodando, chamamos resolve() para não dar erro
        resolve()
        return
      }

      this.server.close((err: Error | undefined) => {
        if (err) {
          console.error('Erro ao parar o servidor:', err)
          reject(err)
        } else {
          this.isRunning = false
          console.log('Servidor tablet parado')
          resolve()
        }
      })
    })
  }

  isServerRunning(): boolean {
    return this.isRunning
  }

  getPort(): number {
    return this.port
  }

  getIpAddress(): string {
    return this.getLocalIpAddress()
  }

  clearData(): void {
    this.tratoData = []
  }
}

// Importação de BrowserWindow adicionada aqui para evitar erros de referência circular
// import { BrowserWindow } from 'electron'
