import React from 'react'

interface CsvRow {
  [key: string]: string
}

interface JsonViewerProps {
  data: CsvRow[]
  isOpen: boolean
  onClose: () => void
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, isOpen, onClose }) => {
  if (!isOpen) return null

  const jsonString = JSON.stringify(data, null, 2)

  const copyToClipboard = (): void => {
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        alert('Dados copiados para a área de transferência!')
      })
      .catch((err) => {
        console.error('Erro ao copiar: ', err)
        alert('Não foi possível copiar. Por favor, copie manualmente.')
      })
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '800px',
          maxHeight: '80vh',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}
        >
          <h3 style={{ margin: 0 }}>Visualizador de JSON</h3>
          <div>
            <button
              onClick={copyToClipboard}
              style={{
                backgroundColor: '#4a6da7',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              Copiar para Área de Transferência
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>

        <div
          style={{
            overflowY: 'auto',
            flex: '1',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            fontFamily: 'monospace',
            whiteSpace: 'pre',
            fontSize: '14px'
          }}
        >
          {jsonString}
        </div>
      </div>
    </div>
  )
}

export default JsonViewer
