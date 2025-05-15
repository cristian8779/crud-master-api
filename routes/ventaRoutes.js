const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/ventaController");
const verificarToken = require("../middlewares/verificarToken");
const esAdmin = require("../middlewares/esAdmin");

router.post("/", verificarToken, ventaController.crearVenta);
router.get("/usuario", verificarToken, ventaController.obtenerVentasUsuario);
router.get("/", verificarToken, esAdmin, ventaController.obtenerTodasLasVentas);
router.put("/:id", verificarToken, esAdmin, ventaController.actualizarEstadoVenta);

module.exports = router;

