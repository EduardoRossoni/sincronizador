// DataService.ts - Serviço para gerenciar dados globais

// Tipo para os dados originais do CSV
export interface CsvTratoRow {
  [key: string]: string
}

// Tipo para o formato de destino do SQLite
export interface SqliteTratoModel {
  id?: number
  external_id: number
  data_hr_trato: string
  usa_horario: number
  quantidade: number
  previsto: number
  numero_trato: number
  numero_animais: number
  peso: number
  custo: number
  media_consumo: number
  mspv: number
  ms: number
  dieta_id: number
  lote_id: number
  baia_id: number
  batida_id: number | null
  usuario_id: number | null
  tratador_id: number | null
  sincronizado: number
  realizado_sistema: number
}

// Classe singleton para gerenciar o estado dos dados
class DataServiceClass {
  private originalData: CsvTratoRow[] = []
  private transformedData: SqliteTratoModel[] = []
  private listeners: (() => void)[] = []

  // Método para definir os dados CSV originais
  setOriginalData(data: CsvTratoRow[]): void {
    this.originalData = data
    this.transformedData = this.transformDataForSqlite(data)
    this.notifyListeners()
  }

  // Método para obter os dados CSV originais
  getOriginalData(): CsvTratoRow[] {
    return this.originalData
  }

  // Método para obter os dados transformados para SQLite
  getTransformedData(): SqliteTratoModel[] {
    return this.transformedData
  }

  // Método para adicionar um listener
  addListener(listener: () => void): void {
    this.listeners.push(listener)
  }

  // Método para remover um listener
  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  // Método para notificar todos os listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }

  // Método para transformar os dados do CSV para o formato SQLite
  private transformDataForSqlite(csvData: CsvTratoRow[]): SqliteTratoModel[] {
    const sqliteData: SqliteTratoModel[] = []

    csvData.forEach((row) => {
      // Processar os tratos (até 5 possíveis)
      for (let i = 1; i <= 5; i++) {
        const tratoKey = `Trato${i}`
        const horaKey = `Hora${i}`
        const previstoKey = `previsto${i}`
        const batidaIdKey = `BatidaID${i}`

        // Se o trato tiver valor (diferente de 0 e não vazio)
        if (row[tratoKey] && row[tratoKey] !== '0') {
          // Extrair a data do trato
          let dataHoraTrato = row.DatLeitura || ''

          // Se houver hora específica, adicionar à data
          if (row[horaKey]) {
            dataHoraTrato = row[horaKey] // A hora já inclui a data no formato "DD/MM/YY HH:MM:SS"
          }

          // Criar modelo para o SQLite
          const sqliteModel: SqliteTratoModel = {
            external_id: parseInt(row.IndiceTratosID) || 0,
            data_hr_trato: dataHoraTrato,
            usa_horario: row[horaKey] ? 1 : 0,
            quantidade: parseInt(row[tratoKey]) || 0,
            previsto: parseInt(row[previstoKey]) || 0,
            numero_trato: i,
            numero_animais: parseInt(row.NrAnimais) || 0,
            peso: parseFloat(row.PesoMedio) || 0,
            custo: parseFloat(row.CustoRacao) || 0,
            media_consumo: 0, // Não encontrado no CSV
            mspv: 0, // Não encontrado no CSV
            ms: parseFloat(row.FrMatSeca) / 100 || 0, // Assumindo que FrMatSeca é porcentagem
            dieta_id: parseInt(row.ReceitaId) || 0,
            lote_id: parseInt(row.LoteID) || 0,
            baia_id: parseInt(row.BaiaID) || 0,
            batida_id: row[batidaIdKey] ? parseInt(row[batidaIdKey]) : null,
            usuario_id: row.UserRegisto ? 1 : null, // Valor padrão se houver registro
            tratador_id: row.TratadorID ? parseInt(row.TratadorID) : null,
            sincronizado: 0, // Valor padrão
            realizado_sistema: 1 // Assumindo que foi realizado pelo sistema
          }

          sqliteData.push(sqliteModel)
        }
      }
    })

    return sqliteData
  }
}

// Instância única do serviço
export const DataService = new DataServiceClass()

// Hook para usar o serviço em componentes React
// Removido o hook useDataService para um arquivo separado
