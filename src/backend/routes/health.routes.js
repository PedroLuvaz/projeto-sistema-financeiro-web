const { Router } = require("express");
const sequelize = require("../config/database");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    await sequelize.authenticate();

    return res.status(200).json({
      success: true,
      message: "API e banco funcionando normalmente.",
      database: "up",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
