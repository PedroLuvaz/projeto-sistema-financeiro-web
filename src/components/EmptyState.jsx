'use client'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '54px 24px',
      textAlign: 'center',
      border: '1px dashed var(--color-border)',
      borderRadius: 16,
      background: 'color-mix(in srgb, var(--color-surface-2) 72%, transparent)',
      backdropFilter: 'blur(10px)',
    }}>
      {Icon && (
        <div style={{
          width: 68,
          height: 68,
          borderRadius: 18,
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 24%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))',
          border: '1px solid color-mix(in srgb, var(--color-primary) 32%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Icon size={28} color="var(--color-primary)" />
        </div>
      )}
      <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: '.88rem', color: 'var(--color-text-muted)', maxWidth: 320, marginBottom: action ? 20 : 0 }}>{description}</p>
      {action}
    </div>
  )
}
