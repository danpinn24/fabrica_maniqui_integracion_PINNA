const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());


const rutasManiquies = require('./routes/maniquies').default;
const rutasPiezas = require('./routes/piezas').default;

app.use('/api/maniquies', rutasManiquies);
app.use('/api/piezas', rutasPiezas);

app.listen(PORT, () => {
  console.log(`🚀 Servidor modularizado y conectado a MySQL corriendo en http://localhost:${PORT}`);
});