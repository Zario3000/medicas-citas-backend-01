const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 🔹 Listar especialidades (PÚBLICO)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre FROM especialidad ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener especialidades' });
  }
});

module.exports = router;
