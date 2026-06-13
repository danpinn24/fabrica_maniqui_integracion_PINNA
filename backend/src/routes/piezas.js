import { Router } from 'express';
const router = Router();
import pool from '../db.js'; // Asegúrate de que la ruta a db.js sea la correcta desde tu carpeta de rutas

// Función auxiliar original corregida usando pool.query
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
    // CORRECCIÓN: Usar pool.query en lugar de query a secas
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
            // CORRECCIÓN: pool.query
            const [cabezaRes] = await pool.query(
                'INSERT INTO detalle_cabeza (tipo_ojo, tipo_cabello) VALUES (?, ?)',
                [datos.ojos || 'Marrón', 'Sintético']
            );
            idCabezaDetalle = cabezaRes.insertId;
        }

        // CORRECCIÓN: pool.query
        const [modeloExiste] = await pool.query(
            'SELECT id FROM modelo_pieza WHERE tipo = ? AND color = ? AND sexo = ? AND tamano = ?',
            [datos.tipo, datos.color || 'Blanco', datos.sexo || null, datos.tamano || 'M']
        );

        let idModelo;
        if (modeloExiste.length > 0) {
            idModelo = modeloExiste[0].id;
        } else {
            // CORRECCIÓN: pool.query
            const [nuevoModelo] = await pool.query(
                'INSERT INTO modelo_pieza (tipo, color, sexo, tamano, id_material, id_cabeza) VALUES (?, ?, ?, ?, ?, ?)',
                [datos.tipo, datos.color || 'Blanco', datos.sexo || null, datos.tamano || 'M', 1, idCabezaDetalle]
            );
            idModelo = nuevoModelo.insertId;
        }

        // CORRECCIÓN: pool.query
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
        // 1. VERIFICACIÓN DE SEGURIDAD: Comprobar si la pieza está siendo usada en un maniquí
        const [enUso] = await pool.query(
            'SELECT id_maniqui FROM ensamblaje WHERE id_pieza_fisica = ?', 
            [id]
        );

        if (enUso.length > 0) {
            // Si la consulta trae filas, significa que la pieza está ensamblada en un maniquí
            return res.status(400).json({ 
                error: `No se puede eliminar la pieza ID ${id} porque actualmente está asignada al Maniquí ID ${enUso[0].id_maniqui}. Primero debes desarmar ese maniquí.` 
            });
        }

        // 2. Si no está en uso, procedemos a borrarla de forma segura
        await pool.query('DELETE FROM pieza_fisica WHERE id = ?', [id]);
        
        res.json({ mensaje: 'Pieza eliminada correctamente del depósito.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al intentar eliminar la pieza: ' + error.message });
    }
});

// Exportamos la función auxiliar
router.obtenerPiezasConDisponibilidad = obtenerPiezasConDisponibilidad;
export default router;