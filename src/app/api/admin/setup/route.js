import { NextResponse } from 'next/server'
import models from '@/models/index.js'
import bcryptjs from 'bcryptjs'

const { Usuario } = models

// Rota pública usada apenas para criar o primeiro admin.
// Após criado, esta rota retorna erro caso já exista um admin.
export async function POST(request) {
  try {
    const adminExistente = await Usuario.findOne({ where: { Cargo: 'admin' } })
    if (adminExistente) {
      return NextResponse.json(
        { success: false, error: 'Já existe um administrador no sistema. Use o painel admin para gerenciar cargos.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { Nome, Email, Senha } = body

    if (!Nome || !Email || !Senha) {
      return NextResponse.json(
        { success: false, error: 'Nome, Email e Senha são obrigatórios' },
        { status: 400 }
      )
    }

    const existente = await Usuario.findOne({ where: { Email } })
    if (existente) {
      // Promove o usuário existente a admin
      await existente.update({ Cargo: 'admin' })
      return NextResponse.json(
        { success: true, data: { mensagem: `Usuário ${existente.Nome} promovido a admin com sucesso` } },
        { status: 200 }
      )
    }

    const senhaHash = await bcryptjs.hash(Senha, 10)
    const novoAdmin = await Usuario.create({ Nome, Email, Senha: senhaHash, Cargo: 'admin' })

    return NextResponse.json(
      { success: true, data: { mensagem: 'Admin criado com sucesso', email: novoAdmin.Email } },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
