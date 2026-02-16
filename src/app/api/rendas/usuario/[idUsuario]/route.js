import { handleRequest } from '@/app/api/_helpers/routeHandler'
import rendaController from '@/controllers/rendaController'

export async function GET(request, { params }) {
  return handleRequest(request, async (req) => {
    const { idUsuario } = await params
    const { searchParams } = new URL(req.url)
    const filtros = {
      mes: searchParams.get('mes'),
      ano: searchParams.get('ano'),
      dataInicio: searchParams.get('dataInicio'),
      dataFim: searchParams.get('dataFim')
    }
    return rendaController.listarPorUsuario(idUsuario, filtros)
  })
}
