import React, { useState } from 'react'
import { useDataService } from './useDataService'

const DadosSalvosButton: React.FC = () => {
  const { originalData, transformedData } = useDataService()
  const [dataView, setDataView] = useState<'original' | 'transformed'>('transformed')
  const [showData, setShowData] = useState<boolean>(false)

  const handleClick = (): void => {
    setShowData(!showData)
  }

  console.log('Dados originais:', originalData)

  const toggleDataView = (): void => {
    setDataView(dataView === 'original' ? 'transformed' : 'original')
  }

  const copyToClipboard = (): void => {
    const data = dataView === 'original' ? originalData : transformedData
    const jsonString = JSON.stringify(data, null, 2)

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
    <div style={{ width: '100%' }}>
      <button className="action-button" onClick={handleClick} style={{ width: '100%' }}>
        Dados Salvos
      </button>

      {showData && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '5px',
            width: '100%'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <h3 style={{ margin: 0 }}>
              {dataView === 'original' ? 'Dados Originais CSV' : 'Dados Transformados SQLite'}
            </h3>
            <div>
              <button
                onClick={toggleDataView}
                style={{
                  backgroundColor: '#4a6da7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              >
                Ver {dataView === 'original' ? 'SQLite' : 'CSV'}
              </button>

              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: '#4a6da7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Copiar JSON
              </button>
            </div>
          </div>

          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px',
              backgroundColor: 'white',
              maxHeight: '300px',
              overflowY: 'auto',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          >
            {dataView === 'original' ? (
              originalData.length > 0 ? (
                <pre>{JSON.stringify(originalData.slice(0, 5), null, 2)}</pre>
              ) : (
                <p>Nenhum dado original carregado.</p>
              )
            ) : transformedData.length > 0 ? (
              <pre>{JSON.stringify(transformedData.slice(0, 10), null, 2)}</pre>
            ) : (
              <p>Nenhum dado transformado disponível.</p>
            )}
          </div>

          <div style={{ marginTop: '10px' }}>
            <p>
              {dataView === 'original'
                ? `${originalData.length} registros CSV carregados.`
                : `${transformedData.length} registros SQLite gerados.`}
              {dataView === 'original' && originalData.length > 5
                ? ' Mostrando os 5 primeiros.'
                : dataView === 'transformed' && transformedData.length > 10
                  ? ' Mostrando os 10 primeiros.'
                  : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DadosSalvosButton
