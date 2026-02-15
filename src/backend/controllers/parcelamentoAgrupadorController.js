const parcelamentoAgrupadorService = require('../services/parcelamentoAgrupadorService');

class ParcelamentoAgrupadorController {
  async criar(req, res, next) {
    try {
      const parcelamento = await parcelamentoAgrupadorService.criar(req.body);
      return res.status(201).json({
        success: true,
        data: parcelamento
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const parcelamento = await parcelamentoAgrupadorService.buscarPorId(id);
      return res.status(200).json({
        success: true,
        data: parcelamento
      });
    } catch (error) {
      next(error);
    }
  }

  async listarPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const parcelamentos = await parcelamentoAgrupadorService.listarPorUsuario(idUsuario);
      return res.status(200).json({
        success: true,
        data: parcelamentos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna o total de dívidas futuras (parcelas com data > hoje)
   */
  async dividasFuturas(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const total = await parcelamentoAgrupadorService.calcularDividasFuturas(idUsuario);
      return res.status(200).json({
        success: true,
        data: { total_dividas_futuras: total }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna cronograma de pagamentos futuros por mês
   */
  async cronograma(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const cronograma = await parcelamentoAgrupadorService.cronogramaPagamentos(idUsuario);
      return res.status(200).json({
        success: true,
        data: cronograma
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna fatura por cartão/conta em um mês específico
   */
  async faturaPorCartao(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { mes, ano } = req.query;

      if (!mes || !ano) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros mes e ano são obrigatórios'
        });
      }

      const faturas = await parcelamentoAgrupadorService.faturaPorCartao(idUsuario, parseInt(mes), parseInt(ano));
      return res.status(200).json({
        success: true,
        data: faturas
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const parcelamento = await parcelamentoAgrupadorService.atualizar(id, req.body);
      return res.status(200).json({
        success: true,
        data: parcelamento
      });
    } catch (error) {
      next(error);
    }
  }

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await parcelamentoAgrupadorService.deletar(id);
      return res.status(200).json({
        success: true,
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ParcelamentoAgrupadorController();
