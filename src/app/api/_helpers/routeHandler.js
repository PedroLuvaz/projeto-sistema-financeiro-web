import { NextResponse } from 'next/server'
import { verificarToken } from '@/middleware/auth'

async function handleRequest(request, handler, { auth = true } = {}) {
  try {
    if (auth) {
      const authResult = verificarToken(request)
      if (!authResult.success) {
        return NextResponse.json(
          { success: false, error: authResult.error },
          { status: authResult.status }
        )
      }
      request.usuarioId = authResult.usuarioId
      request.usuarioEmail = authResult.usuarioEmail
    }

    const result = await handler(request)

    if (result.isCSV) {
      return new Response(result.data, {
        status: result.status,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=relatorio.csv'
        }
      })
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: result.status }
    )
  } catch (error) {
    console.error('API Error:', error.message)
    const status = error.status || 500
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status }
    )
  }
}

export { handleRequest }
