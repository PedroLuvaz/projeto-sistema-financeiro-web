import { NextResponse } from 'next/server'
import sequelize from '@/config/database'

export async function GET() {
  try {
    await sequelize.authenticate()
    return NextResponse.json({
      success: true,
      message: 'API e banco funcionando normalmente.',
      database: 'up',
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao conectar com o banco de dados.',
      database: 'down',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
