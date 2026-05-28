import { useState } from 'react';

function ComponenteManiquies({ maniquies, piezas, setManiquies, setPiezas }) {
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

    // Guardamos obligatoriamente todos los IDs convirtiéndolos a enteros
    const piezasIds = [cabezaSel, torsoSel, brazoDerSel, brazoIzqSel, piernaDerSel, piernaIzqSel]
      .map(id => parseInt(id));

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
        if (!res.ok) throw new Error("Error al armar el maniquí");
        return res.json();
      })
      .then(data => {
        // Actualizamos los estados globales que vienen por props
        setManiquies([...maniquies, data.maniqui]);
        setPiezas(data.piezasActualizadas);
        
        // Limpiamos selectores locales
        setGama('');
        setPrecio('');
        setTamanoManiqui('Adulto');
        setCabezaSel('');
        setTorsoSel('');
        setBrazoDerSel('');
        setBrazoIzqSel('');
        setPiernaDerSel('');
        setPiernaIzqSel('');
        alert("¡Maniquí armado correctamente! Todos los componentes pasaron a estar ocupados.");
      })
      .catch(err => alert(err.message));
  };

  // --- ACCIÓN: DESARMAR MANIQUÍ ---
  const desarmarManiqui = (id) => {
    if (window.confirm("¿Estás seguro de que querés desarmar este maniquí? Sus componentes regresarán automáticamente al depósito.")) {
      fetch(`http://localhost:3001/api/maniquies/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error("Error al desarmar");
          return res.json();
        })
        .then(data => {
          setManiquies(data.maniquiesActualizados);
          setPiezas(data.piezasActualizadas);
          alert(data.mensaje);
        })
        .catch(err => alert(err.message));
    }
  };

  return (
    <div className="dinamico-contenedor">
      {/* Formulario Obligatorio de Armado */}
      <div className="tarjeta-blanca">
        <h3>🛠️ Armar y Registrar Nuevo Maniquí</h3>
        <form onSubmit={armarNuevoManiqui} className="formulario-armado">
          
          <div className="grilla-formulario">
            <input 
              type="text" 
              placeholder="Gama (Ej: Premium, Alta)" 
              value={gama} 
              onChange={(e) => setGama(e.target.value)} 
              required 
              className="input-simple" 
            />
            <input 
              type="number" 
              placeholder="Precio ($)" 
              value={precio} 
              onChange={(e) => setPrecio(e.target.value)} 
              required 
              className="input-simple" 
            />
            
            <select value={tamanoManiqui} onChange={(e) => setTamanoManiqui(e.target.value)} required className="select-simple">
              <option value="" disabled>-- Seleccione Tamaño --</option>
              <option value="Adulto">Adulto</option>
              <option value="Niño">Niño / Infantil</option>
              <option value="Exhibición XL">Exhibición XL</option>
            </select>
          </div>

          <h4 className="subtitulo-seccion">Asignar Componentes en Stock (Todos requeridos):</h4>
          <div className="grilla-piezas-select">
            
            {/* Cabeza */}
            <div>
              <label className="label-formulario">Cabeza:</label>
              <select value={cabezaSel} onChange={(e) => setCabezaSel(e.target.value)} required className="select-simple">
                <option value="" disabled hidden>Seleccione Cabeza...</option>
                {piezas.filter(p => p.tipo === 'Cabeza' && p.disponible !== false).map(p => (
                  <option key={p.id} value={p.id}>
                    ID: {p.id} ({p.material} — {p.color} — {p.sexo || 'Abstracto'} — Ojos: {p.ojos || 'Marrón'})
                  </option>
                ))}
              </select>
            </div>

            {/* Torso */}
            <div>
              <label className="label-formulario">Torso:</label>
              <select value={torsoSel} onChange={(e) => setTorsoSel(e.target.value)} required className="select-simple">
                <option value="" disabled hidden>Seleccione Torso...</option>
                {piezas.filter(p => p.tipo === 'Torso' && p.disponible !== false).map(p => (
                  <option key={p.id} value={p.id}>
                    ID: {p.id} ({p.material} — Talle: {p.tamano} — {p.color})
                  </option>
                ))}
              </select>
            </div>

            {/* Brazo Derecho */}
            <div>
              <label className="label-formulario">Brazo Derecho:</label>
              <select value={brazoDerSel} onChange={(e) => setBrazoDerSel(e.target.value)} required className="select-simple">
                <option value="" disabled hidden>Seleccione Brazo Der...</option>
                {piezas.filter(p => p.tipo === 'Brazo Derecho' && p.disponible !== false).map(p => (
                  <option key={p.id} value={p.id}>
                    ID: {p.id} ({p.material} — Talle: {p.tamano} — {p.color})
                  </option>
                ))}
              </select>
            </div>

            {/* Brazo Izquierdo */}
            <div>
              <label className="label-formulario">Brazo Izquierdo:</label>
              <select value={brazoIzqSel} onChange={(e) => setBrazoIzqSel(e.target.value)} required className="select-simple">
                <option value="" disabled hidden>Seleccione Brazo Izq...</option>
                {piezas.filter(p => p.tipo === 'Brazo Izquierdo' && p.disponible !== false).map(p => (
                  <option key={p.id} value={p.id}>
                    ID: {p.id} ({p.material} — Talle: {p.tamano} — {p.color})
                  </option>
                ))}
              </select>
            </div>

            {/* Pierna Derecha */}
            <div>
              <label className="label-formulario">Pierna Derecha:</label>
              <select value={piernaDerSel} onChange={(e) => setPiernaDerSel(e.target.value)} required className="select-simple">
                <option value="" disabled hidden>Seleccione Pierna Der...</option>
                {piezas.filter(p => p.tipo === 'Pierna Derecha' && p.disponible !== false).map(p => (
                  <option key={p.id} value={p.id}>
                    ID: {p.id} ({p.material} — Talle: {p.tamano} — {p.color})
                  </option>
                ))}
              </select>
            </div>

            {/* Pierna Izquierda */}
            <div>
              <label className="label-formulario">Pierna Izquierda:</label>
              <select value={piernaIzqSel} onChange={(e) => setPiernaIzqSel(e.target.value)} required className="select-simple">
                <option value="" disabled hidden>Seleccione Pierna Izq...</option>
                {piezas.filter(p => p.tipo === 'Pierna Izquierda' && p.disponible !== false).map(p => (
                  <option key={p.id} value={p.id}>
                    ID: {p.id} ({p.material} — Talle: {p.tamano} — {p.color})
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button type="submit" className="btn-guardar btn-registrar-contenedor">
            📦 Registrar y Armar Maniquí
          </button>
        </form>
      </div>

      {/* Showroom / Lista de Maniquíes */}
      <h3 style={{ marginTop: '24px', color: '#1e293b' }}>Maniquíes en Showroom ({maniquies.length})</h3>
      <div className="grilla-cards">
        {maniquies.map(m => (
          <div key={m.id} className="card-stock">
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
                    <span key={pId} style={{ backgroundColor: '#cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>#{pId}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => desarmarManiqui(m.id)} className="btn-eliminar" style={{ marginTop: 'auto' }}>
              🗑️ Desarmar / Sacar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComponenteManiquies;