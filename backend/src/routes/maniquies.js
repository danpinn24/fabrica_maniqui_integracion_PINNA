const express = require('express');
const router = express.Router();
const pool = require('../db'); // Pool compartido (Singleton)
const rutasPiezas = require('./piezas'); // Necesitamos su función de disponibilidad

// 1. LISTAR TODOS LOS MANIQUÍES EXISTENTES
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM maniqui');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. CREAR Y ENSAMBLAR UN NUEVO MANIQUÍ
router.post('/armar', async (req, res) => {
  const { gama, precio, tamano, piezasIds } = req.body;

  if (!gama || !precio || !piezasIds || piezasIds.length === 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o componentes.' });
  }

  try {
    const fecha = new Date().toISOString().split('T')[0];
    
    const [maniquiResult] = await pool.query(
      'INSERT INTO maniqui (fecha_fabricacion, gama, tamano, precio, id_deposito) VALUES (?, ?, ?, ?, ?)',
      [fecha, gama, tamano || 'Adulto', parseFloat(precio), 1]
    );
    const nuevoManiquiId = maniquiResult.insertId;

    for (const idPieza of piezasIds) {
      if (idPieza) {
        await pool.query(
          'INSERT INTO ensamblaje (id_maniqui, id_pieza_fisica) VALUES (?, ?)',
          [nuevoManiquiId, idPieza]
        );
      }
    }

   
    const piezasActualizadas = await rutasPiezas.obtenerPiezasConDisponibilidad();

    res.status(201).json({
      maniqui: {
        id: nuevoManiquiId,
        fecha_fabricacion: fecha,
        gama,
        tamano,
        precio,
        piezas_asociadas: piezasIds
      },
      piezasActualizadas: piezasActualizadas
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en MySQL al armar: ' + error.message });
  }
});

// 3. DESARMAR UN MANIQUÍ
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ensamblaje WHERE id_maniqui = ?', [id]);
    await pool.query('DELETE FROM maniqui WHERE id = ?', [id]);
    
    const piezasActualizadas = await rutasPiezas.obtenerPiezasConDisponibilidad();
    
    res.json({ 
      mensaje: 'Maniquí desarmado con éxito.', 
      piezasActualizadas: piezasActualizadas 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en MySQL al desarmar: ' + error.message });
  }
});

module.exports = router;