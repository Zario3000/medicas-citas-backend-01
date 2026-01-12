const express = require('express');
const router = express.Router();

const citaController = require('../controllers/cita.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const pacienteController = require('../controllers/paciente.controller');


// 📌 CREAR CITA
router.post(
  '/citas',
  verifyToken(['PACIENTE']),
  citaController.crearCita
);

// 📌 LISTAR CITAS DEL PACIENTE
router.get(
  '/citas',
  verifyToken(['PACIENTE']),
  citaController.listarMisCitas
);
router.get('/horarios/:medicoId', verifyToken(['PACIENTE']), pacienteController.obtenerHorariosMedico);
router.get('/bloqueos/:medicoId', verifyToken(['PACIENTE']), pacienteController.obtenerBloqueosMedico);
router.get('/citas/:medicoId', verifyToken(['PACIENTE']), pacienteController.obtenerCitasOcupadas);

// 📌 CANCELAR CITA
router.put(
  '/citas/:id/cancelar',
  verifyToken(['PACIENTE']),
  citaController.cancelarCita
);

// 📌 REPROGRAMAR CITA
router.put(
  '/citas/:id/reprogramar',
  verifyToken(['PACIENTE']),
  citaController.reprogramarCita
);




module.exports = router;
