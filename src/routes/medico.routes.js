const express = require('express');
const router = express.Router();

const medicoController = require('../controllers/medico.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// VER CITAS DEL MÉDICO
router.get(
  '/citas',
  verifyToken(['MEDICO']),
  medicoController.listarMisCitas
);

// MARCAR CITA COMO ATENDIDA
router.put(
  '/citas/:id/atender',
  verifyToken(['MEDICO']),
  medicoController.atenderCita
);

module.exports = router;
