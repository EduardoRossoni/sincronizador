// Types for incoming data
interface Trato {
  id: number
  data_hr_trato: string
  external_id: number
  quantidade: number
  usa_horario: number // 0 or 1
  numero_trato: number
}

interface BatidaItem {
  id: number
  // Other properties for batidas
  [key: string]: unknown
}

interface LeituraFeitaSincItem {
  id: number
  // Other properties for leituraFeitaSinc
  [key: string]: unknown
}

interface IncomingData {
  tratos: Trato[]
  batidas?: BatidaItem[]
  leituraFeitaSinc?: LeituraFeitaSincItem[]
}

// Type for the transformed data
interface TratosGepecOutput {
  id: number // external_id
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

type TratoKeys = `Trato${1 | 2 | 3 | 4 | 5}`
type HoraKeys = `Hora${1 | 2 | 3 | 4 | 5}`

/**
 * Transforms tratos data into the format needed for Gepec
 * @param data - The incoming data with tratos array
 * @returns Transformed data in the specified format
 */
function transformTratosForGepec(data: IncomingData): TratosGepecOutput[] {
  if (!data.tratos || !Array.isArray(data.tratos) || data.tratos.length === 0) {
    return []
  }

  // Group tratos by external_id
  const tratosByExternalId: Record<number, Trato[]> = {}

  data.tratos.forEach((trato) => {
    if (!tratosByExternalId[trato.external_id]) {
      tratosByExternalId[trato.external_id] = []
    }
    tratosByExternalId[trato.external_id].push(trato)
  })

  // Transform the grouped data
  return Object.entries(tratosByExternalId).map(([externalIdStr, tratos]) => {
    const externalId = parseInt(externalIdStr)

    // Initialize the result object
    const result: TratosGepecOutput = {
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

    // Fill in data for each trato
    tratos.forEach((trato) => {
      const numeroTrato = trato.numero_trato
      result[`Trato${numeroTrato}` as TratoKeys] = trato.quantidade
      if (numeroTrato >= 1 && numeroTrato <= 5) {
        // Set quantidade
        result[`Trato${numeroTrato}` as TratoKeys] = trato.quantidade

        // Set hora if usa_horario is true (1)
        if (trato.usa_horario === 1 && trato.data_hr_trato) {
          try {
            const date = new Date(trato.data_hr_trato)
            // Format time as HH:MM:SS
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            const seconds = date.getSeconds().toString().padStart(2, '0')
            result[`Hora${numeroTrato}` as HoraKeys] = `${hours}:${minutes}:${seconds}`
            result[`Hora${numeroTrato}` as HoraKeys] = `${hours}:${minutes}:${seconds}`
          } catch (e) {
            console.error('Error parsing date:', e)
            ;(result as TratosGepecOutput)[`Hora${numeroTrato}`] = trato.data_hr_trato
          }
        }
      }
    })

    return result
  })
}

export { transformTratosForGepec }
