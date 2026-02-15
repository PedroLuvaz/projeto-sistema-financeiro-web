const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * Retorna resumo mensal: total rendas, total despesas, saldo,
   * despesas por categoria, top 5 despesas
   */
  async resumoMensal(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { mes, ano } = req.query;

      if (!mes || !ano) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros mes e ano são obrigatórios'
        });
      }

      const resumo = await dashboardService.resumoMensal(idUsuario, mes, ano);
      return res.status(200).json({
        success: true,
        data: resumo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Relatório anual completo
   */
  async relatorioAnual(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { ano } = req.query;

      if (!ano) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro ano é obrigatório'
        });
      }

      const relatorio = await dashboardService.relatorioAnual(idUsuario, ano);
      return res.status(200).json({
        success: true,
        data: relatorio
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta relatório anual como CSV
   */
  async exportarRelatorioAnualCSV(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { ano } = req.query;

      if (!ano) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro ano é obrigatório'
        });
      }

      const csv = await dashboardService.exportarRelatorioAnualCSV(idUsuario, ano);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-anual-${ano}.csv`);
      return res.send('\ufeff' + csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
