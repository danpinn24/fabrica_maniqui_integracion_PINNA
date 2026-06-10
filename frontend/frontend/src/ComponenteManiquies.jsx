import { useState } from 'react';

function ComponenteManiquies({ maniquies, piezas, setManiquies, setPiezasActualizadas }) {
  // --- ESTADOS LOCALES DEL FORMULARIO ---
  const [gama, setGama] = useState('');
  const [precio, setPrecio] = useState('');
  const [tamanoManiqui, setTamanoManiqui] = useState('Adulto');
  
  // Selectores de las 6 piezas obligatorias
  const [cabezaSel, setCabezaSel] = useState('');
  const [torsoSel, setTorsoSel] = useState('');
  const [brazoDerSel, setBrazoDerSel] = useState('');
  const [brazoIzqSel, setBrazoIzqSel] = useState('');
  const [piernaDerSel, setPiernaDerSel] = useState('');
  const [piernaIzqSel, setPiernaIzqSel] = useState('');

  // --- ACCIÓN: ARMAR MANIQUÍ ---
  const armarNuevoManiqui = (e) => {
    e.preventDefault();

    const piezasIds = [cabezaSel, torsoSel, brazoDerSel, brazoIzqSel, piernaDerSel, piernaIzqSel]
      .map(id => parseInt(id));

    if (piezasIds.some(id => isNaN(id))) {
      alert("Por favor, selecciona las 6 piezas reglamentarias para armar el maniquí.");
      return;
    }

    const ordenArmado = {
      gama,
      precio: parseFloat(precio),
      tamano: tamanoManiqui,
      piezasIds: piezasIds
    };

    fetch('http://localhost:3001/api/maniquies/armar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ordenArmado)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then(data => {
        setManiquies([...maniquies, data.maniqui]);
        
        if (data.piezasActualizadas && typeof setPiezasActualizadas === 'function') {
          setPiezasActualizadas(data.piezasActualizadas);
        }

        setGama('');
        setPrecio('');
        setCabezaSel('');
        setTorsoSel('');
        setBrazoDerSel('');
        setBrazoIzqSel('');
        setPiernaDerSel('');
        setPiernaIzqSel('');

        alert("¡Maniquí registrado y ensamblado correctamente!");
      })
      .catch(err => {
        console.error(err);
        alert("Error al armar el maniquí.");
      });
  };

  // --- ACCIÓN: DESARMAR / ELIMINAR MANIQUÍ ---
  const desarmarManiqui = (id) => {
    if (window.confirm("¿Seguro de desarmar este maniquí? Las piezas regresarán al depósito.")) {
      fetch(`http://localhost:3001/api/maniquies/${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(data => {
          setManiquies(maniquies.filter(m => m.id !== id));
          
          if (data.piezasActualizadas && typeof setPiezasActualizadas === 'function') {
            setPiezasActualizadas(data.piezasActualizadas);
          }
          
          alert("¡Maniquí desarmado con éxito! Las piezas volvieron al depósito.");
        })
        .catch(err => {
          console.error("Error al desarmar:", err);
          alert("Hubo un error en el servidor al desarmar el maniquí.");
        });
    }
  };

  return (
    <div className="seccion-contenedor">
      <div className="tarjeta-formulario">
        <h3 className="formulario-titulo">🛠️ Armado Avanzado de Maniquíes</h3>
        
        <form onSubmit={armarNuevoManiqui} className="grid-formulario">
          <div className="grupo-input">
            <label>Gama del Maniquí</label>
            <select value={gama} onChange={(e) => setGama(e.target.value)} required>
              <option value="">Seleccionar gama...</option>
              <option value="Alta">Alta Gama</option>
              <option value="Media">Media</option>
              <option value="Económica">Económica</option>
            </select>
          </div>

          <div className="grupo-input">
            <label>Precio de Venta ($)</label>
            <input 
              type="number" 
              value={precio} 
              onChange={(e) => setPrecio(e.target.value)} 
              placeholder="Ej: 45000" 
              required 
            />
          </div>

          <div className="grupo-input">
            <label>Tamaño Estructural</label>
            <select value={tamanoManiqui} onChange={(e) => setTamanoManiqui(e.target.value)}>
              <option value="Adulto">Adulto</option>
              <option value="Niño">Niño</option>
              <option value="Exhibición Especial">Exhibición Especial</option>
            </select>
          </div>

          <div className="grupo-input">
            <label>Cabeza (Detalle Facial)</label>
            <select value={cabezaSel} onChange={(e) => setCabezaSel(e.target.value)} required>
              <option value="">Seleccionar cabeza...</option>
              {piezas.filter(p => p.tipo === 'Cabeza' && p.disponible !== false).map(p => (
                <option key={p.id} value={p.id}>ID: {p.id} ({p.color} — Ojos: {p.ojos || 'Común'})</option>
              ))}
            </select>
          </div>

          <div className="grupo-input">
            <label>Torso</label>
            <select value={torsoSel} onChange={(e) => setTorsoSel(e.target.value)} required>
              <option value="">Seleccionar torso...</option>
              {piezas.filter(p => p.tipo === 'Torso' && p.disponible !== false).map(p => (
                <option key={p.id} value={p.id}>ID: {p.id} (Talle: {p.tamano} — {p.color})</option>
              ))}
            </select>
          </div>

          <div className="grupo-input">
            <label>Brazo Derecho</label>
            <select value={brazoDerSel} onChange={(e) => setBrazoDerSel(e.target.value)} required>
              <option value="">Seleccionar brazo der...</option>
              {piezas.filter(p => p.tipo === 'Brazo Derecho' && p.disponible !== false).map(p => (
                <option key={p.id} value={p.id}>ID: {p.id} ({p.color})</option>
              ))}
            </select>
          </div>

          <div className="grupo-input">
            <label>Brazo Izquierdo</label>
            <select value={brazoIzqSel} onChange={(e) => setBrazoIzqSel(e.target.value)} required>
              <option value="">Seleccionar brazo izq...</option>
              {piezas.filter(p => p.tipo === 'Brazo Izquierdo' && p.disponible !== false).map(p => (
                <option key={p.id} value={p.id}>ID: {p.id} ({p.color})</option>
              ))}
            </select>
          </div>

          <div className="grupo-input">
            <label>Pierna Derecha</label>
            <select value={piernaDerSel} onChange={(e) => setPiernaDerSel(e.target.value)} required>
              <option value="">Seleccionar pierna der...</option>
              {piezas.filter(p => p.tipo === 'Pierna Derecha' && p.disponible !== false).map(p => (
                <option key={p.id} value={p.id}>ID: {p.id} (Talle: {p.tamano})</option>
              ))}
            </select>
          </div>

          <div className="grupo-input">
            <label>Pierna Izquierda</label>
            <select value={piernaIzqSel} onChange={(e) => setPiernaIzqSel(e.target.value)} required>
              <option value="">Seleccionar pierna izq...</option>
              {piezas.filter(p => p.tipo === 'Pierna Izquierda' && p.disponible !== false).map(p => (
                <option key={p.id} value={p.id}>ID: {p.id} (Talle: {p.tamano})</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-registrar" style={{ gridColumn: 'span 3', marginTop: '10px' }}>
            🟢 Registrar y Armar Maniquí
          </button>
        </form>
      </div>

      <h3 style={{ margin: '24px 0 12px 0', color: '#1e293b' }}>🕴️ Catálogo de Maniquíes Ensamblados</h3>
      <div className="contenedor-grilla">
        {maniquies.length === 0 ? (
          <p style={{ color: '#64748b' }}>No hay maniquíes estructurados en exhibición actualmente.</p>
        ) : (
          maniquies.map(m => (
            <div key={m.id} className="tarjeta-pieza">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge-gama">{m.gama}</span>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>ID: {m.id}</span>
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>${m.precio.toLocaleString()}</h4>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Tamaño: <strong>{m.tamano || 'Adulto'}</strong></p>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#94a3b8' }}>F. Fab: {m.fecha_fabricacion}</p>
              
              {m.piezas_asociadas && m.piezas_asociadas.length > 0 && (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#64748b', fontWeight: 'bold' }}>Piezas vinculadas (IDs):</span>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {m.piezas_asociadas.map(pId => (
                      <span key={pId} style={{ backgroundColor: '#cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#334155', fontWeight: '500' }}>
                        #{pId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => desarmarManiqui(m.id)} 
                className="btn-borrar" 
                style={{ marginTop: '14px', width: '100%' }}
              >
                🔴 Desarmar Maniquí
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ComponenteManiquies;