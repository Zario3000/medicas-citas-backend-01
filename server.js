require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4000;
const adminRoutes = require('./src/routes/admin.routes');
const citaRoutes = require('./src/routes/cita.routes');
const medicoRoutes = require('./src/routes/medico.routes');
const especialidadRoutes = require('./src/routes/especialidad.routes');
const medicoPublicRoutes = require('./src/routes/medico.public.routes');
const pacienteRoutes = require('./src/routes/paciente.routes');


app.get('/', (req, res) => {
  res.send('API de Citas Médicas UNAMBA funcionando correctamente');
});


app.use('/api/paciente', pacienteRoutes);


app.use('/api/medicos', medicoPublicRoutes);


app.use('/api/especialidades', especialidadRoutes);

app.use('/api/medico', medicoRoutes);

app.use('/api/citas', citaRoutes);

app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
