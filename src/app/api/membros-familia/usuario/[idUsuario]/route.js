import { handleRequest } from '@/app/api/_helpers/routeHandler'
import membroFamiliaController from '@/controllers/membroFamiliaController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { idUsuario } = await params
    return membroFamiliaController.listarPorUsuario(idUsuario)
  })
}
