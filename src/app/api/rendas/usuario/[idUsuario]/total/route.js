import { handleRequest } from '@/app/api/_helpers/routeHandler'
import rendaController from '@/controllers/rendaController'

export async function GET(request, { params }) {
  return handleRequest(request, async (req) => {
    const { idUsuario } = await params
    const { searchParams } = new URL(req.url)
    const mes = searchParams.get('mes')
    const ano = searchParams.get('ano')
    return rendaController.calcularTotal(idUsuario, mes, ano)
  })
}
