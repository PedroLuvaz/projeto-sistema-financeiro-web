'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import yaml from 'js-yaml'
import { BookOpenText, Sparkles } from 'lucide-react'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocs() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch('/openapi.yaml')
      .then(res => res.text())
      .then(yamlText => {
        const parsedSpec = yaml.load(yamlText)
        setSpec(parsedSpec)
      })
      .catch(err => console.error('Erro ao carregar OpenAPI spec:', err))
  }, [])

  return (
    <div style={{ minHeight: '100vh', padding: '24px clamp(12px, 3vw, 24px)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div className="glass-card" style={{ marginBottom: 16, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff',
            }}>
              <BookOpenText size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                API Documentation
                <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
              </h1>
              <p style={{ fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
                Referência interativa OpenAPI com o novo padrão visual do produto.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {spec ? (
            <SwaggerUI
              spec={spec}
              docExpansion="list"
              defaultModelsExpandDepth={1}
              displayRequestDuration={true}
            />
          ) : (
            <div style={{ padding: 56, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '1rem' }}>
              Carregando documentação da API...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}