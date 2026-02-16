export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
      {Icon && (
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={28} color="var(--color-primary)" />
        </div>
      )}
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: '.875rem', color: 'var(--color-text-muted)', maxWidth: 300, marginBottom: action ? 20 : 0 }}>{description}</p>
      {action}
    </div>
  )
}
