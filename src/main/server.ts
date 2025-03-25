import express from 'express'
import cors from 'cors'
import { app } from 'electron'
import { Server } from 'http' // <-- importar o tipo Server do 'http'

export class TabletServer {
  private app = express()
  private server: Server | null = null // <-- substituir 'any' por 'Server | null'
  private port = 3000
  private isRunning = false
  private tratoData: unknown[] = []

  constructor() {
    this.app.use(cors())
    this.app.use(express.json())

    this.setupRoutes()
  }

  private setupRoutes(): void {
    this.app.get('/api/tratos', (req, res) => {
      res.json(this.tratoData)
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

  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        reject(new Error('Servidor já está em execução na porta ' + this.port))
        return
      }

      try {
        this.server = this.app.listen(this.port, () => {
          this.isRunning = true
          console.log(`Servidor tablet iniciado na porta ${this.port}`)
          resolve(this.port)
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

  clearData(): void {
    this.tratoData = []
  }
}
