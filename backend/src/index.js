import express, { json } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(json());


import rutasManiquies from './routes/maniquies.js';
import rutasPiezas from './routes/piezas.js';

app.use('/api/maniquies', rutasManiquies);
app.use('/api/piezas', rutasPiezas);

app.listen(PORT, () => {
  console.log(`🚀 Servidor modularizado y conectado a MySQL corriendo en http://localhost:${PORT}`);
});