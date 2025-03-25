import React, { useRef, useState } from 'react'
import { DataService, CsvTratoRow } from './DataService'

const BuscarDadosGepec: React.FC = () => {
  // Estados para controlar a exibição
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dataCount, setDataCount] = useState<number>(0)

  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para lidar com a seleção de arquivos
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files

    // Resetar estados
    setLoading(true)
    setSuccess(false)
    setError(null)
    setDataCount(0)

    if (files && files.length > 0) {
      const file = files[0]

      // Verificar se é um arquivo CSV ou TXT
      if (
        file.type === 'text/csv' ||
        file.name.endsWith('.csv') ||
        file.type === 'text/plain' ||
        file.name.endsWith('.txt')
      ) {
        try {
          // Ler o conteúdo do arquivo
          const text = await readFileAsText(file)

          // Converter CSV para JSON
          const jsonData = parseCSV(text)

          // Salvar dados no serviço global
          DataService.setOriginalData(jsonData)

          // Atualizar estados
          setDataCount(jsonData.length)
          setSuccess(true)

          // Imprimir no console
          console.log('Dados processados:', jsonData)
          console.log('Dados transformados:', DataService.getTransformedData())

          // Mostrar alerta com os primeiros 3 itens do JSON
          const previewData = jsonData.slice(0, 3)
          alert(
            `CSV processado! ${jsonData.length} registros lidos.\nExemplo (3 primeiros):\n${JSON.stringify(previewData, null, 2)}`
          )
        } catch (error) {
          console.error('Erro ao processar o arquivo:', error)
          setError(
            `Erro ao processar o arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          )
        }
      } else {
        setError('Por favor, selecione um arquivo CSV ou TXT válido.')
        console.error('Por favor, selecione um arquivo CSV ou TXT válido.')
      }
    }

    // Resetar o valor do input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setLoading(false)
  }

  // Função para ler o arquivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event): void => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result)
        } else {
          reject(new Error('Falha ao ler o arquivo'))
        }
      }

      reader.onerror = (): void => {
        reject(new Error('Erro ao ler o arquivo'))
      }

      // Tentar com codificação Latin1/Windows-1252 que é comum em sistemas Windows
      reader.readAsText(file, 'cp1252')
    })
  }

  // Função para converter CSV para JSON
  const parseCSV = (csvContent: string): CsvTratoRow[] => {
    // Dividir o texto em linhas
    const lines = csvContent.split('\n')

    if (lines.length === 0) {
      throw new Error('O arquivo está vazio')
    }

    // A primeira linha contém os cabeçalhos
    const headerLine = lines[0]

    // Dividir a linha de cabeçalho corretamente
    const headers = headerLine.split(',').map((header) => header.trim())

    // Array para armazenar os objetos JSON
    const result: CsvTratoRow[] = []

    // Processar cada linha (exceto a primeira que é o cabeçalho)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // Pular linhas vazias

      // Processar a linha atual
      const values = line.split(',')
      const obj: Record<string, string> = {}

      // Adicionar cada valor no objeto, usando o cabeçalho correspondente como chave
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = j < values.length ? values[j].trim() : ''
      }

      result.push(obj)
    }

    return result
  }

  // Função para acionar o diálogo de seleção de arquivos
  const triggerFileSelection = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <button
        className="action-button"
        onClick={triggerFileSelection}
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading ? 'Processando...' : 'Buscar Dados Gepec'}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv,.txt"
        style={{ display: 'none' }}
      />

      {success && (
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
            Dados processados com sucesso! {dataCount} registros foram encontrados e transformados
            para o formato SQLite.
          </div>
        </div>
      )}

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

export default BuscarDadosGepec
