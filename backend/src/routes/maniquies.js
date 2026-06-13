import { Router } from 'express';
const router = Router();

import pool from '../db.js'; 
import rutasPiezas from './piezas.js'; 

// Importamos la función desde el router de piezas para refrescar la disponibilidad en tiempo real
const obtenerPiezasConDisponibilidad = rutasPiezas.obtenerPiezasConDisponibilidad;

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

        // Insertar cabecera del Maniquí
        const [maniquiResult] = await pool.query(
            'INSERT INTO maniqui (fecha_fabricacion, gama, tamano, precio, id_deposito) VALUES (?, ?, ?, ?, ?)',
            [fecha, gama, tamano || 'Adulto', parseFloat(precio), 1]
        );
        const nuevoManiquiId = maniquiResult.insertId;

        // Registrar cada una de las 6 piezas en la tabla relacional de ensamblaje
        for (const idPieza of piezasIds) {
            if (idPieza) {
                await pool.query(
                    'INSERT INTO ensamblaje (id_maniqui, id_pieza_fisica) VALUES (?, ?)',
                    [nuevoManiquiId, idPieza]
                );
            }
        }

        // Recalculamos el stock usando la función del archivo piezas.js
        const piezasActualizadas = await obtenerPiezasConDisponibilidad();

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
        // Rompemos las relaciones de ensamblaje primero para liberar las piezas físicas
        await pool.query('DELETE FROM ensamblaje WHERE id_maniqui = ?', [id]);
        await pool.query('DELETE FROM maniqui WHERE id = ?', [id]);

        const piezasActualizadas = await obtenerPiezasConDisponibilidad();

        res.json({
            mensaje: 'Maniquí desarmado con éxito.',
            piezasActualizadas: piezasActualizadas
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;