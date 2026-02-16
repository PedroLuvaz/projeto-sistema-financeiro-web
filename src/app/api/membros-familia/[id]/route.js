import { handleRequest } from '@/app/api/_helpers/routeHandler'
import membroFamiliaController from '@/controllers/membroFamiliaController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return membroFamiliaController.buscarPorId(id)
  })
}

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return membroFamiliaController.atualizar(id, body)
  })
}

export async function DELETE(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return membroFamiliaController.deletar(id)
  })
}
