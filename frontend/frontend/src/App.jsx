import { useState, useEffect } from 'react';
import './App.css'; 

function App() {
  // --- ESTADOS DE DATOS ---
  const [maniquies, setManiquies] = useState([]);
  const [piezas, setPiezas] = useState([]);
  
  // --- NAVEGACIÓN LATERAL ---
  const [seccionActiva, setSeccionActiva] = useState('maniquies');

  // --- FORMULARIO MANIQUÍES ---
  const [gama, setGama] = useState('');
  const [precio, setPrecio] = useState('');
  
  // --- CONFIGURADOR DE COMPONENTES ---
  const [tipoPieza, setTipoPieza] = useState('Cabeza');
  const [color, setColor] = useState('Blanco');
  const [tamano, setTamano] = useState('M');
  const [material, setMaterial] = useState('Plástico');
  const [sexo, setSexo] = useState('Mujer');
  const [ojos, setOjos] = useState('Marrón');

  // --- CARGA INICIAL (BACKEND) ---
  useEffect(() => {
    fetch('http://localhost:3001/api/maniquies').then(res => res.json()).then(setManiquies);
    fetch('http://localhost:3001/api/piezas').then(res => res.json()).then(setPiezas);
  }, []);

  // --- ACCIONES MANIQUÍES ---
  const guardarManiqui = (e) => {
    e.preventDefault();
    const nuevo = { gama, precio: parseFloat(precio), tamano: 'Adulto' };

    fetch('http://localhost:3001/api/maniquies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    })
      .then(res => res.json())
      .then(creado => {
        setManiquies([...maniquies, creado]);
        setGama('');
        setPrecio('');
      });
  };

  const borrarManiqui = (id) => {
    // Alerta de confirmación antes de eliminar
    const seguro = window.confirm("¿Estás seguro de que querés eliminar este maniquí?");
    if (!seguro) return; // Si dice que no, cancela la ejecución

    fetch(`http://localhost:3001/api/maniquies/${id}`, { method: 'DELETE' })
      .then(() => setManiquies(maniquies.filter(m => m.id !== id)));
  };

  // --- ACCIONES PIEZAS ---
  const guardarPieza = (e) => {
    e.preventDefault();
    const nuevaPieza = { tipo: tipoPieza, color, tamano, material };

    if (tipoPieza === 'Cabeza') {
      nuevaPieza.sexo = sexo;
      nuevaPieza.ojos = ojos;
      nuevaPieza.piel = color; 
    }

    fetch('http://localhost:3001/api/piezas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaPieza)
    })
      .then(res => res.json())
      .then(creado => {
        setPiezas([...piezas, creado]);
      });
  };

  const borrarPieza = (id) => {
    // Alerta de confirmación antes de eliminar una pieza
    const seguro = window.confirm("¿Estás seguro de que querés eliminar esta pieza del stock?");
    if (!seguro) return;

    fetch(`http://localhost:3001/api/piezas/${id}`, { method: 'DELETE' })
      .then(() => setPiezas(piezas.filter(p => p.id !== id)));
  };

  // --- ESTILO DINÁMICO BOTONES SUB-CONFIGURADOR ---
  const estiloBtnConfig = (categoria, valor) => ({
    padding: '8px 12px',
    margin: '4px',
    cursor: 'pointer',
    backgroundColor: (categoria === 'sexo' && sexo === valor) || (categoria === 'ojos' && ojos === valor) ? '#4CAF50' : '#e0e0e0',
    color: (categoria === 'sexo' && sexo === valor) || (categoria === 'ojos' && ojos === valor) ? 'white' : 'black',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold'
  });

  return (
    <div className="panel-contenedor">
      
      {/* 1. BARRA LATERAL */}
      <div className="sidebar">
        <div className="sidebar-titulo">🏭 Panel Maniquíes</div>
        
        <button 
          onClick={() => setSeccionActiva('maniquies')}
          className={`sidebar-btn ${seccionActiva === 'maniquies' ? 'activo' : ''}`}
        >
          👤 Stock Maniquíes
        </button>

        <button 
          onClick={() => setSeccionActiva('piezas')}
          className={`sidebar-btn ${seccionActiva === 'piezas' ? 'activo' : ''}`}
        >
          ⚙️ Línea de Componentes
        </button>
      </div>

      {/* 2. CONTENIDO DINÁMICO */}
      <div className="contenido-principal">
        
        {/* SECCIÓN MANIQUÍES */}
        {seccionActiva === 'maniquies' && (
          <div>
            <h1>Gestión de Maniquíes</h1>
            <hr className="separador" />

            <div className="tarjeta-blanca">
              <h3>Registrar Nuevo Maniquí</h3>
              <form onSubmit={guardarManiqui} className="formulario-flex">
                <input type="text" placeholder="Gama (Ej: Premium)" value={gama} onChange={(e) => setGama(e.target.value)} required className="input-simple" />
                <input type="number" placeholder="Precio ($)" value={precio} onChange={(e) => setPrecio(e.target.value)} required className="input-simple" />
                <button type="submit" className="btn-guardar">Guardar</button>
              </form>
            </div>

            <h3>Stock en Depósito ({maniquies.length})</h3>
            <div className="grilla-cards">
              {maniquies.map(m => (
                <div key={m.id} className="card-stock">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>Maniquí #{m.id}</strong>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{m.tamano}</span>
                  </div>
                  <p style={{ margin: '4px 0', color: '#475569' }}>Gama: <strong>{m.gama}</strong></p>
                  <p style={{ margin: '4px 0', color: '#475569' }}>Precio: <strong style={{ color: '#10b981' }}>${m.precio}</strong></p>
                  <button onClick={() => borrarManiqui(m.id)} className="btn-eliminar" style={{ marginTop: '15px' }}>Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN PIEZAS */}
        {seccionActiva === 'piezas' && (
          <div>
            <h1>Línea de Producción de Piezas</h1>
            <hr className="separador" />

            <div className="tarjeta-blanca">
              <h3>🛠 Configurador Técnico de Componentes</h3>
              <form onSubmit={guardarPieza} style={{ marginTop: '15px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Tipo:</label>
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
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Color / Piel:</label>
                    <select value={color} onChange={(e) => setColor(e.target.value)} className="select-simple">
                      <option value="Blanco">Blanco</option>
                      <option value="Piel">Tono Piel</option>
                      <option value="Negro">Negro</option>
                      <option value="Gris">Gris</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Tamaño:</label>
                    <select value={tamano} onChange={(e) => setTamano(e.target.value)} className="select-simple">
                      <option value="S">S (Chico)</option>
                      <option value="M">M (Mediano)</option>
                      <option value="L">L (Grande)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Material:</label>
                    <select value={material} onChange={(e) => setMaterial(e.target.value)} className="select-simple">
                      <option value="Plástico">Plástico</option>
                      <option value="Fibra de Vidrio">Fibra de Vidrio</option>
                      <option value="Costura/Tela">Costura / Tela</option>
                    </select>
                  </div>
                </div>

                {/* Sub-formulario para Cabeza */}
                {tipoPieza === 'Cabeza' && (
                  <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1', marginBottom: '15px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ marginRight: '10px', fontSize: '14px', fontWeight: 'bold' }}>Sexo del Rostro:</span>
                      <button type="button" onClick={() => setSexo('Hombre')} style={estiloBtnConfig('sexo', 'Hombre')}>Hombre</button>
                      <button type="button" onClick={() => setSexo('Mujer')} style={estiloBtnConfig('sexo', 'Mujer')}>Mujer</button>
                    </div>
                    <div>
                      <span style={{ marginRight: '10px', fontSize: '14px', fontWeight: 'bold' }}>Color de Ojos:</span>
                      <button type="button" onClick={() => setOjos('Marrón')} style={estiloBtnConfig('ojos', 'Marrón')}>Marrón</button>
                      <button type="button" onClick={() => setOjos('Azul')} style={estiloBtnConfig('ojos', 'Azul')}>Azul</button>
                      <button type="button" onClick={() => setOjos('Verde')} style={estiloBtnConfig('ojos', 'Verde')}>Verde</button>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-fabricar">🚀 FABRICAR COMPONENTE</button>
              </form>
            </div>

            {/* MUESTRA DE LAS PIEZAS REALES */}
            <h3>Componentes en Stock ({piezas.length})</h3>
            <div className="grilla-cards">
              {piezas.map(p => (
                <div key={p.id} className="card-stock">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="badge-tipo">{p.tipo}</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>ID: {p.id}</span>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Material: <strong>{p.material}</strong></p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Detalles: <strong>{p.tamano} — {p.color}</strong></p>
                  
                  {/* Detalles extra si es cabeza */}
                  {p.tipo === 'Cabeza' && p.sexo && (
                    <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#f0fdf4', borderRadius: '4px', fontSize: '13px', color: '#16a34a', fontStyle: 'italic' }}>
                      👤 {p.sexo} | 👀 Ojos {p.ojos || 'Marrón'}
                    </div>
                  )}
                  
                  {/* BOTÓN DE DELETE CON CONFIRMACIÓN */}
                  <button onClick={() => borrarPieza(p.id)} className="btn-eliminar" style={{ marginTop: '15px' }}>Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;