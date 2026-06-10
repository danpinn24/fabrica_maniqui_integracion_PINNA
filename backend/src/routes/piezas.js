const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// Función auxiliar original para traer disponibilidad de piezas
async function obtenerPiezasConDisponibilidad() {
  const querySQL = `
    SELECT 
      pf.id, mp.tipo, mp.color, mp.sexo, mp.tamano, pf.estado, pf.fecha_fabricacion,
      dc.tipo_ojo AS ojos, dc.tipo_cabello AS pelo,
      IF(e.id_maniqui IS NULL, 1, 0) AS disponible_num
    FROM pieza_fisica pf
    JOIN modelo_pieza mp ON pf.id_modelo = mp.id
    LEFT JOIN detalle_cabeza dc ON mp.id_cabeza = dc.id
    LEFT JOIN ensamblaje e ON pf.id = e.id_pieza_fisica
    ORDER BY pf.id DESC
  `;
  const [rows] = await pool.query(querySQL);
  return rows.map(pieza => ({
    ...pieza,
    disponible: pieza.disponible_num === 1
  }));
}

// 4. LISTAR PIEZAS (GET)
router.get('/', async (req, res) => {
  try {
    const piezas = await obtenerPiezasConDisponibilidad();
    res.json(piezas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. FABRICAR NUEVA PIEZA (POST)
router.post('/', async (req, res) => {
  const datos = req.body;
  const fecha = new Date().toISOString().split('T')[0];

  try {
    let idCabezaDetalle = null;

    if (datos.tipo === 'Cabeza') {
      const [cabezaRes] = await pool.query(
        'INSERT INTO detalle_cabeza (tipo_ojo, tipo_cabello) VALUES (?, ?)',
        [datos.ojos || 'Marrón', 'Sintético']
      );
      idCabezaDetalle = cabezaRes.insertId;
    }

    const [modeloExiste] = await pool.query(
      'SELECT id FROM modelo_pieza WHERE tipo = ? AND color = ? AND sexo = ? AND tamano = ?',
      [datos.tipo, datos.color || 'Blanco', datos.sexo || null, datos.tamano || 'M']
    );

    let idModelo;
    if (modeloExiste.length > 0) {
      idModelo = modeloExiste[0].id;
    } else {
      const [nuevoModelo] = await pool.query(
        'INSERT INTO modelo_pieza (tipo, color, sexo, tamano, id_material, id_cabeza) VALUES (?, ?, ?, ?, ?, ?)',
        [datos.tipo, datos.color || 'Blanco', datos.sexo || null, datos.tamano || 'M', 1, idCabezaDetalle]
      );
      idModelo = nuevoModelo.insertId;
    }

    const [piezaFisicaRes] = await pool.query(
      'INSERT INTO pieza_fisica (fecha_fabricacion, estado, id_modelo) VALUES (?, ?, ?)',
      [fecha, 'Nueva', idModelo]
    );

    res.json({
      id: piezaFisicaRes.insertId,
      tipo: datos.tipo,
      sexo: datos.sexo,
      color: datos.color,
      tamano: datos.tamano,
      material: datos.material || 'Plástico',
      estado: 'Nueva',
      fecha_fabricacion: fecha,
      ojos: datos.ojos || 'Marrón',
      pelo: 'Sintético',
      disponible: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. ELIMINAR PIEZA FÍSICA (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ensamblaje WHERE id_pieza_fisica = ?', [id]);
    await pool.query('DELETE FROM pieza_fisica WHERE id = ?', [id]);
    res.json({ mensaje: 'Pieza eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exportamos la función auxiliar por si maniquies.js la necesita reusar
router.obtenerPiezasConDisponibilidad = obtenerPiezasConDisponibilidad;
module.exports = router;