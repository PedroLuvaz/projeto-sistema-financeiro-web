'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Receipt, TrendingUp, CreditCard, CalendarClock,
  Target, FileBarChart, LogOut, Wallet, Menu
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
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (to) => {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 240,
        background: 'linear-gradient(180deg, #0f172a 0%, #1a1f3a 100%)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width .3s ease', overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Wallet size={20} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(135deg, #818cf8, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FinanceApp
            </span>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-text-muted)',
            cursor: 'pointer', display: collapsed ? 'none' : 'block',
          }}>
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = isActive(to)
            return (
              <Link key={to} href={to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '12px 0' : '12px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, textDecoration: 'none', fontSize: '.875rem', fontWeight: 500,
                color: active ? '#fff' : 'var(--color-text-muted)',
                background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                transition: 'all .2s',
              }}>
                <Icon size={20} />
                {!collapsed && label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: '16px 12px', borderTop: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.8rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.Nome?.charAt(0)?.toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '.8125rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.Nome}
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.Email}
                </div>
              </div>
              <button onClick={logout} className="btn-icon" style={{ width: 32, height: 32 }}>
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
