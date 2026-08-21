export interface Jugador {
  id: string
  nombre: string
  pin: string
}

export interface Evaluacion {
  id?: string
  votante_id: string
  evaluado_id: string
  ataque: number
  defensa: number
  dribling: number
  habilidad: number
  lanzamiento: number
  actitud: number
  created_at?: string
}

export interface PromedioJugador {
  jugador_id: string
  nombre: string
  avg_ataque: number
  avg_defensa: number
  avg_dribling: number
  avg_habilidad: number
  avg_lanzamiento: number
  avg_actitud: number
  total_votos: number
  avg_general: number
}

export type MetricKey = 'ataque' | 'defensa' | 'dribling' | 'habilidad' | 'lanzamiento' | 'actitud'

export const METRIC_LABELS: Record<MetricKey, string> = {
  ataque:     'Ataque',
  defensa:    'Defensa',
  dribling:   'Dribling',
  habilidad:  'Habilidad',
  lanzamiento:'Lanzamiento',
  actitud:    'Actitud',
}

export const METRIC_ICONS: Record<MetricKey, string> = {
  ataque:     '',
  defensa:    '',
  dribling:   '',
  habilidad:  '',
  lanzamiento:'',
  actitud:    '',
}
