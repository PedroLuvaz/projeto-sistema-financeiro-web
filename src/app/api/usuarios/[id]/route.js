import { handleRequest } from '@/app/api/_helpers/routeHandler'
import usuarioController from '@/controllers/usuarioController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return usuarioController.buscarPorId(id)
  })
}

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return usuarioController.atualizar(id, body)
  })
}

export async function DELETE(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return usuarioController.deletar(id)
  })
}
