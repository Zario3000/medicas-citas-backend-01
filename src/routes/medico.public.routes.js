const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 🔹 Listar médicos por especialidad (PÚBLICO)
router.get('/', async (req, res) => {
  const { especialidad_id } = req.query;

  try {
    const result = await pool.query(
      `SELECT 
         m.id,
         u.nombre
       FROM medico m
       JOIN usuario u ON u.id = m.usuario_id
       WHERE m.especialidad_id = $1`,
      [especialidad_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener médicos' });
  }
});

module.exports = router;
