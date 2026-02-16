import { handleRequest } from '@/app/api/_helpers/routeHandler'
import contaCartaoController from '@/controllers/contaCartaoController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return contaCartaoController.criar(body)
  })
}
