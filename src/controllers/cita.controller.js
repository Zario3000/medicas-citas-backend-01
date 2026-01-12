console.log('🔥 CITA CONTROLLER ACTIVO - VERSION CORRECTA');

const pool = require('../config/db');

const { enviarEmail } = require('../services/email.service');
const templates = require('../services/email.templates');



// 1️⃣ CREAR CITA
exports.crearCita = async (req, res) => {
  const { medico_id, fecha, hora, especialidad_id } = req.body;
  const paciente_id = req.user.id;

  try {
    // PASO 3️⃣: VALIDAR FECHA BLOQUEADA COMPLETA
    const bloqueoFecha = await pool.query(
      `SELECT 1
       FROM bloqueo_horario
       WHERE medico_id = $1
       AND fecha = $2
       AND hora_inicio IS NULL
       AND hora_fin IS NULL`,
      [medico_id, fecha]
    );

    if (bloqueoFecha.rowCount > 0) {
      return res.status(400).json({
        message: 'La fecha seleccionada está bloqueada'
      });
    }

    // PASO 4️⃣: VALIDAR HORARIO BLOQUEADO
    const bloqueoHora = await pool.query(
      `SELECT 1
       FROM bloqueo_horario
       WHERE medico_id = $1
       AND fecha = $2
       AND hora_inicio IS NOT NULL
       AND hora_fin IS NOT NULL
       AND $3 BETWEEN hora_inicio AND hora_fin`,
      [medico_id, fecha, hora]
    );

    if (bloqueoHora.rowCount > 0) {
      return res.status(400).json({
        message: 'El horario seleccionado está bloqueado'
      });
    }

    // PASO 5️⃣: VALIDAR CITA YA EXISTENTE
    const citaExistente = await pool.query(
      `SELECT 1
       FROM cita
       WHERE medico_id = $1
       AND fecha = $2
       AND hora = $3
       AND estado = 'pendiente'`,
      [medico_id, fecha, hora]
    );

    if (citaExistente.rowCount > 0) {
      return res.status(400).json({
        message: 'Horario no disponible'
      });
    }

    // PASO 6️⃣: CREAR CITA
    await pool.query(
      `INSERT INTO cita
       (medico_id, paciente_id, fecha, hora, estado, especialidad_id)
       VALUES ($1, $2, $3, $4, 'pendiente', $5)`,
      [medico_id, paciente_id, fecha, hora, especialidad_id]
    );

    return res.json({ message: 'Cita creada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear cita' });
  }
};


// 2️⃣ LISTAR CITAS DEL PACIENTE
exports.listarMisCitas = async (req, res) => {
  const paciente_id = req.user.id;
  const { estado } = req.query; // opcional

  try {
    let query = `
      SELECT
        c.id,
        c.fecha,
        c.hora,
        c.estado,
        e.nombre AS especialidad,
        u.nombre AS medico
      FROM cita c
      JOIN especialidad e ON e.id = c.especialidad_id
      JOIN medico m ON m.id = c.medico_id
      JOIN usuario u ON u.id = m.usuario_id
      WHERE c.paciente_id = $1
    `;

    const params = [paciente_id];

    if (estado) {
      query += ` AND c.estado = $2`;
      params.push(estado);
    }

    query += ` ORDER BY c.fecha, c.hora`;

    const result = await pool.query(query, params);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar citas' });
  }
};

