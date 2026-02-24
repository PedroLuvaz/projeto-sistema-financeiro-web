'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Receipt, TrendingUp, CreditCard, CalendarClock,
  Target, FileBarChart, LogOut, Wallet, Menu, ShieldCheck, FileUp
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/despesas', icon: Receipt, label: 'Despesas' },
  { to: '/rendas', icon: TrendingUp, label: 'Rendas' },
  { to: '/contas', icon: CreditCard, label: 'Contas' },
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

  const isActive = (to) => {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 240,
        backgroundColor: 'var(--color-surface-2)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width .3s ease', 
        overflow: 'hidden', 
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Wallet size={20} color="#fff" />
          </div>
          {/* Substitua o span do nome por este bloco */}
          {!collapsed && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              letterSpacing: '-0.02em',
              marginLeft: '4px'
            }}>
              <span style={{ 
                fontWeight: 800, 
                fontSize: '1.2rem', 
                color: 'var(--color-text)' 
              }}>
                Finance
              </span>
              <span style={{ 
                fontWeight: 400, 
                fontSize: '1.2rem', 
                color: 'var(--color-primary)' 
              }}>
                App
              </span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-text-muted)',
            cursor: 'pointer', display: collapsed ? 'none' : 'block',
          }}>
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = isActive(to)
            return (
              <Link key={to} href={to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '12px 0' : '12px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, textDecoration: 'none', fontSize: '.875rem', fontWeight: 500,
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                backgroundColor: active ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                transition: 'all .2s',
              }}>
                <Icon size={20} color={active ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                {!collapsed && label}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div style={{
                height: 1, background: 'var(--color-border)',
                margin: '8px 8px', opacity: 0.6
              }} />
              <Link href="/admin" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '12px 0' : '12px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, textDecoration: 'none', fontSize: '.875rem', fontWeight: 500,
                color: isActive('/admin') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                backgroundColor: isActive('/admin') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                transition: 'all .2s',
              }}>
                <ShieldCheck size={20} color={isActive('/admin') ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                {!collapsed && 'Admin'}
              </Link>
            </>
          )}
        </nav>

        {/* User */}
        <div style={{
          padding: '16px 12px', borderTop: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-surface-3)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.8rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0,
          }}>
            {user?.Nome?.charAt(0)?.toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {user?.Nome}
                  {isAdmin && (
                    <span style={{ fontSize: '.65rem', padding: '1px 6px', borderRadius: 5, background: 'rgba(16,185,129,.15)', color: 'var(--color-primary)', fontWeight: 700, flexShrink: 0 }}>
                      Admin
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.Email}
                </div>
              </div>
              <button 
                onClick={logout} 
                style={{ 
                  background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
                  padding: 4, display: 'flex', alignItems: 'center'
                }}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {children}
      </main>
    </div>
  )
}