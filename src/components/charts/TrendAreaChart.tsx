'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Point = { year: number; value: number }

interface Props {
  data: Point[]
  color?: string
  unit?: string
  height?: number
}

export function TrendAreaChart({ data, color = '#F5A623', unit = '', height = 300 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
        <XAxis dataKey="year" stroke="#556080" tick={{ fontSize: 12 }} />
        <YAxis stroke="#556080" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}${unit}`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0D1220', border: '1px solid #2A3358', borderRadius: '8px' }}
          labelStyle={{ color: '#F0F4FF' }}
          itemStyle={{ color: '#F5A623' }}
          formatter={(value: number) => [`${value.toFixed(2)}${unit}`, 'Value']}
        />
        <Area type="monotone" dataKey="value" stroke={color} fill={`url(#gradient-${color.replace('#','')})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
