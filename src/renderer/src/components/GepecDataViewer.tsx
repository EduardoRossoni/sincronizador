import React, { useState, useEffect } from 'react'
import { useTransformForGepec } from './useTransformForGepec'

const GepecDataViewer: React.FC = () => {
  const {
    tratoData,
    tratoTransformadoData,
    batidaData,
    leituraFeitaSincData,
    lastReceivedDate,
    clearAllData
  } = useTransformForGepec()

  const [showData, setShowData] = useState<boolean>(false)
  const [dataView, setDataView] = useState<'tratos' | 'batidas' | 'leitura'>('tratos')
  const [count, setCount] = useState<number>(0)

  // Use um efeito para atualizar o contador quando os dados mudarem
  useEffect(() => {
    const total = tratoData.length + batidaData.length
    setCount(total)
    console.log('GepecDataViewer: Dados atualizados', {
      tratoData: tratoData.length,
      batidaData: batidaData.length,
      total
    })
  }, [tratoData, batidaData])

  const handleClick = (): void => {
    setShowData(!showData)
  }

  const toggleDataView = (view: 'tratos' | 'batidas' | 'leitura'): void => {
    setDataView(view)
  }

  const copyToClipboard = (): void => {
    let data

    switch (dataView) {
      case 'tratos':
        data = tratoTransformadoData
        break
      case 'batidas':
        data = batidaData
        break
      case 'leitura':
        data = leituraFeitaSincData
        break
      default:
        data = []
        break
    }

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

  // Função para determinar se há dados para exibir
  const hasData = (): boolean => {
    return tratoData.length > 0 || batidaData.length > 0 || leituraFeitaSincData !== null
  }

  // Função para renderizar o conteúdo do painel de dados
  const renderContent = (): JSX.Element | null => {
    if (dataView === 'tratos') {
      return tratoData.length > 0 ? (
        <pre>{JSON.stringify(tratoData.slice(0, 5), null, 2)}</pre>
      ) : (
        <p>Nenhum dado de trato recebido.</p>
      )
    } else if (dataView === 'batidas') {
      return batidaData.length > 0 ? (
        <pre>{JSON.stringify(batidaData.slice(0, 5), null, 2)}</pre>
      ) : (
        <p>Nenhum dado de batida recebido.</p>
      )
    } else if (dataView === 'leitura') {
      return leituraFeitaSincData ? (
        <pre>{JSON.stringify(leituraFeitaSincData, null, 2)}</pre>
      ) : (
        <p>Nenhum dado de leitura feita sinc recebido.</p>
      )
    }
    return <p>Selecione uma categoria de dados para visualizar.</p>
  }

  return (
    <div style={{ width: '100%' }}>
      <button className="action-button" onClick={handleClick} style={{ width: '100%' }}>
        Dados Gepec {hasData() ? `(${count})` : ''}
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
              marginBottom: '10px',
              flexWrap: 'wrap'
            }}
          >
            <h3 style={{ margin: 0 }}>
              {dataView === 'tratos'
                ? 'Tratos Recebidos'
                : dataView === 'batidas'
                  ? 'Batidas Recebidas'
                  : 'Leitura Feita Sinc'}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
              <button
                onClick={() => toggleDataView('tratos')}
                style={{
                  backgroundColor: dataView === 'tratos' ? '#2a4d69' : '#4a6da7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Tratos ({tratoData.length})
              </button>

              <button
                onClick={() => toggleDataView('batidas')}
                style={{
                  backgroundColor: dataView === 'batidas' ? '#2a4d69' : '#4a6da7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Batidas ({batidaData.length})
              </button>

              <button
                onClick={() => toggleDataView('leitura')}
                style={{
                  backgroundColor: dataView === 'leitura' ? '#2a4d69' : '#4a6da7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Leitura
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

              <button
                onClick={clearAllData}
                style={{
                  backgroundColor: '#d9534f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Limpar
              </button>
            </div>
          </div>

          {lastReceivedDate && (
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
              Última atualização: {new Date(lastReceivedDate).toLocaleString()}
            </div>
          )}

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
            {renderContent()}
          </div>

          <div style={{ marginTop: '10px', fontSize: '13px' }}>
            {dataView === 'tratos' && tratoData.length > 5 && (
              <p>Mostrando 5 de {tratoData.length} tratos.</p>
            )}
            {dataView === 'batidas' && batidaData.length > 5 && (
              <p>Mostrando 5 de {batidaData.length} batidas.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GepecDataViewer
