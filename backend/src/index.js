const express = require('express');
const cors = require('cors');


let maniquies = require('./data/maniquies');
let piezas = require('./data/piezas');

const app = express();
const PORT = 3001;


app.use(cors());
app.use(express.json()); 


app.get('/', (req, res) => {
  res.send('Servidor de la Fábrica de Maniquíes corriendo perfectamente.');
});




app.get('/api/maniquies', (req, res) => {
  res.json(maniquies);
});


app.post('/api/maniquies', (req, res) => {
  const { gama, tamano, precio, id_deposito } = req.body;

  
  if (!gama || !precio) {
    return res.status(400).json({ error: 'La gama y el precio son obligatorios.' });
  }

  const nuevoManiqui = {
    id: maniquies.length ? Math.max(...maniquies.map(m => m.id)) + 1 : 1,
    fecha_fabricacion: new Date().toISOString().split('T')[0], // Fecha actual YYYY-MM-DD
    gama,
    tamano: tamano || 'Adulto',
    precio: parseFloat(precio),
    id_deposito: id_deposito ? parseInt(id_deposito) : null
  };

  maniquies.push(nuevoManiqui);
  res.status(201).json(nuevoManiqui);
});

app.delete('/api/maniquies/:id', (req, res) => {
  const idBorrar = parseInt(req.params.id);

  maniquies = maniquies.filter(m => m.id !== idBorrar);

  res.json({ mensaje: "Eliminado correctamente" });
});


app.get('/api/maniquies/:id', (req, res) => {
  const idBuscar = parseInt(req.params.id);

  
  const encontrado = maniquies.find(m => m.id === idBuscar);

 
  if (!encontrado) {
    return res.status(404).json({ error: "Maniquí no encontrado" });
  }

  // Si existe, lo devolvemos
  res.json(encontrado);
});
// --- ENDPOINTS PARA PIEZAS (CABEZAS) ---

// 1. LISTAR PIEZAS (GET)
app.get('/api/piezas', (req, res) => {
  res.json(piezas);
});

// 2. CREAR NUEVA CABEZA (POST)
app.post('/api/piezas', (req, res) => {
  const datos = req.body; 

  const nuevaPieza = {
    id: piezas.length ? Math.max(...piezas.map(p => p.id)) + 1 : 1,
    tipo: datos.tipo,
    sexo: datos.sexo,
    piel: datos.piel,
    ojos: datos.ojos,
    pelo: datos.pelo,
    estado: 'Nueva',
    fecha_fabricacion: new Date().toISOString().split('T')[0] // Fecha de hoy
  };

  piezas.push(nuevaPieza);
  res.json(nuevaPieza);
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});