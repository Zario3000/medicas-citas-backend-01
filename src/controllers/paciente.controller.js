const pool = require('../config/db');

exports.obtenerHorariosMedico = async (req, res) => {
  const { medicoId } = req.params;

  const result = await pool.query(
    `SELECT dia_semana, hora_inicio, hora_fin
     FROM horario
     WHERE medico_id = $1`,
    [medicoId]
  );

  res.json(result.rows);
};


exports.obtenerBloqueosMedico = async (req, res) => {
  const { medicoId } = req.params;

  try {
    const result = await pool.query(
      `SELECT fecha, hora_inicio, hora_fin
       FROM bloqueo_horario
       WHERE medico_id = $1`,
      [medicoId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('ERROR OBTENER BLOQUEOS:', error);
    res.status(500).json({ message: 'Error al obtener bloqueos' });
  }
};


exports.obtenerCitasOcupadas = async (req, res) => {
  const { medicoId } = req.params;

  const result = await pool.query(
    `SELECT fecha, hora
     FROM cita
     WHERE medico_id = $1
     AND estado = 'pendiente'`,
    [medicoId]
  );

  res.json(result.rows);
};
