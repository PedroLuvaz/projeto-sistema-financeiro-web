'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/services/api'
import { Wallet, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function VerificarEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [digitos, setDigitos] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reenvioLoading, setReenvioLoading] = useState(false)
  const [reenvioMsg, setReenvioMsg] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const refs = useRef([])

  useEffect(() => {
    if (!email) router.push('/register')
  }, [email, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleDigito = (index, valor) => {
    if (!/^\d?$/.test(valor)) return
    const novos = [...digitos]
    novos[index] = valor
    setDigitos(novos)
    if (valor && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setDigitos(paste.split(''))
      refs.current[5]?.focus()
    }
  }

  const codigo = digitos.join('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (codigo.length < 6) { setError('Digite o código completo de 6 dígitos'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/usuarios/verificar-email', { email, codigo })
      const { token, usuario } = res.data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(usuario))
      router.push('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao verificar código')
    } finally {
      setLoading(false)
    }
  }

  const handleReenviar = async () => {
    if (cooldown > 0) return
    setReenvioLoading(true)
    setReenvioMsg('')
    setError('')
    try {
      await api.post('/usuarios/reenviar-codigo', { email })
      setReenvioMsg('Novo código enviado!')
      setCooldown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao reenviar código')
    } finally {
      setReenvioLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%), var(--color-surface)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Verificar E-mail
            </span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem', lineHeight: 1.5 }}>
            Enviamos um código de 6 dígitos para<br />
            <strong style={{ color: 'var(--color-text-secondary)' }}>{email}</strong>
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 20,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--color-danger)', fontSize: '.85rem',
              }}>{error}</div>
            )}

            {reenvioMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 20,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: 'var(--color-primary)', fontSize: '.85rem',
              }}>{reenvioMsg}</div>
            )}

            <label className="input-label" style={{ display: 'block', marginBottom: 14 }}>
              Código de verificação
            </label>

            {/* Inputs dos 6 dígitos */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }} onPaste={handlePaste}>
              {digitos.map((d, i) => (
                <input
                  key={i}
                  ref={el => refs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigito(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  style={{
                    width: 48, height: 56, textAlign: 'center',
                    fontSize: '1.5rem', fontWeight: 700,
                    background: 'var(--color-surface-3)',
                    border: `2px solid ${d ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12, color: 'var(--color-text)',
                    outline: 'none', transition: 'border-color .15s',
                    caretColor: 'var(--color-primary)',
                  }}
                />
              ))}
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading || codigo.length < 6}
              style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: '.95rem' }}
            >
              {loading ? 'Verificando...' : 'Confirmar'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={handleReenviar}
              disabled={reenvioLoading || cooldown > 0}
              style={{
                background: 'none', border: 'none', cursor: cooldown > 0 ? 'default' : 'pointer',
                color: cooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                fontSize: '.85rem', fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <RefreshCw size={14} />
              {reenvioLoading ? 'Enviando...' : cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 12, fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
            <Link href="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              ← Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
