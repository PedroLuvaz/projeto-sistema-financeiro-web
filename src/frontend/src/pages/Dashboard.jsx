import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import MonthSelector from '../components/MonthSelector'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { formatCurrency, formatDate, CATEGORY_COLORS, CHART_COLORS } from '../utils/helpers'
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  LayoutDashboard, Receipt
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [resumo, setResumo] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchResumo = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/dashboard/usuario/${user.Id_Usuario}/resumo-mensal`, { params: { mes, ano } })
      setResumo(data.data)
    } catch { setResumo(null) }
    setLoading(false)
  }, [user, mes, ano])

  useEffect(() => { fetchResumo() }, [fetchResumo])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}><LoadingSpinner /></div>

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem' }}>
            Olá, <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{user?.Nome?.split(' ')[0]}</span>! Aqui está seu resumo financeiro.
          </p>
        </div>
        <MonthSelector mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard
          icon={TrendingUp} label="Total Rendas" color="emerald"
          value={formatCurrency(resumo?.total_rendas || 0)}
          sub={<><ArrowUpRight size={14} /> Receitas do mês</>}
        />
        <StatCard
          icon={TrendingDown} label="Total Despesas" color="rose"
          value={formatCurrency(resumo?.total_despesas || 0)}
          sub={<><ArrowDownRight size={14} /> Gastos do mês</>}
        />
        <StatCard
          icon={Wallet} label="Saldo Líquido"
          color={(resumo?.saldo_liquido || 0) >= 0 ? 'indigo' : 'rose'}
          value={formatCurrency(resumo?.saldo_liquido || 0)}
          sub={<>{(resumo?.saldo_liquido || 0) >= 0 ? 'Positivo' : 'Negativo'}</>}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 32 }}>
        {/* Pie Chart - Despesas por Categoria */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={18} style={{ color: 'var(--color-primary-light)' }} />
            Despesas por Categoria
          </h3>
          {resumo?.despesas_por_categoria?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={resumo.despesas_por_categoria.map(c => ({ name: c.categoria, value: Number(c.total) }))}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                  paddingAngle={3} dataKey="value" stroke="none"
                >
                  {resumo.despesas_por_categoria.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: '.85rem' }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Legend
                  wrapperStyle={{ fontSize: '.8rem', color: '#94a3b8' }}
                  formatter={(val) => <span style={{ color: '#cbd5e1' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={Receipt} title="Sem despesas" description="Nenhuma despesa registrada neste mês" />}
        </div>

        {/* Top 5 Despesas */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutDashboard size={18} style={{ color: 'var(--color-primary-light)' }} />
            Top 5 Maiores Despesas
          </h3>
          {resumo?.top_5_despesas?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {resumo.top_5_despesas.map((d, i) => (
                <div key={d.Id_Despesa || i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.85rem',
                    background: `${CHART_COLORS[i]}22`, color: CHART_COLORS[i], flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.Descricao_Despesa}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="badge badge-default" style={{ fontSize: '.7rem', padding: '1px 6px' }}>{d.Categoria}</span>
                      {d.conta?.Nome_Conta && <span>{d.conta.Nome_Conta}</span>}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '.95rem', flexShrink: 0 }}>
                    {formatCurrency(d.Valor_Parcela)}
                  </span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Receipt} title="Sem despesas" description="Nenhuma despesa para exibir" />}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.06)',
        }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>{sub}</div>
    </div>
  )
}
