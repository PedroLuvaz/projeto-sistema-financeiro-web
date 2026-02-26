'use client'

export default function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <div style={{
        width: 44,
        height: 44,
        border: '3px solid color-mix(in srgb, var(--color-primary) 20%, var(--color-surface-3))',
        borderTopColor: 'var(--color-primary)',
        borderRightColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
        boxShadow: '0 0 0 3px color-mix(in srgb, var(--color-primary) 14%, transparent)',
      }} />
    </div>
  )
}
