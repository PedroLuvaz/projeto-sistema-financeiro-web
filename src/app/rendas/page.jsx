'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import MonthSelector from '@/components/MonthSelector'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { Plus, Pencil, Trash2, TrendingUp, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

const emptyForm = { Descricao_Renda: '', Valor_Renda: '', Data: '' }

export default function Rendas() {
  const { user } = useAuth()
  const router = useRouter()
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [rendas, setRendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get(`/rendas/usuario/${user.Id_Usuario}`, { params: { mes, ano } })
      setRendas(data.data)
    } catch { }
    setLoading(false)
  }, [user, mes, ano])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setForm({ ...emptyForm, Data: `${ano}-${String(mes).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` })
    setEditing(null); setError(''); setModal(true)
  }
  const openEdit = (r) => {
    setForm({ Descricao_Renda: r.Descricao_Renda, Valor_Renda: r.Valor_Renda, Data: r.Data })
    setEditing(r); setError(''); setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) {
        await api.put(`/rendas/${editing.Id_Renda}`, form)
      } else {
        await api.post('/rendas', { ...form, Id_Usuario: user.Id_Usuario })
      }
      setModal(false); fetchData()
    } catch (err) { setError(err.response?.data?.error || 'Erro ao salvar') }
    setSaving(false)
  }

  const handleDelete = async (r) => {
    if (!confirm(`Deletar "${r.Descricao_Renda}"?`)) return
    try { await api.delete(`/rendas/${r.Id_Renda}`); fetchData() } catch { }
  }

  const filtered = rendas.filter(r => !searchTerm || r.Descricao_Renda?.toLowerCase().includes(searchTerm.toLowerCase()))
  const total = filtered.reduce((s, r) => s + Number(r.Valor_Renda), 0)

  if (!user) return null
  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}><LoadingSpinner /></div></Layout>

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Rendas</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>Gerencie suas fontes de receita</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <MonthSelector mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
            <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nova Renda</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 320, marginBottom: 20 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 36, margin: 0 }} placeholder="Buscar rendas..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* Total */}
        <div className="glass-card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>{filtered.length} renda{filtered.length !== 1 ? 's' : ''}</span>
          <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '1.1rem' }}>{formatCurrency(total)}</span>
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.Id_Renda}>
                    <td style={{ fontWeight: 600 }}>{r.Descricao_Renda}</td>
                    <td>{formatDate(r.Data)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(r.Valor_Renda)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="btn-icon" onClick={() => openEdit(r)} title="Editar"><Pencil size={15} /></button>
                        <button className="btn-icon" onClick={() => handleDelete(r)} title="Deletar"
                          style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon={TrendingUp} title="Sem rendas" description="Nenhuma renda registrada neste mês"
          action={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> Adicionar Renda</button>} />}

        {/* Modal */}
        {modal && (
          <Modal title={editing ? 'Editar Renda' : 'Nova Renda'} onClose={() => setModal(false)}>
            <form onSubmit={handleSave}>
              {error && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)', fontSize: '.85rem' }}>{error}</div>}
              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Descrição</label>
                <input className="input-field" required value={form.Descricao_Renda}
                  onChange={e => setForm({ ...form, Descricao_Renda: e.target.value })} placeholder="Ex: Salário, Freelance..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label className="input-label">Valor (R$)</label>
                  <input className="input-field" type="number" step="0.01" min="0.01" required
                    value={form.Valor_Renda} onChange={e => setForm({ ...form, Valor_Renda: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">Data</label>
                  <input className="input-field" type="date" required value={form.Data}
                    onChange={e => setForm({ ...form, Data: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar Renda'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
