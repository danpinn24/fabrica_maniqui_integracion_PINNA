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

// ==========================================
// --- ENDPOINTS PARA MANIQUÍES ---
// ==========================================

// 1. LISTAR MANIQUÍES (GET)
app.get('/api/maniquies', (req, res) => {
  res.json(maniquies);
});

// 2. OBTENER UN MANIQUÍ POR ID (GET)
app.get('/api/maniquies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const encontrado = maniquies.find(m => m.id === id);
  if (!encontrado) {
    return res.status(404).json({ error: "Maniquí no encontrado" });
  }
  res.json(encontrado);
});

// 3. ARMAR Y REGISTRAR NUEVO MANIQUÍ (POST)
app.post('/api/maniquies/armar', (req, res) => {
  const { gama, tamano, precio, piezasIds } = req.body;

  if (!gama || !precio || !piezasIds || !Array.isArray(piezasIds)) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para el armado.' });
  }

  
  const nuevoManiqui = {
    id: maniquies.length ? Math.max(...maniquies.map(m => m.id)) + 1 : 1,
    fecha_fabricacion: new Date().toISOString().split('T')[0],
    gama,
    tamano: tamano || 'Adulto',
    precio: parseFloat(precio),
    piezas_asociadas: piezasIds
  };

  maniquies.push(nuevoManiqui);

  const idsAusar = piezasIds.map(id => parseInt(id));
  piezas = piezas.map(p => {
    if (idsAusar.includes(p.id)) {
      return { ...p, disponible: false };
    }
    return p;
  });

  res.status(201).json({
    maniqui: nuevoManiqui,
    piezasActualizadas: piezas
  });
});

// 4. DESARMAR / ELIMINAR MANIQUÍ (DELETE)
app.delete('/api/maniquies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const maniquiADesarmar = maniquies.find(m => m.id === id);
  
  if (!maniquiADesarmar) {
    return res.status(404).json({ error: "Maniquí no encontrado" });
  }

  
  if (maniquiADesarmar.piezas_asociadas && Array.isArray(maniquiADesarmar.piezas_asociadas)) {
    const idsAregresar = maniquiADesarmar.piezas_asociadas.map(pId => parseInt(pId));
    
    piezas = piezas.map(p => {
      if (idsAregresar.includes(p.id)) {
        return { ...p, disponible: true }; 
      }
      return p;
    });
  }

  maniquies = maniquies.filter(m => m.id !== id);

  res.json({ 
    mensaje: "Maniquí desarmado. Sus componentes originales regresaron al depósito con todos sus detalles.",
    maniquiesActualizados: maniquies,
    piezasActualizadas: piezas
  });
});


// ==========================================
// --- ENDPOINTS PARA PIEZAS ---
// ==========================================

// 1. LISTAR PIEZAS (GET)
app.get('/api/piezas', (req, res) => {
  res.json(piezas);
});

// 2. CREAR NUEVA PIEZA (POST)
app.post('/api/piezas', (req, res) => {
  const datos = req.body; 

  if (!datos.tipo) {
    return res.status(400).json({ error: 'El tipo de pieza es obligatorio.' });
  }

  const nuevaPieza = {
    id: piezas.length ? Math.max(...piezas.map(p => p.id)) + 1 : 1,
    tipo: datos.tipo,
    color: datos.color || 'Blanco',
    tamano: datos.tamano || 'M',
    estado: 'Nueva',
    fecha_fabricacion: new Date().toISOString().split('T')[0],
    material: datos.material || 'Plástico',
    disponible: true // Nace disponible en el depósito
  };

  if (datos.tipo === 'Cabeza') {
    nuevaPieza.sexo = datos.sexo || 'No especificado';
    nuevaPieza.ojos = datos.ojos || 'Marrón';
  }

  piezas.push(nuevaPieza);
  res.status(201).json(nuevaPieza);
});

// 3. BORRAR PIEZA DEFINITIVAMENTE POR FALLA (DELETE)
app.delete('/api/piezas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  piezas = piezas.filter(p => p.id !== id);
  res.json({ mensaje: "Pieza eliminada del sistema." });
});

app.listen(PORT, () => {
  console.log(`Servidor de control corriendo en http://localhost:${PORT}`);
});