const express = require('express');
const router = express.Router();

const citaController = require('../controllers/cita.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// SOLO PACIENTE
router.post(
  '/',
  verifyToken(['PACIENTE']),
  citaController.crearCita
);

// LISTAR CITAS DEL PACIENTE
router.get(
  '/mis-citas',
  verifyToken(['PACIENTE']),
  citaController.listarMisCitas
);

// CANCELAR CITA (PACIENTE)
router.put(
  '/:id/cancelar',
  verifyToken(['PACIENTE']),
  citaController.cancelarCita
);

// REPROGRAMAR CITA (PACIENTE)
router.put(
  '/:id/reprogramar',
  verifyToken(['PACIENTE']),
  citaController.reprogramarCita
);


module.exports = router;
