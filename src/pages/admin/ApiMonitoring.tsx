import { useState, type ReactNode } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Table2 } from 'lucide-react'
import { api } from '@/api'
import { useApi } from '@/hooks/useApi'
import StatusBadge from '@/components/StatusBadge'
import { MockBadge, PageHeader, Skeleton, TableWrap, td, th } from '@/components/ui'
import { formatTime } from '@/lib/fields'

// Chart palette (validated reference palette, light mode).
const C = {
  series1: '#2a78d6', // blue — primary series
  series2: '#eb6834', // orange — second, independent chart
  grid: '#e5e7eb',
  axis: '#64748b',
  muted: '#cbd5e1',
}

const axisProps = { tick: { fill: C.axis, fontSize: 11 }, tickLine: false, axisLine: { stroke: C.grid } }

export default function ApiMonitoring() {
  const metrics = useApi(() => api.admin.metrics())
  const integ = useApi(() => api.admin.integrations())
  const events = useApi(() => api.admin.apiEvents())
  const [table, setTable] = useState(false)

  const m = metrics.data
  const totalReq = m?.reduce((a, x) => a + x.requests, 0) ?? 0
  const totalErr = m?.reduce((a, x) => a + x.errors, 0) ?? 0
  const errorSeries = m?.map((x) => ({ hour: x.hour, rate: Number(((x.errors / x.requests) * 100).toFixed(2)) }))
  const latency = integ.data?.map((i) => ({ name: i.api_name.replace(' API', ''), ms: i.response_time_ms ?? 0, status: i.api_status }))
  const nameOf = (id: string) => integ.data?.find((i) => i.integration_id === id)?.api_name ?? id

  return (
    <>
      <PageHeader title="API Monitoring" description="Traffic, reliability and latency of department APIs over the last 24 hours." actions={<MockBadge />} />

      {/* API status table */}
      <TableWrap>
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr><th className={th}>API</th><th className={th}>Status</th><th className={th}>Response</th><th className={th}>Requests today</th><th className={th}>Errors today</th><th className={th}>Uptime</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {integ.data?.map((i) => (
              <tr key={i.integration_id}>
                <td className={`${td} font-medium text-slate-900`}>{i.api_name}</td>
                <td className={td}><StatusBadge status={i.api_status} /></td>
                <td className={`${td} tabular-nums`}>{i.response_time_ms ? `${i.response_time_ms} ms` : <span className="font-medium text-red-700">Failed</span>}</td>
                <td className={`${td} tabular-nums`}>{i.requests_today.toLocaleString('en-IN')}</td>
                <td className={`${td} tabular-nums ${i.errors_today > 50 ? 'font-medium text-red-700' : ''}`}>{i.errors_today}</td>
                <td className={`${td} tabular-nums`}>{i.uptime_pct}%</td>
              </tr>
            )) ?? <tr><td colSpan={6} className="p-4"><Skeleton className="h-40" /></td></tr>}
          </tbody>
        </table>
      </TableWrap>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <div className="flex gap-6 text-sm">
          <div><span className="text-slate-500">Requests (24h) </span><span className="font-semibold text-slate-900 tabular-nums">{totalReq.toLocaleString('en-IN')}</span></div>
          <div><span className="text-slate-500">Success rate </span><span className="font-semibold text-slate-900 tabular-nums">{totalReq ? (((totalReq - totalErr) / totalReq) * 100).toFixed(2) : '–'}%</span></div>
        </div>
        <button className="btn-ghost text-xs" onClick={() => setTable((t) => !t)} aria-pressed={table}><Table2 className="size-4" aria-hidden />{table ? 'Show charts' : 'View as table'}</button>
      </div>

      {!m || !errorSeries || !latency ? (
        <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-72" />)}</div>
      ) : table ? (
        <TableWrap>
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-slate-200 bg-slate-50"><tr><th className={th}>Hour</th><th className={th}>Requests</th><th className={th}>Errors</th><th className={th}>Success rate</th><th className={th}>Median latency</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {m.map((x) => (
                <tr key={x.hour}><td className={td}>{x.hour}</td><td className={`${td} tabular-nums`}>{x.requests}</td><td className={`${td} tabular-nums`}>{x.errors}</td><td className={`${td} tabular-nums`}>{x.successRate}%</td><td className={`${td} tabular-nums`}>{x.p50} ms</td></tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="API requests" subtitle="Requests per hour, all APIs">
            <AreaChart data={m} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} axisLine={false} />
              <Tooltip content={<Tip unit=" requests" />} cursor={{ stroke: C.muted }} />
              <Area isAnimationActive={false} type="monotone" dataKey="requests" stroke={C.series1} strokeWidth={2} fill={C.series1} fillOpacity={0.12} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ChartCard>

          <ChartCard title="Success rate" subtitle="Share of requests returning 2xx">
            <LineChart data={m} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} axisLine={false} domain={[95, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<Tip unit="%" />} cursor={{ stroke: C.muted }} />
              <Line isAnimationActive={false} type="monotone" dataKey="successRate" stroke={C.series1} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ChartCard>

          <ChartCard title="Error rate" subtitle="Failed requests per hour (%) — spike reflects Certificate API outage">
            <BarChart data={errorSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<Tip unit="% errors" />} cursor={{ fill: '#f1f5f9' }} />
              <Bar isAnimationActive={false} dataKey="rate" fill={C.series2} radius={[4, 4, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Response time" subtitle="Current response time by API (ms)">
            <BarChart data={latency} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} horizontal={false} />
              <XAxis type="number" {...axisProps} />
              <YAxis type="category" dataKey="name" {...axisProps} axisLine={false} width={86} />
              <Tooltip content={<Tip unit=" ms" />} cursor={{ fill: '#f1f5f9' }} />
              <Bar isAnimationActive={false} dataKey="ms" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {latency.map((l) => <Cell key={l.name} fill={l.status === 'Offline' ? C.muted : C.series1} />)}
                <LabelList dataKey="ms" position="right" formatter={(v) => (Number(v) ? `${v} ms` : 'Failed')} style={{ fill: '#334155', fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ChartCard>
        </div>
      )}

      <section className="card mt-6">
        <h2 className="section-title border-b border-slate-200 px-5 py-3">Recent requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50"><tr><th className={th}>Time</th><th className={th}>Request</th><th className={th}>API</th><th className={th}>Endpoint</th><th className={th}>Status</th><th className={th}>Latency</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {events.data?.slice(0, 12).map((e) => (
                <tr key={e.request_id}>
                  <td className={`${td} tabular-nums`}>{formatTime(e.at)}</td>
                  <td className={td}><code className="text-xs">{e.request_id}</code></td>
                  <td className={td}>{nameOf(e.integration_id)}</td>
                  <td className={td}><code className="text-xs text-slate-500">{e.method} {e.endpoint}</code></td>
                  <td className={td}><span className={`font-medium ${e.status_code < 400 ? 'text-emerald-700' : 'text-red-700'}`}>{e.status_code < 400 ? '✓' : '✕'} {e.status_code}</span></td>
                  <td className={`${td} tabular-nums`}>{e.status_code < 400 ? `${e.latency_ms} ms` : 'timeout'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <figure className="card p-4">
      <figcaption>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </figcaption>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">{children as React.ReactElement}</ResponsiveContainer>
      </div>
    </figure>
  )
}

function Tip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number; payload: Record<string, unknown> }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  const name = (p.payload.name as string | undefined) ?? label
  const failed = unit === ' ms' && !p.value
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="text-slate-500">{name}</div>
      <div className="mt-0.5 font-semibold text-slate-900 tabular-nums">{failed ? 'Failed — no response' : `${p.value.toLocaleString('en-IN')}${unit}`}</div>
    </div>
  )
}
