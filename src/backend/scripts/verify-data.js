const models = require('../models');
const { sequelize } = models;

async function verificarDados() {
  try {
    console.log('🔍 Verificando dados no banco de dados...\n');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao PostgreSQL\n');

    // Verificar usuários
    const usuarios = await models.Usuario.findAll({
      attributes: ['Id_Usuario', 'Nome', 'Email', 'Data_Criacao']
    });
    console.log(`📊 USUÁRIOS (${usuarios.length}):`);
    usuarios.forEach(u => {
      console.log(`  - ${u.Nome} (${u.Email}) - ID: ${u.Id_Usuario}`);
    });
    console.log();

    // Verificar membros da família
    const membros = await models.MembroFamilia.findAll({
      include: [{
        model: models.Usuario,
        as: 'usuario',
        attributes: ['Nome']
      }]
    });
    console.log(`👨‍👩‍👧‍👦 MEMBROS DA FAMÍLIA (${membros.length}):`);
    membros.forEach(m => {
      console.log(`  - ${m.Nome_Membro} (${m.Parentesco}) - Usuário: ${m.usuario?.Nome}`);
    });
    console.log();

    // Verificar contas/cartões
    const contas = await models.ContaCartao.findAll({
      include: [{
        model: models.Usuario,
        as: 'usuario',
        attributes: ['Nome']
      }]
    });
    console.log(`💳 CONTAS/CARTÕES (${contas.length}):`);
    contas.forEach(c => {
      console.log(`  - ${c.Nome_Conta} (${c.Tipo}) - ${c.Cor_Hex} - Usuário: ${c.usuario?.Nome}`);
    });
    console.log();

    // Verificar rendas
    const rendas = await models.Renda.findAll({
      include: [{
        model: models.Usuario,
        as: 'usuario',
        attributes: ['Nome']
      }]
    });
    console.log(`💰 RENDAS (${rendas.length}):`);
    rendas.forEach(r => {
      console.log(`  - ${r.Descricao_Renda}: R$ ${parseFloat(r.Valor_Renda).toFixed(2)} em ${r.Data} - Usuário: ${r.usuario?.Nome}`);
    });
    console.log();

    // Verificar parcelamentos
    const parcelamentos = await models.ParcelamentoAgrupador.findAll({
      include: [{
        model: models.Usuario,
        as: 'usuario',
        attributes: ['Nome']
      }]
    });
    console.log(`📦 PARCELAMENTOS (${parcelamentos.length}):`);
    parcelamentos.forEach(p => {
      console.log(`  - ${p.Descricao_Parcela}: R$ ${parseFloat(p.Valor_Total).toFixed(2)} em ${p.Qtd_Parcelas}x - Usuário: ${p.usuario?.Nome}`);
    });
    console.log();

    // Verificar despesas
    const despesas = await models.Despesa.findAll({
      include: [
        {
          model: models.Usuario,
          as: 'usuario',
          attributes: ['Nome']
        },
        {
          model: models.ContaCartao,
          as: 'conta',
          attributes: ['Nome_Conta']
        }
      ]
    });
    console.log(`💸 DESPESAS (${despesas.length}):`);
    despesas.forEach(d => {
      console.log(`  - ${d.Descricao_Despesa}: R$ ${parseFloat(d.Valor_Parcela).toFixed(2)} (${d.Categoria}) em ${d.Data}`);
      console.log(`    Conta: ${d.conta?.Nome_Conta} - Usuário: ${d.usuario?.Nome}`);
    });
    console.log();

    // Verificar reservas
    const reservas = await models.Reserva.findAll({
      include: [{
        model: models.Usuario,
        as: 'usuario',
        attributes: ['Nome']
      }]
    });
    console.log(`🎯 RESERVAS (${reservas.length}):`);
    reservas.forEach(r => {
      const progresso = r.Valor_Alvo > 0 ? ((parseFloat(r.Valor_Atual) / parseFloat(r.Valor_Alvo)) * 100).toFixed(2) : 0;
      console.log(`  - ${r.Nome_Objetivo}: R$ ${parseFloat(r.Valor_Atual).toFixed(2)} / R$ ${parseFloat(r.Valor_Alvo).toFixed(2)} (${progresso}%)`);
      console.log(`    Usuário: ${r.usuario?.Nome}`);
    });
    console.log();

    console.log('✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

verificarDados();
