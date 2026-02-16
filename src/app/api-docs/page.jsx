'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import yaml from 'js-yaml'
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
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {spec ? (
          <SwaggerUI 
            spec={spec}
            docExpansion="list"
            defaultModelsExpandDepth={1}
            displayRequestDuration={true}
          />
        ) : (
          <div style={{ 
            padding: '60px', 
            textAlign: 'center',
            color: '#64748b',
            fontSize: '1.1rem'
          }}>
            Carregando documentação da API...
          </div>
        )}
      </div>
    </div>
  )
}