// 3️⃣ CANCELAR CITA
exports.cancelarCita = async (req, res) => {
  const cita_id = req.params.id;
  const paciente_id = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE cita
       SET estado = 'cancelada'
       WHERE id = $1
       AND paciente_id = $2
       AND estado = 'pendiente'
       RETURNING id`,
      [cita_id, paciente_id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        message: 'No se puede cancelar esta cita'
      });
    }
   // 📧 Obtener datos para email (cancelación)
const info = await pool.query(
  `SELECT
     p.email AS paciente_email,
     p.nombre AS paciente,
     u.nombre AS medico,
     c.fecha,
     c.hora
   FROM cita c
   JOIN usuario p ON p.id = c.paciente_id
   JOIN medico m ON m.id = c.medico_id
   JOIN usuario u ON u.id = m.usuario_id
   WHERE c.id = $1`,
  [cita_id]
);

await enviarEmail({
  to: info.rows[0].paciente_email,
  subject: 'Cita cancelada',
  html: templates.citaCancelada({
    paciente: info.rows[0].paciente,
    medico: info.rows[0].medico,
    fecha: info.rows[0].fecha,
    hora: info.rows[0].hora
  })
});

    res.json({ message: 'Cita cancelada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cancelar cita' });
  }
};

// 4️⃣ REPROGRAMAR CITA
exports.reprogramarCita = async (req, res) => {
  const cita_id = req.params.id;
  const paciente_id = req.user.id;
  const { fecha, hora } = req.body;

  try {
    // 1️⃣ Obtener datos de la cita
    const cita = await pool.query(
      `SELECT medico_id
       FROM cita
       WHERE id = $1
       AND paciente_id = $2
       AND estado = 'pendiente'`,
      [cita_id, paciente_id]
    );

    if (cita.rowCount === 0) {
      return res.status(400).json({
        message: 'No se puede reprogramar esta cita'
      });
    }

    const medico_id = cita.rows[0].medico_id;

    // 2️⃣ Verificar bloqueo
    const bloqueo = await pool.query(
      `SELECT 1 FROM bloqueo_horario
       WHERE medico_id = $1
       AND fecha = $2
       AND $3 BETWEEN hora_inicio AND hora_fin`,
      [medico_id, fecha, hora]
    );

    if (bloqueo.rowCount > 0) {
      return res.status(400).json({
        message: 'Horario bloqueado'
      });
    }

    // 3️⃣ Verificar cita existente
    const citaExistente = await pool.query(
      `SELECT 1 FROM cita
       WHERE medico_id = $1
       AND fecha = $2
       AND hora = $3
       AND estado = 'pendiente'`,
      [medico_id, fecha, hora]
    );

    if (citaExistente.rowCount > 0) {
      return res.status(400).json({
        message: 'Horario no disponible'
      });
    }

    // 4️⃣ Reprogramar
    await pool.query(
      `UPDATE cita
       SET fecha = $1,
           hora = $2,
           estado = 'reprogramada'
       WHERE id = $3`,
      [fecha, hora, cita_id]
    );

    // 📧 Obtener datos para email (cancelación)
const info = await pool.query(
  `SELECT
     p.email AS paciente_email,
     p.nombre AS paciente,
     u.nombre AS medico,
     c.fecha,
     c.hora
   FROM cita c
   JOIN usuario p ON p.id = c.paciente_id
   JOIN medico m ON m.id = c.medico_id
   JOIN usuario u ON u.id = m.usuario_id
   WHERE c.id = $1`,
  [cita_id]
);

await enviarEmail({
  to: info.rows[0].paciente_email,
  subject: 'Cita cancelada',
  html: templates.citaCancelada({
    paciente: info.rows[0].paciente,
    medico: info.rows[0].medico,
    fecha: info.rows[0].fecha,
    hora: info.rows[0].hora
  })
});


    res.json({ message: 'Cita reprogramada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al reprogramar cita' });
  }
};
// 8️⃣ LISTAR CITAS DEL MÉDICO
exports.listarCitasMedico = async (req, res) => {
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

// 9️⃣ MARCAR CITA COMO ATENDIDA
exports.atenderCita = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;

  try {
    // verificar que la cita pertenezca al médico
    const valida = await pool.query(
      `SELECT c.id
       FROM cita c
       JOIN medico m ON m.id = c.medico_id
       WHERE c.id = $1 AND m.usuario_id = $2`,
      [id, usuario_id]
    );

    if (valida.rowCount === 0) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await pool.query(
      `UPDATE cita
       SET estado = 'atendida'
       WHERE id = $1`,
      [id]
    );

    res.json({ message: 'Cita marcada como atendida' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al atender cita' });
  }
};
