'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import { Wallet, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function EsqueciSenha() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/usuarios/esqueci-senha', { email })
      router.push(`/resetar-senha?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar código')
    } finally {
      setLoading(false)
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
            <Wallet size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Esqueci minha senha
            </span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem' }}>
            Informe seu e-mail e enviaremos um código para redefinir sua senha.
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

            <div style={{ marginBottom: 24 }}>
              <label className="input-label">E-mail da sua conta</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: '.95rem' }}
            >
              {loading ? 'Enviando...' : 'Enviar código'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
            Lembrou a senha?{' '}
            <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
