'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { Plus, Pencil, Trash2, CreditCard, Banknote, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'

const TIPOS = ['Corrente', 'Crédito', 'Dinheiro']
const TIPO_ICONS = { Corrente: Banknote, Crédito: CreditCard, Dinheiro: Wallet }
const CORES_PRESET = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8A05BE', '#1A1A2E', '#0F3460']

const emptyForm = { Nome_Conta: '', Tipo: 'Corrente', Titular: '', Ultimos_Digitos: '', Cor_Hex: '#6366f1' }

export default function Contas() {
  const { user } = useAuth()
  const router = useRouter()
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get(`/contas-cartoes/usuario/${user.Id_Usuario}`)
      setContas(data.data)
    } catch { }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setForm({ ...emptyForm, Titular: user.Nome }); setEditing(null); setError(''); setModal(true) }
  const openEdit = (c) => {
    setForm({ Nome_Conta: c.Nome_Conta, Tipo: c.Tipo, Titular: c.Titular, Ultimos_Digitos: c.Ultimos_Digitos || '', Cor_Hex: c.Cor_Hex })
    setEditing(c); setError(''); setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const body = { ...form, Ultimos_Digitos: form.Ultimos_Digitos || null }
      if (editing) { await api.put(`/contas-cartoes/${editing.Id_Conta}`, body) }
      else { await api.post('/contas-cartoes', { ...body, Id_Usuario: user.Id_Usuario }) }
      setModal(false); fetchData()
    } catch (err) { setError(err.response?.data?.error || 'Erro ao salvar') }
    setSaving(false)
  }

  const handleDelete = async (c) => {
    if (!confirm(`Deletar "${c.Nome_Conta}"? Despesas vinculadas podem ser afetadas.`)) return
    try { await api.delete(`/contas-cartoes/${c.Id_Conta}`); fetchData() } catch { }
  }

  if (!user) return null
  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}><LoadingSpinner /></div></Layout>

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Contas & Cartões</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>Gerencie suas contas bancárias e cartões</p>
          </div>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nova Conta</button>
        </div>

        {contas.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {contas.map(c => {
              const Icon = TIPO_ICONS[c.Tipo] || CreditCard
              return (
                <div key={c.Id_Conta} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 6, background: `linear-gradient(90deg, ${c.Cor_Hex}, ${c.Cor_Hex}88)` }} />
                  <div style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 12,
                          background: `${c.Cor_Hex}20`, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={20} style={{ color: c.Cor_Hex }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{c.Nome_Conta}</div>
                          <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>{c.Titular}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => openEdit(c)} title="Editar"><Pencil size={14} /></button>
                        <button className="btn-icon" onClick={() => handleDelete(c)} title="Deletar"
                          style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-default" style={{ fontSize: '.75rem' }}>{c.Tipo}</span>
                      {c.Ultimos_Digitos && (
                        <span style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', letterSpacing: 2, fontFamily: 'monospace' }}>
                          •••• {c.Ultimos_Digitos}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : <EmptyState icon={CreditCard} title="Sem contas" description="Adicione sua primeira conta ou cartão"
          action={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> Adicionar</button>} />}

        {/* Modal */}
        {modal && (
          <Modal title={editing ? 'Editar Conta' : 'Nova Conta'} onClose={() => setModal(false)}>
            <form onSubmit={handleSave}>
              {error && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)', fontSize: '.85rem' }}>{error}</div>}

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Nome da Conta</label>
                <input className="input-field" required value={form.Nome_Conta}
                  onChange={e => setForm({ ...form, Nome_Conta: e.target.value })} placeholder="Ex: Nubank, Inter, Carteira..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="input-label">Tipo</label>
                  <select className="input-field" required value={form.Tipo}
                    onChange={e => setForm({ ...form, Tipo: e.target.value })} style={{ cursor: 'pointer' }}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Últimos 4 Dígitos</label>
                  <input className="input-field" maxLength={4} pattern="\d{0,4}"
                    value={form.Ultimos_Digitos} onChange={e => setForm({ ...form, Ultimos_Digitos: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234" />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Titular</label>
                <input className="input-field" required value={form.Titular}
                  onChange={e => setForm({ ...form, Titular: e.target.value })} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="input-label">Cor</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {CORES_PRESET.map(cor => (
                    <button key={cor} type="button" onClick={() => setForm({ ...form, Cor_Hex: cor })}
                      style={{
                        width: 30, height: 30, borderRadius: 8, background: cor, border: 'none', cursor: 'pointer',
                        outline: form.Cor_Hex === cor ? '2px solid #fff' : '2px solid transparent',
                        outlineOffset: 2, transition: 'outline .2s',
                      }} />
                  ))}
                  <input type="color" value={form.Cor_Hex} onChange={e => setForm({ ...form, Cor_Hex: e.target.value })}
                    style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
