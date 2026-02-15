const { MembroFamilia } = require('../models');

class MembroFamiliaService {
  async criar(dados) {
    const membro = await MembroFamilia.create(dados);
    return membro;
  }

  async buscarPorId(id) {
    const membro = await MembroFamilia.findByPk(id);
    
    if (!membro) {
      throw new Error('Membro da família não encontrado');
    }
    
    return membro;
  }

  async listarPorUsuario(idUsuario) {
    const membros = await MembroFamilia.findAll({
      where: { Id_Usuario: idUsuario },
      order: [['Nome_Membro', 'ASC']]
    });
    
    return membros;
  }

  async atualizar(id, dados) {
    const membro = await this.buscarPorId(id);
    await membro.update(dados);
    return membro;
  }

  async deletar(id) {
    const membro = await this.buscarPorId(id);
    await membro.destroy();
    return { mensagem: 'Membro da família deletado com sucesso' };
  }
}

module.exports = new MembroFamiliaService();
