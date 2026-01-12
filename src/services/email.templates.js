exports.citaCreada = (data) => `
<h2>📅 Cita creada</h2>
<p>Hola <b>${data.paciente}</b>,</p>
<p>Tu cita fue creada correctamente.</p>
<ul>
  <li><b>Médico:</b> ${data.medico}</li>
  <li><b>Especialidad:</b> ${data.especialidad}</li>
  <li><b>Fecha:</b> ${data.fecha}</li>
  <li><b>Hora:</b> ${data.hora}</li>
</ul>
`;

exports.citaCancelada = (data) => `
<h2>❌ Cita cancelada</h2>
<p>La cita del <b>${data.fecha}</b> a las <b>${data.hora}</b> fue cancelada.</p>
`;

exports.citaReprogramada = (data) => `
<h2>🔄 Cita reprogramada</h2>
<p>Nueva fecha y hora:</p>
<ul>
  <li><b>Fecha:</b> ${data.fecha}</li>
  <li><b>Hora:</b> ${data.hora}</li>
</ul>
`;

exports.citaAtendida = () => `
<h2>✅ Cita atendida</h2>
<p>Tu cita fue atendida correctamente.</p>
`;
