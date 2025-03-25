// TransformForGepecService.ts - Serviço para gerenciar dados recebidos do tablet

// Tipos para os dados recebidos
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

export interface GepecData {
  tratos: Trato[]
  batidas: Batida[]
  leituraFeitaSinc: LeituraFeitaSinc
}

// Interface para o formato transformado dos tratos
export interface TratoTransformado {
  id: number
  Trato1: number
  Trato2: number
  Trato3: number
  Trato4: number
  Trato5: number
  Hora1: string
  Hora2: string
  Hora3: string
  Hora4: string
  Hora5: string
}

// Classe singleton para gerenciar os dados do Gepec
class TransformForGepecServiceClass {
  private tratoData: Trato[] = []
  private tratoTransformadoData: TratoTransformado[] = []
  private batidaData: Batida[] = []
  private leituraFeitaSincData: LeituraFeitaSinc | null = null
  private lastReceivedDate: string | null = null
  private listeners: (() => void)[] = []

  // Método para definir os dados recebidos do tablet
  setGepecData(data: GepecData): void {
    console.log('TransformForGepecService: Recebendo novos dados', data)

    if (data.tratos && Array.isArray(data.tratos)) {
      this.tratoData = [...data.tratos]
      // Transformar os dados de tratos
      this.tratoTransformadoData = this.transformarTratos(data.tratos)
    }

    if (data.batidas && Array.isArray(data.batidas)) {
      this.batidaData = [...data.batidas]
    }

    if (data.leituraFeitaSinc) {
      this.leituraFeitaSincData = { ...data.leituraFeitaSinc }
    }

    this.lastReceivedDate = new Date().toISOString()

    console.log('TransformForGepecService: Dados atualizados', {
      tratos: this.tratoData.length,
      tratosTransformados: this.tratoTransformadoData.length,
      batidas: this.batidaData.length,
      leituraFeitaSinc: !!this.leituraFeitaSincData,
      timestamp: this.lastReceivedDate,
      listeners: this.listeners.length
    })

    // Notificar todos os ouvintes sobre a alteração de dados
    this.notifyListeners()
  }

  // Método para transformar os tratos para o formato desejado
  transformarTratos(tratos: Trato[]): TratoTransformado[] {
    console.log('TransformForGepecService: Transformando tratos', tratos.length)

    if (!tratos || tratos.length === 0) {
      return []
    }

    // Agrupar tratos por external_id
    const agrupadosPorExternalId: Record<number, Trato[]> = {}

    // Primeiro, vamos agrupar todos os tratos por external_id
    tratos.forEach((trato) => {
      if (!agrupadosPorExternalId[trato.external_id]) {
        agrupadosPorExternalId[trato.external_id] = []
      }
      agrupadosPorExternalId[trato.external_id].push(trato)
    })

    console.log(
      'TransformForGepecService: Tratos agrupados por external_id',
      Object.keys(agrupadosPorExternalId).length
    )

    // Para cada grupo de external_id, criar um objeto TratoTransformado
    const resultado: TratoTransformado[] = Object.keys(agrupadosPorExternalId).map(
      (externalIdStr) => {
        const externalId = parseInt(externalIdStr)
        const tratosDoGrupo = agrupadosPorExternalId[externalId]

        // Inicializar o objeto de resultado
        const tratoTransformado: TratoTransformado = {
          id: externalId,
          Trato1: 0,
          Trato2: 0,
          Trato3: 0,
          Trato4: 0,
          Trato5: 0,
          Hora1: '',
          Hora2: '',
          Hora3: '',
          Hora4: '',
          Hora5: ''
        }

        // Preencher os valores para cada trato do grupo
        tratosDoGrupo.forEach((trato) => {
          const numeroTrato = trato.numero_trato

          // Verificar se é um número de trato válido (1-5)
          if (numeroTrato >= 1 && numeroTrato <= 5) {
            // Atribuir a quantidade ao campo correspondente
            tratoTransformado[`Trato${numeroTrato}`] = trato.quantidade

            // Se usa_horario for true, extrair e formatar o horário
            if (trato.usa_horario) {
              const dataObj = new Date(trato.data)
              const horas = dataObj.getHours().toString().padStart(2, '0')
              const minutos = dataObj.getMinutes().toString().padStart(2, '0')
              const segundos = dataObj.getSeconds().toString().padStart(2, '0')

              tratoTransformado[`Hora${numeroTrato}`] = `${horas}:${minutos}:${segundos}`
            }
          }
        })

        return tratoTransformado
      }
    )

    console.log('TransformForGepecService: Tratos transformados', resultado.length)
    return resultado
  }

  // Método para obter os dados de tratos originais
  getTratoData(): Trato[] {
    return this.tratoData
  }

  // Método para obter os dados de tratos transformados
  getTratoTransformadoData(): TratoTransformado[] {
    return this.tratoTransformadoData
  }

  // Método para obter os dados de batidas
  getBatidaData(): Batida[] {
    return this.batidaData
  }

  // Método para obter os dados de leitura feita sinc
  getLeituraFeitaSincData(): LeituraFeitaSinc | null {
    return this.leituraFeitaSincData
  }

  // Método para obter a data da última recepção de dados
  getLastReceivedDate(): string | null {
    return this.lastReceivedDate
  }

  // Método para limpar todos os dados
  clearAllData(): void {
    console.log('TransformForGepecService: Limpando todos os dados')
    this.tratoData = []
    this.tratoTransformadoData = []
    this.batidaData = []
    this.leituraFeitaSincData = null
    this.lastReceivedDate = null
    this.notifyListeners()
  }

  // Método para adicionar um listener
  addListener(listener: () => void): void {
    if (typeof listener === 'function' && !this.listeners.includes(listener)) {
      this.listeners.push(listener)
      console.log('TransformForGepecService: Listener adicionado. Total:', this.listeners.length)
    }
  }

  // Método para remover um listener
  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
    console.log('TransformForGepecService: Listener removido. Total:', this.listeners.length)
  }

  // Método para notificar todos os listeners
  private notifyListeners(): void {
    console.log('TransformForGepecService: Notificando', this.listeners.length, 'listeners')
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  }
}

// Instância única do serviço
export const TransformForGepecService = new TransformForGepecServiceClass()
