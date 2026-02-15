const models = require('../models');
const bcrypt = require('bcrypt');

const { 
  Usuario, 
  MembroFamilia, 
  ContaCartao, 
  Renda, 
  ParcelamentoAgrupador, 
  Despesa, 
  Reserva 
} = models;

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Limpar dados existentes
    await Despesa.destroy({ where: {} });
    await ParcelamentoAgrupador.destroy({ where: {} });
    await Reserva.destroy({ where: {} });
    await Renda.destroy({ where: {} });
    await ContaCartao.destroy({ where: {} });
    await MembroFamilia.destroy({ where: {} });
    await Usuario.destroy({ where: {} });
    
    console.log('✅ Dados existentes limpos\n');

    // Criar usuários de exemplo
    const senhaHash = await bcrypt.hash('senha123', 10);
    
    const usuario1 = await Usuario.create({
      Nome: 'João Silva',
      Email: 'joao.silva@email.com',
      Senha: senhaHash
    });
    console.log('✅ Usuário criado: João Silva');

    const usuario2 = await Usuario.create({
      Nome: 'Maria Santos',
      Email: 'maria.santos@email.com',
      Senha: senhaHash
    });
    console.log('✅ Usuário criado: Maria Santos\n');

    // Criar membros da família para João
    await MembroFamilia.create({
      Id_Usuario: usuario1.Id_Usuario,
      Nome_Membro: 'Ana Silva',
      Parentesco: 'Esposa'
    });
    
    await MembroFamilia.create({
      Id_Usuario: usuario1.Id_Usuario,
      Nome_Membro: 'Pedro Silva',
      Parentesco: 'Filho'
    });
    console.log('✅ Membros da família criados para João\n');

    // Criar contas e cartões para João
    const nubank = await ContaCartao.create({
      Id_Usuario: usuario1.Id_Usuario,
      Nome_Conta: 'Nubank',
      Tipo: 'Crédito',
      Titular: 'João Silva',
      Ultimos_Digitos: '1234',
      Cor_Hex: '#820AD1'
    });

    const inter = await ContaCartao.create({
      Id_Usuario: usuario1.Id_Usuario,
      Nome_Conta: 'Inter',
      Tipo: 'Corrente',
      Titular: 'João Silva',
      Ultimos_Digitos: '5678',
      Cor_Hex: '#FF7A00'
    });

    const carteira = await ContaCartao.create({
      Id_Usuario: usuario1.Id_Usuario,
      Nome_Conta: 'Carteira',
      Tipo: 'Dinheiro',
      Titular: 'João Silva',
      Ultimos_Digitos: null,
      Cor_Hex: '#4CAF50'
    });
    console.log('✅ Contas e cartões criados\n');

    // Criar rendas para João
    await Renda.create({
      Id_Usuario: usuario1.Id_Usuario,
      Descricao_Renda: 'Salário',
      Valor_Renda: 5000.00,
      Data: '2026-02-01'
    });

    await Renda.create({
      Id_Usuario: usuario1.Id_Usuario,
      Descricao_Renda: 'Freelance',
      Valor_Renda: 1500.00,
      Data: '2026-02-10'
    });
    console.log('✅ Rendas criadas\n');

    // Criar parcelamento
    const parcelamentoNotebook = await ParcelamentoAgrupador.create({
      Id_Usuario: usuario1.Id_Usuario,
      Descricao_Parcela: 'Notebook Dell',
      Valor_Total: 4800.00,
      Qtd_Parcelas: 12,
      Data_Inicio: '2026-01-15'
    });
    console.log('✅ Parcelamento criado\n');

    // Criar despesas para João
    // Despesas parceladas (notebook)
    for (let i = 1; i <= 3; i++) {
      const mes = i === 1 ? '01' : i === 2 ? '02' : '03';
      await Despesa.create({
        Id_Usuario: usuario1.Id_Usuario,
        Id_Conta: nubank.Id_Conta,
        Id_Parcelamento: parcelamentoNotebook.Id_Parcelamento,
        Descricao_Despesa: 'Notebook Dell',
        Valor_Parcela: 400.00,
        Data: `2026-${mes}-15`,
        Categoria: 'Eletrônicos',
        Numero_Parcela: i
      });
    }

    // Despesas à vista
    await Despesa.create({
      Id_Usuario: usuario1.Id_Usuario,
      Id_Conta: nubank.Id_Conta,
      Id_Parcelamento: null,
      Descricao_Despesa: 'Supermercado',
      Valor_Parcela: 450.00,
      Data: '2026-02-05',
      Categoria: 'Alimentação',
      Numero_Parcela: 1
    });

    await Despesa.create({
      Id_Usuario: usuario1.Id_Usuario,
      Id_Conta: inter.Id_Conta,
      Id_Parcelamento: null,
      Descricao_Despesa: 'Conta de Luz',
      Valor_Parcela: 180.00,
      Data: '2026-02-10',
      Categoria: 'Contas',
      Numero_Parcela: 1
    });

    await Despesa.create({
      Id_Usuario: usuario1.Id_Usuario,
      Id_Conta: carteira.Id_Conta,
      Id_Parcelamento: null,
      Descricao_Despesa: 'Restaurante',
      Valor_Parcela: 120.00,
      Data: '2026-02-12',
      Categoria: 'Alimentação',
      Numero_Parcela: 1
    });

    await Despesa.create({
      Id_Usuario: usuario1.Id_Usuario,
      Id_Conta: nubank.Id_Conta,
      Id_Parcelamento: null,
      Descricao_Despesa: 'Netflix',
      Valor_Parcela: 45.90,
      Data: '2026-02-14',
      Categoria: 'Entretenimento',
      Numero_Parcela: 1
    });

    await Despesa.create({
      Id_Usuario: usuario1.Id_Usuario,
      Id_Conta: inter.Id_Conta,
      Id_Parcelamento: null,
      Descricao_Despesa: 'Gasolina',
      Valor_Parcela: 200.00,
      Data: '2026-02-08',
      Categoria: 'Transporte',
      Numero_Parcela: 1
    });
    console.log('✅ Despesas criadas\n');

    // Criar reservas para João
    await Reserva.create({
      Id_Usuario: usuario1.Id_Usuario,
      Nome_Objetivo: 'Viagem para Europa',
      Valor_Alvo: 15000.00,
      Valor_Atual: 3500.00,
      Data_Limite: '2026-12-31'
    });

    await Reserva.create({
      Id_Usuario: usuario1.Id_Usuario,
      Nome_Objetivo: 'Fundo de Emergência',
      Valor_Alvo: 20000.00,
      Valor_Atual: 12000.00,
      Data_Limite: null
    });

    await Reserva.create({
      Id_Usuario: usuario1.Id_Usuario,
      Nome_Objetivo: 'Carro Novo',
      Valor_Alvo: 50000.00,
      Valor_Atual: 8000.00,
      Data_Limite: '2027-06-30'
    });
    console.log('✅ Reservas criadas\n');

    // Criar dados para Maria
    const c6 = await ContaCartao.create({
      Id_Usuario: usuario2.Id_Usuario,
      Nome_Conta: 'C6 Bank',
      Tipo: 'Crédito',
      Titular: 'Maria Santos',
      Ultimos_Digitos: '9012',
      Cor_Hex: '#000000'
    });

    await Renda.create({
      Id_Usuario: usuario2.Id_Usuario,
      Descricao_Renda: 'Salário',
      Valor_Renda: 6500.00,
      Data: '2026-02-01'
    });

    await Despesa.create({
      Id_Usuario: usuario2.Id_Usuario,
      Id_Conta: c6.Id_Conta,
      Id_Parcelamento: null,
      Descricao_Despesa: 'Aluguel',
      Valor_Parcela: 1500.00,
      Data: '2026-02-05',
      Categoria: 'Moradia',
      Numero_Parcela: 1
    });

    await Reserva.create({
      Id_Usuario: usuario2.Id_Usuario,
      Nome_Objetivo: 'Mestrado',
      Valor_Alvo: 30000.00,
      Valor_Atual: 5000.00,
      Data_Limite: '2027-03-01'
    });
    console.log('✅ Dados criados para Maria\n');

    console.log('🎉 Seed concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${await Usuario.count()} usuários`);
    console.log(`   - ${await MembroFamilia.count()} membros da família`);
    console.log(`   - ${await ContaCartao.count()} contas/cartões`);
    console.log(`   - ${await Renda.count()} rendas`);
    console.log(`   - ${await ParcelamentoAgrupador.count()} parcelamentos`);
    console.log(`   - ${await Despesa.count()} despesas`);
    console.log(`   - ${await Reserva.count()} reservas\n`);

    console.log('🔑 Credenciais de acesso:');
    console.log('   Email: joao.silva@email.com');
    console.log('   Email: maria.santos@email.com');
    console.log('   Senha: senha123\n');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  }
}

module.exports = seed;
