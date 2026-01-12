const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// 🔐 TODAS ESTAS RUTAS SON SOLO PARA ADMIN

// CRUD MÉDICOS
router.post(
  '/medicos',
  verifyToken(['ADMIN']),
  adminController.crearMedico
);

router.get(
  '/medicos',
  verifyToken(['ADMIN']),
  adminController.listarMedicos
);

router.put(
  '/medicos/:id',
  verifyToken(['ADMIN']),
  adminController.editarMedico
);

router.delete(
  '/medicos/:id',
  verifyToken(['ADMIN']),
  adminController.eliminarMedico
);

// HORARIOS
router.post(
  '/horarios',
  verifyToken(['ADMIN']),
  adminController.asignarHorario
);

// BLOQUEOS
router.post(
  '/medicos/:id/bloqueos',
  verifyToken(['ADMIN']),
  adminController.bloquearHorario
);

router.get(
  '/citas',
  verifyToken(['ADMIN']),
  adminController.listarCitas
);

router.get('/pacientes', verifyToken(['ADMIN']), adminController.listarPacientes);
router.post('/pacientes', verifyToken(['ADMIN']), adminController.crearPaciente);
router.put('/usuarios/:id', verifyToken(['ADMIN']), adminController.editarUsuario);
router.delete('/usuarios/:id', verifyToken(['ADMIN']), adminController.eliminarUsuario);


module.exports = router;

