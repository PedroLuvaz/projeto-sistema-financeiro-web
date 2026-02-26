'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Wallet, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, senha)
      router.push('/')
    } catch (err) {
      const data = err.response?.data
      if (data?.requiresVerification) {
        router.push(`/verificar-email?email=${encodeURIComponent(data.email || email)}`)
        return
      }
      setError(data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 980, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr' }} className="auth-grid">
          <section style={{
            padding: '44px clamp(20px, 3.5vw, 46px)',
            background: 'linear-gradient(155deg, color-mix(in srgb, var(--color-primary) 17%, transparent), color-mix(in srgb, var(--color-accent) 12%, transparent))',
            borderRight: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 18 }}>
              <Sparkles size={14} /> Plataforma Financeira Inteligente
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
              Controle total das suas finanças com uma interface de alto nível.
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 26 }}>
              Decisões financeiras mais rápidas com dashboards claros, importação de extratos e relatórios prontos para ação.
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                'Visão mensal completa em segundos',
                'Gestão de despesas, rendas e reservas',
                'Dados protegidos e experiência premium',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-secondary)', fontSize: '.9rem' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: '42px clamp(20px, 3vw, 38px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                boxShadow: '0 10px 28px rgba(79,70,229,.28)',
              }}>
                <Wallet size={28} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: 4 }}>Entrar no FinanceApp</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem' }}>Acesse sua conta para continuar.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 18,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--color-danger)', fontSize: '.85rem',
                }}>{error}</div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label className="input-label">E-mail</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="input-field"
                    style={{ paddingLeft: 42 }}
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label className="input-label">Senha</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="input-field"
                    style={{ paddingLeft: 42, paddingRight: 42 }}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
                    }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 22px', fontSize: '.95rem' }}>
                {loading ? 'Entrando...' : 'Entrar'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 14, fontSize: '.85rem' }}>
              <Link href="/esqueci-senha" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                Esqueci minha senha
              </Link>
            </div>

            <div style={{ textAlign: 'center', marginTop: 12, fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
              Não tem conta?{' '}
              <Link href="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}>
                Criar conta
              </Link>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-grid {
            grid-template-columns: 1fr !important;
          }

          .auth-grid section:first-child {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}