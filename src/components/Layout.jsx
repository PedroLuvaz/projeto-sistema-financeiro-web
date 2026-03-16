'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Receipt, TrendingUp, CreditCard, CalendarClock,
  Target, FileBarChart, LogOut, Wallet, Menu, ShieldCheck, FileUp, Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/despesas', icon: Receipt, label: 'Despesas' },
  { to: '/rendas', icon: TrendingUp, label: 'Rendas' },
  { to: '/contas', icon: CreditCard, label: 'Contas' },
  { to: '/membros-familia', icon: Users, label: 'Família' },
  { to: '/parcelamentos', icon: CalendarClock, label: 'Parcelas' },
  { to: '/reservas', icon: Target, label: 'Reservas' },
  { to: '/relatorios', icon: FileBarChart, label: 'Relatórios' },
  { to: '/importar', icon: FileUp, label: 'Importar CSV' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const isAdmin = user?.Cargo === 'admin'
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to) => {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  const pageName = useMemo(() => {
    const found = navItems.find((item) => isActive(item.to))
    if (isActive('/admin')) return 'Admin'
    return found?.label || 'FinanceApp'
  }, [pathname])

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'transparent',
      color: 'var(--color-text)',
    }}>
      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2,6,23,0.6)',
            border: 'none',
            zIndex: 40,
            display: 'none',
          }}
          className="layout-mobile-overlay"
        />
      )}

      <aside
        style={{
          width: collapsed ? 84 : 270,
          background: 'var(--color-surface-elevated)',
          borderRight: '1px solid var(--color-border)',
          backdropFilter: 'blur(18px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width .25s ease, transform .25s ease',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 45,
        }}
        className={`layout-sidebar ${mobileOpen ? 'open' : ''}`}
      >
        <div style={{
          padding: '18px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 10px 20px rgba(79,70,229,0.35)',
          }}>
            <Wallet size={21} color="#fff" />
          </div>

          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.03rem', fontWeight: 800, letterSpacing: '-.02em' }}>
                Finance<span style={{ color: 'var(--color-primary)' }}>App</span>
              </span>
              <span style={{ fontSize: '.69rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Gestão inteligente
              </span>
            </div>
          )}

          <button
            className="btn-icon"
            onClick={() => setCollapsed((value) => !value)}
            style={{ marginLeft: 'auto' }}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <Menu size={16} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = isActive(to)
            return (
              <Link
                key={to}
                href={to}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-item ${active ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '11px 0' : '11px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontSize: '.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: '1px solid transparent',
                }}
              >
                <Icon size={18} />
                {!collapsed && label}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div style={{ height: 1, background: 'var(--color-border)', margin: '10px 6px', opacity: 0.85 }} />
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`sidebar-item ${isActive('/admin') ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '11px 0' : '11px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontSize: '.875rem',
                  fontWeight: isActive('/admin') ? 700 : 500,
                  color: isActive('/admin') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: '1px solid transparent',
                }}
              >
                <ShieldCheck size={18} />
                {!collapsed && 'Admin'}
              </Link>
            </>
          )}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'color-mix(in srgb, var(--color-surface-3) 70%, transparent)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: '10px 10px',
          }}>
            <div style={{
              width: 35,
              height: 35,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '.8rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {user?.Nome?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {!collapsed && (
              <>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '.8125rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.Nome}
                  </div>
                  <div style={{
                    fontSize: '.7rem',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.Email}
                  </div>
                </div>
                <button className="btn-icon" onClick={logout} title="Sair" style={{ width: 32, height: 32 }}>
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{
          height: 72,
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'var(--color-surface-elevated)',
          backdropFilter: 'blur(18px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn-icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              style={{ display: 'none' }}
              id="layout-mobile-button"
            >
              <Menu size={16} />
            </button>
            <div>
              <p style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--color-text-muted)' }}>
                Workspace
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {pageName}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn-icon"
              onClick={logout}
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <section style={{ padding: '24px clamp(14px, 3vw, 30px) 30px' }}>
          <div className="fade-in">{children}</div>
        </section>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .layout-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            width: 280px !important;
          }

          .layout-sidebar.open {
            transform: translateX(0);
          }

          .layout-mobile-overlay {
            display: block !important;
          }

          #layout-mobile-button {
            display: inline-flex !important;
          }
        }

        @media (max-width: 720px) {
          #layout-mobile-button + div h2 {
            font-size: .95rem;
          }
        }
      `}</style>
    </div>
  )
}