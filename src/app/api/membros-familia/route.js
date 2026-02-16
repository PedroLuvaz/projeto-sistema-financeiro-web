import { handleRequest } from '@/app/api/_helpers/routeHandler'
import membroFamiliaController from '@/controllers/membroFamiliaController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return membroFamiliaController.criar(body)
  })
}
