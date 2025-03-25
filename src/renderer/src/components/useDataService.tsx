import { useState, useEffect } from 'react'
import { DataService, CsvTratoRow, SqliteTratoModel } from './DataService'

// Hook para usar o serviço em componentes React
export function useDataService(): {
  originalData: CsvTratoRow[]
  transformedData: SqliteTratoModel[]
} {
  const [originalData, setOriginalData] = useState<CsvTratoRow[]>(DataService.getOriginalData())
  const [transformedData, setTransformedData] = useState<SqliteTratoModel[]>(
    DataService.getTransformedData()
  )

  useEffect(() => {
    // Função para atualizar o estado
    const handleDataChange = (): void => {
      setOriginalData(DataService.getOriginalData())
      setTransformedData(DataService.getTransformedData())
    }

    // Registrar o listener
    DataService.addListener(handleDataChange)

    // Limpar o listener quando o componente for desmontado
    return (): void => {
      DataService.removeListener(handleDataChange)
    }
  }, [])

  return { originalData, transformedData }
}
