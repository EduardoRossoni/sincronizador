import express from 'express'
import cors from 'cors'
import { app} from 'electron'
import { Server } from 'http'
import { networkInterfaces } from 'os'

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

  private setupRoutes(): void {
    // Endpoint para obter dados dos tratos convertidos do DataService
    this.app.get('/api/tratos', (req, res) => {
      // Retornar dados transformados diretamente
      res.json(this.transformedData)
    })

    this.app.post('/api/tratos', (req, res) => {
      const data = req.body
      console.log('Dados recebidos:', data)

      this.tratoData.push({
        ...data,
        receivedAt: new Date().toISOString()
      })

      res.json({
        success: true,
        message: 'Dados recebidos com sucesso!',
        timestamp: new Date().toISOString()
      })
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
