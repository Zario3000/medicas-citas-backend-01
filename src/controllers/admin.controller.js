// 1️⃣ IMPORTACIONES
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// 2️⃣ CREAR MÉDICO
exports.crearMedico = async (req, res) => {
  const { nombre, email, password, especialidad_id, telefono } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const usuarioResult = await pool.query(
      `INSERT INTO usuario (nombre, email, password, rol)
       VALUES ($1, $2, $3, 'MEDICO')
       RETURNING id`,
      [nombre, email, hashedPassword]
    );

    const usuarioId = usuarioResult.rows[0].id;

    await pool.query(
      `INSERT INTO medico (usuario_id, especialidad_id, telefono)
       VALUES ($1, $2, $3)`,
      [usuarioId, especialidad_id, telefono]
    );

    res.status(201).json({ message: 'Médico creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear médico' });
  }
};

// 3️⃣ LISTAR MÉDICOS
exports.listarMedicos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, u.nombre, u.email, e.nombre AS especialidad, m.telefono
      FROM medico m
      JOIN usuario u ON u.id = m.usuario_id
      JOIN especialidad e ON e.id = m.especialidad_id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar médicos' });
  }
};

// 4️⃣ EDITAR MÉDICO
exports.editarMedico = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, especialidad_id } = req.body;

  try {
    await pool.query(
      `UPDATE usuario SET nombre = $1
       WHERE id = (SELECT usuario_id FROM medico WHERE id = $2)`,
      [nombre, id]
    );

    await pool.query(
      `UPDATE medico SET telefono = $1, especialidad_id = $2
       WHERE id = $3`,
      [telefono, especialidad_id, id]
    );

    res.json({ message: 'Médico actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al editar médico' });
  }
};

// 5️⃣ ELIMINAR MÉDICO
exports.eliminarMedico = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `DELETE FROM usuario
       WHERE id = (SELECT usuario_id FROM medico WHERE id = $1)`,
      [id]
    );

    res.json({ message: 'Médico eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar médico' });
  }
};

// 6️⃣ ASIGNAR HORARIO
exports.asignarHorario = async (req, res) => {
  const { medico_id, dia_semana, hora_inicio, hora_fin } = req.body;

  try {
    await pool.query(
      `INSERT INTO horario (medico_id, dia_semana, hora_inicio, hora_fin)
       VALUES ($1, $2, $3, $4)`,
      [medico_id, dia_semana, hora_inicio, hora_fin]
    );

    res.json({ message: 'Horario asignado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al asignar horario' });
  }
};

// 7️⃣ BLOQUEAR FECHA COMPLETA
exports.bloquearHorario = async (req, res) => {
  const medicoId = req.params.id;
  const { fecha, motivo } = req.body;

  try {
    await pool.query(
      `INSERT INTO bloqueo_horario (medico_id, fecha, motivo)
       VALUES ($1, $2, $3)`,
      [medicoId, fecha, motivo]
    );

    res.json({ message: 'Fecha bloqueada correctamente' });
  } catch (error) {
    console.error('ERROR BLOQUEO:', error.message);
    res.status(500).json({ message: 'Error al bloquear horario' });
  }
};


// LISTAR TODAS LAS CITAS (ADMIN)
exports.listarCitas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.fecha,
        c.hora,
        c.estado,
        e.nombre AS especialidad,
        um.nombre AS medico,
        up.nombre AS paciente
      FROM cita c
      JOIN medico m ON m.id = c.medico_id
      JOIN usuario um ON um.id = m.usuario_id
      JOIN usuario up ON up.id = c.paciente_id
      JOIN especialidad e ON e.id = c.especialidad_id
      ORDER BY c.fecha, c.hora
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar citas' });
  }
};

// LISTAR PACIENTES
exports.listarPacientes = async (req, res) => {
  const result = await pool.query(
    `SELECT id, nombre, email
     FROM usuario
     WHERE rol = 'PACIENTE'`
  );
  res.json(result.rows);
};

// CREAR PACIENTE
exports.crearPaciente = async (req, res) => {
  const { nombre, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  await pool.query(
    `INSERT INTO usuario (nombre, email, password, rol)
     VALUES ($1, $2, $3, 'PACIENTE')`,
    [nombre, email, hash]
  );

  res.json({ message: 'Paciente creado' });
};

// EDITAR USUARIO
exports.editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body;

  await pool.query(
    `UPDATE usuario SET nombre = $1, email = $2 WHERE id = $3`,
    [nombre, email, id]
  );

  res.json({ message: 'Usuario actualizado' });
};

// ELIMINAR USUARIO
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  await pool.query(`DELETE FROM usuario WHERE id = $1`, [id]);

  res.json({ message: 'Usuario eliminado' });
};


