'use client'

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { PromedioJugador } from '@/lib/types'

interface RadarChartProps {
  data: PromedioJugador | null
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { subject: string; value: number } }[] }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-gray-900 border border-cyan-400/40 rounded-lg px-4 py-2 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
        <p className="text-cyan-400 font-bold">{d.subject}</p>
        <p className="text-white text-lg font-black">{d.value} <span className="text-gray-400 text-sm font-normal">/ 10</span></p>
      </div>
    )
  }
  return null
}

export default function RadarChartComponent({ data }: RadarChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <p>Sin datos suficientes</p>
        </div>
      </div>
    )
  }

  const chartData = [
    { subject: 'Ataque',      value: Number(data.avg_ataque)      || 0 },
    { subject: 'Defensa',     value: Number(data.avg_defensa)     || 0 },
    { subject: 'Dribling',    value: Number(data.avg_dribling)    || 0 },
    { subject: 'Habilidad',   value: Number(data.avg_habilidad)   || 0 },
    { subject: 'Lanzamiento', value: Number(data.avg_lanzamiento) || 0 },
    { subject: 'Actitud',     value: Number(data.avg_actitud)     || 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={380}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
        <PolarGrid
          gridType="polygon"
          stroke="rgba(0,243,255,0.15)"
          strokeWidth={1}
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#e2e8f0', fontSize: 13, fontWeight: 600 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickCount={6}
          stroke="rgba(0,243,255,0.1)"
          axisLine={false}
        />
        <Radar
          name={data.nombre}
          dataKey="value"
          stroke="#00f3ff"
          fill="#00f3ff"
          fillOpacity={0.15}
          strokeWidth={2.5}
          dot={{ fill: '#00f3ff', r: 5, strokeWidth: 0 }}
          activeDot={{ fill: '#fff', stroke: '#00f3ff', r: 7, strokeWidth: 2 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}
