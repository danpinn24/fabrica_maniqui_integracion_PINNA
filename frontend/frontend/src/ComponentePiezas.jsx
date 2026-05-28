import { useState } from 'react';

function ComponentePiezas({ piezas, setPiezas }) {
  // --- ESTADOS LOCALES DEL CONFIGURADOR DE COMPONENTES ---
  const [tipoPieza, setTipoPieza] = useState('Cabeza');
  const [color, setColor] = useState('Blanco');
  const [tamano, setTamano] = useState('M');
  const [material, setMaterial] = useState('Plástico');
  const [sexo, setSexo] = useState('Mujer');
  const [ojos, setOjos] = useState('Marrón');

  // --- ACCIÓN: FABRICAR PIEZA ---
  const guardarPieza = (e) => {
    e.preventDefault();
    const nueva = { tipo: tipoPieza, color, tamano, material, sexo, ojos };

    fetch('http://localhost:3001/api/piezas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva)
    })
      .then(res => res.json())
      .then(data => {
        setPiezas([...piezas, data]);
        alert("¡Componente fabricado y guardado en depósito!");
      });
  };

  // --- ACCIÓN: DAR DE BAJA COMPONENTE POR FALLA ---
  const borrarPieza = (id) => {
    if (window.confirm("¿Seguro de dar de baja esta pieza por falla o descarte?")) {
      fetch(`http://localhost:3001/api/piezas/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          setPiezas(piezas.filter(p => p.id !== id));
        });
    }
  };

  return (
    <div className="dinamico-contenedor">
      {/* Fabricación de piezas */}
      <div className="tarjeta-blanca">
        <h3>🏭 Fabricación de Componentes Individuales</h3>
        <form onSubmit={guardarPieza} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tipo de Componente:</label>
              <select value={tipoPieza} onChange={(e) => setTipoPieza(e.target.value)} className="select-simple">
                <option value="Cabeza">Cabeza</option>
                <option value="Torso">Torso</option>
                <option value="Brazo Derecho">Brazo Derecho</option>
                <option value="Brazo Izquierdo">Brazo Izquierdo</option>
                <option value="Pierna Derecha">Pierna Derecha</option>
                <option value="Pierna Izquierda">Pierna Izquierda</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Color / Acabado:</label>
              <select value={color} onChange={(e) => setColor(e.target.value)} className="select-simple">
                <option value="Blanco">Blanco Mate</option>
                <option value="Negro">Negro Brillante</option>
                <option value="Piel">Tono Piel</option>
                <option value="Cromado">Cromado Platino</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tamaño Estándar:</label>
              <select value={tamano} onChange={(e) => setTamano(e.target.value)} className="select-simple">
                <option value="S">S (Chico)</option>
                <option value="M">M (Mediano)</option>
                <option value="L">L (Grande)</option>
                <option value="XL">XL (Exhibición Especial)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Material Base:</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className="select-simple">
                <option value="Plástico">Plástico Inyectado</option>
                <option value="Fibra de Vidrio">Fibra de Vidrio</option>
                <option value="Resina">Resina de Alta Densidad</option>
              </select>
            </div>

          </div>

          {/* CAMPOS EXTRA SOLO SI ES CABEZA */}
          {tipoPieza === 'Cabeza' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Estilo de Facciones:</label>
                <select value={sexo} onChange={(e) => setSexo(e.target.value)} className="select-simple">
                  <option value="Mujer">Mujer</option>
                  <option value="Varón">Varón</option>
                  <option value="Abstracto">Abstracto / Sin Facciones</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Color de Ojos Ilustrados:</label>
                <select value={ojos} onChange={(e) => setOjos(e.target.value)} className="select-simple">
                  <option value="Marrón">Marrón</option>
                  <option value="Azul">Azul</option>
                  <option value="Verde">Verde</option>
                  <option value="Negro">Tallado Cerrado</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn-guardar" style={{ alignSelf: 'flex-end' }}>
            ⚙️ Inyectar / Fabricar Pieza
          </button>
        </form>
      </div>

      {/* Listado de Almacén */}
      <h3 style={{ marginTop: '24px', color: '#1e293b' }}>Componentes Libres en Depósito ({piezas.length})</h3>
      <div className="grilla-cards">
        {piezas.map(p => (
          <div key={p.id} className="card-stock">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge-tipo">{p.tipo}</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>ID: {p.id}</span>
            </div>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Material: <strong>{p.material}</strong></p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Detalles: <strong>{p.tamano} — {p.color}</strong></p>
            
            {p.tipo === 'Cabeza' && p.sexo && (
              <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#f0fdf4', borderRadius: '4px', fontSize: '13px', color: '#16a34a', fontStyle: 'italic' }}>
                👤 {p.sexo} | 👀 Ojos {p.ojos || 'Marrón'}
              </div>
            )}

            <div style={{ marginTop: '10px', fontSize: '12px' }}>
              {p.disponible !== false ? (
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>🟢 Disponible en Depósito</span>
              ) : (
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🔴 En Uso (Maniquí)</span>
              )}
            </div>
            
            <button onClick={() => borrarPieza(p.id)} className="btn-eliminar" style={{ marginTop: '12px' }}>
              🗑️ Descartar Pieza
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComponentePiezas;