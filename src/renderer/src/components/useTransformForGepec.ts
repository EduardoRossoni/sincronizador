import { useState, useEffect, useCallback } from 'react'
import {
  TransformForGepecService,
  Trato,
  Batida,
  LeituraFeitaSinc,
  GepecData as ServiceGepecData,
  TratoTransformado
} from './TransformForGepecService'

// Interface para tipos compatíveis com os do preload
interface IpcGepecData {
  tratos: {
    id: number
    data: string | Date
    external_id: number
    quantidade: number
    usa_horario: boolean
    numero_trato: number
    [key: string]: unknown
  }[]
  batidas: Record<string, unknown>[]
  leituraFeitaSinc: Record<string, unknown>
}

// Hook para usar o serviço de transformação em componentes React
export function useTransformForGepec(): {
  tratoData: Trato[]
  tratoTransformadoData: TratoTransformado[]
  batidaData: Batida[]
  leituraFeitaSincData: LeituraFeitaSinc | null
  lastReceivedDate: string | null
  setGepecData: (data: ServiceGepecData) => void
  clearAllData: () => void
} {
  // Estados para os dados
  const [tratoData, setTratoData] = useState<Trato[]>(TransformForGepecService.getTratoData())

  const [tratoTransformadoData, setTratoTransformadoData] = useState<TratoTransformado[]>(
    TransformForGepecService.getTratoTransformadoData()
  )

  const [batidaData, setBatidaData] = useState<Batida[]>(TransformForGepecService.getBatidaData())

  const [leituraFeitaSincData, setLeituraFeitaSincData] = useState<LeituraFeitaSinc | null>(
    TransformForGepecService.getLeituraFeitaSincData()
  )

  const [lastReceivedDate, setLastReceivedDate] = useState<string | null>(
    TransformForGepecService.getLastReceivedDate()
  )

  // Função para atualizar o estado com os dados mais recentes do serviço
  const updateStatesFromService = useCallback(() => {
    console.log('useTransformForGepec: Atualizando estados a partir do serviço')
    setTratoData([...TransformForGepecService.getTratoData()])
    setTratoTransformadoData([...TransformForGepecService.getTratoTransformadoData()])
    setBatidaData([...TransformForGepecService.getBatidaData()])
    setLeituraFeitaSincData(TransformForGepecService.getLeituraFeitaSincData())
    setLastReceivedDate(TransformForGepecService.getLastReceivedDate())
  }, [])

  // Função para definir dados Gepec (encapsulando a chamada ao serviço)
  const setGepecData = useCallback((data: ServiceGepecData) => {
    console.log('useTransformForGepec: Definindo dados no serviço')
    TransformForGepecService.setGepecData(data)
  }, [])

  // Função para limpar todos os dados (encapsulando a chamada ao serviço)
  const clearAllData = useCallback(() => {
    console.log('useTransformForGepec: Limpando todos os dados')
    TransformForGepecService.clearAllData()
  }, [])

  useEffect(() => {
    console.log('useTransformForGepec: Configurando efeito')

    // Registrar o listener para mudanças no serviço
    TransformForGepecService.addListener(updateStatesFromService)

    // Configurar listener para dados recebidos do processo principal
    const unsubscribe = window.api.gepec.onGepecDataReceived((ipcData: IpcGepecData) => {
      console.log('Dados recebidos do servidor via IPC:', ipcData)

      // Converter os dados recebidos via IPC para o formato do serviço
      const serviceData: ServiceGepecData = {
        tratos: ipcData.tratos as Trato[],
        batidas: ipcData.batidas as Batida[],
        leituraFeitaSinc: ipcData.leituraFeitaSinc as LeituraFeitaSinc
      }

      // Atualizar o serviço com os novos dados
      TransformForGepecService.setGepecData(serviceData)
    })

    // Limpar os listeners quando o componente for desmontado
    return (): void => {
      console.log('useTransformForGepec: Limpando efeito')
      TransformForGepecService.removeListener(updateStatesFromService)
      unsubscribe()
    }
  }, [updateStatesFromService])

  // Retornar os dados e métodos para o componente
  return {
    tratoData,
    tratoTransformadoData,
    batidaData,
    leituraFeitaSincData,
    lastReceivedDate,
    setGepecData,
    clearAllData
  }
}
