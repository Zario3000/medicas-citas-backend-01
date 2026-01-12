const pool = require('../config/db');

// 1️⃣ LISTAR CITAS DEL MÉDICO
exports.listarMisCitas = async (req, res) => {
  const usuario_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT
         c.id,
         c.fecha,
         c.hora,
         c.estado,
         u.nombre AS paciente,
         e.nombre AS especialidad
       FROM cita c
       JOIN usuario u ON u.id = c.paciente_id
       JOIN especialidad e ON e.id = c.especialidad_id
       JOIN medico m ON m.id = c.medico_id
       WHERE m.usuario_id = $1
       ORDER BY c.fecha, c.hora`,
      [usuario_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar citas del médico' });
  }
};

// 2️⃣ MARCAR CITA COMO ATENDIDA
exports.atenderCita = async (req, res) => {
  const cita_id = req.params.id;
  const usuario_id = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE cita
       SET estado = 'atendida'
       WHERE id = $1
       AND estado <> 'cancelada'
       AND medico_id = (
         SELECT id FROM medico WHERE usuario_id = $2
       )
       RETURNING id`,
      [cita_id, usuario_id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        message: 'No se puede atender esta cita'
      });
    }
   // 📧 Email reprogramación
const info = await pool.query(
  `SELECT
     p.email AS paciente_email,
     p.nombre AS paciente,
     u.nombre AS medico
   FROM cita c
   JOIN usuario p ON p.id = c.paciente_id
   JOIN medico m ON m.id = c.medico_id
   JOIN usuario u ON u.id = m.usuario_id
   WHERE c.id = $1`,
  [cita_id]
);

await enviarEmail({
  to: info.rows[0].paciente_email,
  subject: 'Cita reprogramada',
  html: templates.citaReprogramada({
    paciente: info.rows[0].paciente,
    medico: info.rows[0].medico,
    fecha,
    hora
  })
});

    res.json({ message: 'Cita marcada como atendida' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al atender cita' });
  }
};
