const { Router } = require("express");

const healthRoutes = require("./health.routes");
const usuarioRoutes = require("./usuario.routes");
const membroFamiliaRoutes = require("./membroFamilia.routes");
const contaCartaoRoutes = require("./contaCartao.routes");
const rendaRoutes = require("./renda.routes");
const parcelamentoRoutes = require("./parcelamento.routes");
const despesaRoutes = require("./despesa.routes");
const reservaRoutes = require("./reserva.routes");
const dashboardRoutes = require("./dashboard.routes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/membros-familia", membroFamiliaRoutes);
router.use("/contas-cartoes", contaCartaoRoutes);
router.use("/rendas", rendaRoutes);
router.use("/parcelamentos", parcelamentoRoutes);
router.use("/despesas", despesaRoutes);
router.use("/reservas", reservaRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
