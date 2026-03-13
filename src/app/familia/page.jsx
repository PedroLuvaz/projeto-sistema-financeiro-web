'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, CATEGORIAS } from '@/utils/helpers'
import {
  Users, Plus, Pencil, Trash2, Calculator, UserCheck, Divide, Check, Receipt
} from 'lucide-react'

const PARENTESCOS = [
  'Conjuge', 'Esposo(a)', 'Filho(a)', 'Pai', 'Mae', 'Irmao(ã)',
  'Avo/Avo', 'Neto(a)', 'Tio(a)', 'Primo(a)', 'Outro',
]

const emptyForm = { Nome_Membro: '', Parentesco: '' }

function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildEmptyLancamento() {
  return {
    Descricao_Despesa: '',
    Categoria: '',
    Id_Conta: '',
    Data: getTodayDateString(),
    Numero_Parcelas: 1,
    modoRegistro: 'minha_parte',
  }
}

export default function Familia() {
  const { user } = useAuth()
  const router = useRouter()
  const [membros, setMembros] = useState([])
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Divisor de conta + lancamento de despesa
  const [divisorModal, setDivisorModal] = useState(false)
  const [valorTotal, setValorTotal] = useState('')
  const [selecionados, setSelecionados] = useState([])
  const [incluirEu, setIncluirEu] = useState(true)
  const [lancamento, setLancamento] = useState(buildEmptyLancamento)
  const [lancandoDespesa, setLancandoDespesa] = useState(false)
  const [divisorError, setDivisorError] = useState('')
  const [divisorSuccess, setDivisorSuccess] = useState('')

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [membrosResp, contasResp] = await Promise.allSettled([
      api.get(`/membros-familia/usuario/${user.Id_Usuario}`),
      api.get(`/contas-cartoes/usuario/${user.Id_Usuario}`),
    ])

    if (membrosResp.status === 'fulfilled') {
      setMembros(membrosResp.value.data?.data || [])
    } else {
      setMembros([])
    }

    if (contasResp.status === 'fulfilled') {
      setContas(contasResp.value.data?.data || [])
    } else {
      setContas([])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreate = () => {
    setForm(emptyForm)
    setEditing(null)
    setError('')
    setModal(true)
  }

  const openEdit = (membro) => {
    setForm({ Nome_Membro: membro.Nome_Membro, Parentesco: membro.Parentesco || '' })
    setEditing(membro)
    setError('')
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editing) {
        await api.put(`/membros-familia/${editing.Id_Membro}`, form)
      } else {
        await api.post('/membros-familia', { ...form, Id_Usuario: user.Id_Usuario })
      }
      setModal(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar')
    }

    setSaving(false)
  }

  const handleDelete = async (membro) => {
    if (!confirm(`Remover "${membro.Nome_Membro}" da familia?`)) return
    try {
      await api.delete(`/membros-familia/${membro.Id_Membro}`)
      fetchData()
    } catch {
      // no-op
    }
  }

  const toggleSelecionado = (idMembro) => {
    setSelecionados((prev) =>
      prev.includes(idMembro) ? prev.filter((id) => id !== idMembro) : [...prev, idMembro]
    )
  }

  const openDivisor = () => {
    const contaPadrao = contas[0]?.Id_Conta || ''
    setSelecionados(membros.map((m) => m.Id_Membro))
    setIncluirEu(true)
    setValorTotal('')
    setLancamento({ ...buildEmptyLancamento(), Id_Conta: contaPadrao })
    setDivisorError('')
    setDivisorSuccess('')
    setDivisorModal(true)
  }

  const valorTotalNumero = parseFloat(valorTotal) || 0
  const totalPessoas = selecionados.length + (incluirEu ? 1 : 0)
  const valorPorPessoa = totalPessoas > 0 && valorTotalNumero > 0
    ? valorTotalNumero / totalPessoas
    : 0

  const participantesSelecionados = membros.filter((m) => selecionados.includes(m.Id_Membro))
  const valorParaLancar = lancamento.modoRegistro === 'total' ? valorTotalNumero : valorPorPessoa

  const handleLancarDespesa = async () => {
    setDivisorError('')
    setDivisorSuccess('')

    if (!lancamento.Descricao_Despesa.trim()) {
      setDivisorError('Informe a descricao da despesa para lancar.')
      return
    }
    if (!lancamento.Categoria) {
      setDivisorError('Selecione a categoria da despesa.')
      return
    }
    if (!lancamento.Id_Conta) {
      setDivisorError('Selecione a conta/cartao.')
      return
    }
    if (!lancamento.Data) {
      setDivisorError('Informe a data da despesa.')
      return
    }
    if (totalPessoas <= 0) {
      setDivisorError('Selecione ao menos uma pessoa para dividir.')
      return
    }
    if (valorTotalNumero <= 0) {
      setDivisorError('Informe um valor total valido para a conta.')
      return
    }
    if (lancamento.modoRegistro === 'minha_parte' && !incluirEu) {
      setDivisorError('Para lancar sua parte, voce precisa estar incluido na divisao.')
      return
    }

    const numeroParcelas = Math.max(1, parseInt(lancamento.Numero_Parcelas, 10) || 1)
    const valorLancamento = parseFloat(valorParaLancar.toFixed(2))

    const descricao = `${lancamento.Descricao_Despesa.trim()} [Dividido em ${totalPessoas} pessoa${totalPessoas > 1 ? 's' : ''}]`

    const body = {
      Id_Usuario: user.Id_Usuario,
      Id_Conta: lancamento.Id_Conta,
      Descricao_Despesa: descricao,
      Valor_Total: valorLancamento,
      Valor_Parcela: numeroParcelas > 1
        ? +(valorLancamento / numeroParcelas).toFixed(2)
        : valorLancamento,
      Data: lancamento.Data,
      Categoria: lancamento.Categoria,
      Numero_Parcelas: numeroParcelas,
    }

    setLancandoDespesa(true)
    try {
      await api.post('/despesas', body)
      const modoTexto = lancamento.modoRegistro === 'total'
        ? 'Valor total lancado com sucesso.'
        : 'Sua parte da conta foi lancada com sucesso.'
      setDivisorSuccess(modoTexto)
      setValorTotal('')
      setLancamento((prev) => ({
        ...buildEmptyLancamento(),
        Id_Conta: prev.Id_Conta,
      }))
    } catch (err) {
      setDivisorError(err.response?.data?.error || 'Nao foi possivel lancar a despesa dividida.')
    }
    setLancandoDespesa(false)
  }

  if (!user) return null

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Familia</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>Gerencie os membros da sua familia</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {membros.length > 0 && (
              <button className="btn-secondary" onClick={openDivisor}>
                <Divide size={16} /> Dividir Conta
              </button>
            )}
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Adicionar Membro
            </button>
          </div>
        </div>

        {membros.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            <div className="stat-card stat-card-indigo">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={20} />
                <div>
                  <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>Total de Membros</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{membros.length}</div>
                </div>
              </div>
            </div>
            <div className="stat-card stat-card-emerald">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserCheck size={20} />
                <div>
                  <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>Familia Total (c/ voce)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{membros.length + 1} pessoas</div>
                </div>
              </div>
            </div>
            <div
              className="stat-card stat-card-amber"
              onClick={openDivisor}
              style={{ cursor: 'pointer' }}
              title="Clique para dividir uma conta"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calculator size={20} />
                <div>
                  <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>Divisor de Conta</div>
                  <div style={{ fontSize: '.95rem', fontWeight: 700, marginTop: 2 }}>Calcular e lancar</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {membros.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {membros.map((membro) => {
              const iniciais = membro.Nome_Membro.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']
              const cor = colors[membro.Nome_Membro.charCodeAt(0) % colors.length]

              return (
                <div key={membro.Id_Membro} className="glass-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: `${cor}22`,
                      border: `2px solid ${cor}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: cor,
                    }}
                  >
                    {iniciais}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {membro.Nome_Membro}
                    </div>
                    {membro.Parentesco && (
                      <span
                        style={{
                          fontSize: '.72rem',
                          padding: '2px 8px',
                          borderRadius: 5,
                          marginTop: 4,
                          display: 'inline-block',
                          background: `${cor}18`,
                          color: cor,
                          fontWeight: 600,
                        }}
                      >
                        {membro.Parentesco}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button className="btn-icon" onClick={() => openEdit(membro)} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(membro)} title="Remover" style={{ color: 'var(--color-danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Nenhum membro cadastrado"
            description="Adicione os membros da sua familia para organizar despesas compartilhadas"
            action={
              <button className="btn-primary" onClick={openCreate}>
                <Plus size={16} /> Adicionar Membro
              </button>
            }
          />
        )}

        {modal && (
          <Modal title={editing ? 'Editar Membro' : 'Adicionar Membro'} onClose={() => setModal(false)}>
            <form onSubmit={handleSave}>
              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    marginBottom: 16,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: 'var(--color-danger)',
                    fontSize: '.85rem',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Nome completo</label>
                <input
                  className="input-field"
                  required
                  value={form.Nome_Membro}
                  onChange={(e) => setForm({ ...form, Nome_Membro: e.target.value })}
                  placeholder="Ex: Maria Silva, Joao Filho..."
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="input-label">Parentesco (opcional)</label>
                <select
                  className="input-field"
                  value={form.Parentesco}
                  onChange={(e) => setForm({ ...form, Parentesco: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Selecione o parentesco</option>
                  {PARENTESCOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {divisorModal && (
          <Modal title="Divisor de Conta" onClose={() => setDivisorModal(false)}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginBottom: 20 }}>
              Selecione quem vai dividir a conta, confira o rateio e lance a despesa direto no sistema.
            </p>

            {divisorError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 14,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--color-danger)',
                  fontSize: '.85rem',
                }}
              >
                {divisorError}
              </div>
            )}

            {divisorSuccess && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 14,
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.35)',
                  color: '#16a34a',
                  fontSize: '.85rem',
                }}
              >
                {divisorSuccess}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label className="input-label">Valor total da conta (R$)</label>
              <input
                className="input-field"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 150.00"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="input-label" style={{ marginBottom: 10, display: 'block' }}>Quem vai dividir</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  onClick={() => setIncluirEu(!incluirEu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all .15s',
                    border: `1px solid ${incluirEu ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: incluirEu ? 'rgba(16,185,129,.07)' : 'var(--color-surface)',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: incluirEu ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {incluirEu
                      ? <Check size={14} color="#fff" />
                      : <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{user?.Nome?.charAt(0)?.toUpperCase()}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{user?.Nome?.split(' ')[0]} (voce)</div>
                  </div>
                </div>

                {membros.map((membro) => {
                  const ativo = selecionados.includes(membro.Id_Membro)
                  return (
                    <div
                      key={membro.Id_Membro}
                      onClick={() => toggleSelecionado(membro.Id_Membro)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all .15s',
                        border: `1px solid ${ativo ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: ativo ? 'rgba(16,185,129,.07)' : 'var(--color-surface)',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: ativo ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {ativo
                          ? <Check size={14} color="#fff" />
                          : <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{membro.Nome_Membro.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{membro.Nome_Membro}</div>
                        {membro.Parentesco && <div style={{ fontSize: '.73rem', color: 'var(--color-text-muted)' }}>{membro.Parentesco}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {valorPorPessoa > 0 && totalPessoas > 0 && (
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  marginBottom: 20,
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
                    {formatCurrency(valorTotalNumero)} ÷ {totalPessoas} {totalPessoas === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary-light)' }}>
                    {formatCurrency(valorPorPessoa)} / pessoa
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {incluirEu && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: 'var(--color-text-secondary)' }}>
                      <span>{user?.Nome?.split(' ')[0]} (voce)</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(valorPorPessoa)}</span>
                    </div>
                  )}
                  {participantesSelecionados.map((membro) => (
                    <div key={membro.Id_Membro} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: 'var(--color-text-secondary)' }}>
                      <span>{membro.Nome_Membro}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(valorPorPessoa)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="glass-card"
              style={{ padding: '14px 16px', marginBottom: 16, border: '1px solid var(--color-border)' }}
            >
              <label className="input-label" style={{ marginBottom: 10, display: 'block' }}>Como registrar no financeiro</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  className={lancamento.modoRegistro === 'minha_parte' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setLancamento((prev) => ({ ...prev, modoRegistro: 'minha_parte' }))}
                >
                  Minha parte ({formatCurrency(valorPorPessoa || 0)})
                </button>
                <button
                  type="button"
                  className={lancamento.modoRegistro === 'total' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setLancamento((prev) => ({ ...prev, modoRegistro: 'total' }))}
                >
                  Valor total ({formatCurrency(valorTotalNumero || 0)})
                </button>
              </div>
              {lancamento.modoRegistro === 'minha_parte' && !incluirEu && (
                <p style={{ marginTop: 8, fontSize: '.78rem', color: 'var(--color-danger)' }}>
                  Inclua voce na divisao para poder lancar sua parte.
                </p>
              )}
            </div>

            <div className="glass-card" style={{ padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Receipt size={16} />
                <span style={{ fontWeight: 700, fontSize: '.9rem' }}>Dados da despesa</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="input-label">Descricao</label>
                <input
                  className="input-field"
                  value={lancamento.Descricao_Despesa}
                  onChange={(e) => setLancamento((prev) => ({ ...prev, Descricao_Despesa: e.target.value }))}
                  placeholder="Ex: Jantar em familia, Conta de internet..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="input-label">Categoria</label>
                  <select
                    className="input-field"
                    value={lancamento.Categoria}
                    onChange={(e) => setLancamento((prev) => ({ ...prev, Categoria: e.target.value }))}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Selecione</option>
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Conta / Cartao</label>
                  <select
                    className="input-field"
                    value={lancamento.Id_Conta}
                    onChange={(e) => setLancamento((prev) => ({ ...prev, Id_Conta: e.target.value }))}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Selecione</option>
                    {contas.map((conta) => (
                      <option key={conta.Id_Conta} value={conta.Id_Conta}>
                        {conta.Nome_Conta} ({conta.Tipo}{conta.Ultimos_Digitos ? ` •••${conta.Ultimos_Digitos}` : ''})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="input-label">Data</label>
                  <input
                    className="input-field"
                    type="date"
                    value={lancamento.Data}
                    onChange={(e) => setLancamento((prev) => ({ ...prev, Data: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">No Parcelas</label>
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    max="48"
                    value={lancamento.Numero_Parcelas}
                    onChange={(e) => setLancamento((prev) => ({ ...prev, Numero_Parcelas: e.target.value }))}
                  />
                </div>
              </div>

              {contas.length === 0 && (
                <p style={{ marginTop: 10, fontSize: '.78rem', color: 'var(--color-danger)' }}>
                  Cadastre ao menos uma conta/cartao para lancar despesas divididas.
                </p>
              )}
            </div>

            {totalPessoas === 0 && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  marginBottom: 20,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: 'var(--color-danger)',
                  fontSize: '.85rem',
                  textAlign: 'center',
                }}
              >
                Selecione ao menos uma pessoa para dividir
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => router.push('/despesas')}>Ver Despesas</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={() => setDivisorModal(false)}>Fechar</button>
                <button
                  className="btn-primary"
                  onClick={handleLancarDespesa}
                  disabled={lancandoDespesa || contas.length === 0 || valorTotalNumero <= 0 || totalPessoas <= 0}
                >
                  {lancandoDespesa ? 'Lancando...' : 'Lancar Despesa Dividida'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
