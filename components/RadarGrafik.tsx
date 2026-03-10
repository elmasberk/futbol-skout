'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface Props {
  veri: { metrik: string; deger: number }[]
  renk?: string
}

export default function RadarGrafik({ veri, renk = '#16a34a' }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={veri}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="metrik"
          tick={{ fontSize: 11, fill: '#6b7280' }}
        />
        <Radar
          name="İstatistik"
          dataKey="deger"
          stroke={renk}
          fill={renk}
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(val: number) => [`${val.toFixed(0)}`, '']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
