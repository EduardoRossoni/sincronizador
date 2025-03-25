import React, { useState, useEffect } from 'react'
import { useDataService } from './useDataService'

const TabletConnectionButton: React.FC = () => {
  const [isServerRunning, setIsServerRunning] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [serverPort, setServerPort] = useState<number>(3000)
  const [ipAddress, setIpAddress] = useState<string>('127.0.0.1')
  const [error, setError] = useState<string | null>(null)
  const { transformedData } = useDataService()

  // Verificar o status inicial do servidor e enviar dados quando disponíveis
  useEffect(() => {
    checkServerStatus()

    // Enviar dados transformados para o processo principal sempre que mudarem
    if (transformedData && transformedData.length > 0) {
      window.api.dataService.updateTransformedData(transformedData)
    }
  }, [transformedData])

  const checkServerStatus = async (): Promise<void> => {
    try {
      const status = await window.api.server.getServerStatus()
      setIsServerRunning(status.running)
      setServerPort(status.port)
      setIpAddress(status.ipAddress)
    } catch (err) {
      console.error('Erro ao verificar status do servidor:', err)
    }
  }

  const toggleServer = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      if (isServerRunning) {
        // Parar o servidor
        const result = await window.api.server.stopServer()
        if (result.success) {
          setIsServerRunning(false)
        } else {
          setError(result.error || 'Erro ao parar o servidor')
        }
      } else {
        // Iniciar o servidor
        const result = await window.api.server.startServer()
        if (result.success) {
          // Definir as informações do servidor
          setIsServerRunning(true)
          setServerPort(result.port || 3000)
          setIpAddress(result.ipAddress || '127.0.0.1')

          // Enviar dados transformados para o servidor se disponíveis
          if (transformedData && transformedData.length > 0) {
            window.api.dataService.updateTransformedData(transformedData)
          }
        } else {
          setError(result.error || 'Erro ao iniciar o servidor')
        }
      }
    } catch (err) {
      console.error('Erro:', err)
      setError('Ocorreu um erro ao manipular o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <button
        className="action-button"
        onClick={toggleServer}
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading
          ? 'Processando...'
          : isServerRunning
            ? `Fechar Conexão Tablet (${ipAddress}:${serverPort})`
            : 'Abrir Conexão Tablet'}
      </button>

      {/* {isServerRunning && !error && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#e6ffe6',
            borderRadius: '5px',
            color: '#006600',
            width: '100%'
          }}
        >
          <div>
            ✅ Servidor rodando em{' '}
            <strong>
              http://{ipAddress}:{serverPort}
            </strong>
          </div>
          <div style={{ marginTop: '5px', fontSize: '12px' }}>
            <span>API Endpoints:</span>
            <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
              <li>GET /api/status - Verificar status do servidor</li>
              <li>GET /api/tratos - Obter lista de tratos ({transformedData.length} registros)</li>
              <li>
                POST /api/tratos - Enviar dados do tablet (formato: {'{'} tratos: [...], batidas: [...], leituraFeitaSinc: {'{...}'} {'}'})
              </li>
            </ul>
          </div>
        </div>
      )} */}

      {error && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#ffe6e6',
            borderRadius: '5px',
            color: '#cc0000',
            width: '100%'
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}

export default TabletConnectionButton
