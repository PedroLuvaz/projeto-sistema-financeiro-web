import { handleRequest } from '@/app/api/_helpers/routeHandler'
import usuarioController from '@/controllers/usuarioController'

export async function GET(request) {
  return handleRequest(request, async () => {
    return usuarioController.listarTodos()
  })
}
