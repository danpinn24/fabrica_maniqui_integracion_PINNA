import { useState } from 'react';
import Modal from './components/Modal';

function ComponentePiezas({ piezas = [], setPiezas }) {
  // --- ESTADOS LOCALES DEL CONFIGURADOR DE COMPONENTES ---
  const [tipoPieza, setTipoPieza] = useState('Cabeza');
  const [color, setColor] = useState('Blanco');
  const [tamano, setTamano] = useState('M');
  const [material, setMaterial] = useState('Plástico');
  const [sexo, setSexo] = useState('Mujer');
  const [ojos, setOjos] = useState('Marrón');

  // --- ESTADO DEL MODAL PERSONALIZADO ---
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    confirm: false,
    onAccept: null
  });

  const cerrarModal = () => setModal(prev => ({ ...prev, open: false }));

  // Función para lanzar alertas simples (solo botón Aceptar)
  const lanzarAlerta = (title, message) => {
    setModal({
      open: true,
      title,
      message,
      confirm: false,
      onAccept: null
    });
  };

  // --- ACCIÓN: FABRICAR PIEZA ---
  const guardarPieza = (e) => {
    e.preventDefault();
    const nueva = { tipo: tipoPieza, color, tamano, material, sexo, ojos };

    fetch('http://localhost:3001/api/piezas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al fabricar la pieza");
        return res.json();
      })
      .then(nuevaPieza => {
        setPiezas([nuevaPieza, ...piezas]);
        lanzarAlerta("¡Éxito!", `Pieza ${nuevaPieza.tipo} (ID: ${nuevaPieza.id}) fabricada e ingresada al depósito.`);
        
        // Resetear formulario a valores por defecto
        setTipoPieza('Cabeza');
        setColor('Blanco');
        setTamano('M');
        setMaterial('Plástico');
        setSexo('Mujer');
        setOjos('Marrón');
      })
      .catch(err => {
        console.error(err);
        lanzarAlerta("Error", "No se pudo registrar la nueva pieza en el servidor.");
      });
  };

  // --- ACCIÓN: SOLICITAR ELIMINACIÓN (Abre el Modal de confirmación) ---
  const solicitarBorrarPieza = (id) => {
    setModal({
      open: true,
      title: "¿Eliminar Componente?",
      message: `¿Estás seguro de que deseas descartar del depósito de forma permanente la pieza física con ID: ${id}?`,
      confirm: true, // Esto activa el botón "Cancelar" en tu Modal
      onAccept: () => procederABorrarPieza(id) // Si acepta, se ejecuta la eliminación
    });
  };

  // --- ACCIÓN: PROCESAR EL BORRADO REAL EN EL BACKEND ---
  const procederABorrarPieza = (id) => {
    fetch(`http://localhost:3001/api/piezas/${id}`, {
      method: 'DELETE'
    })
      .then(async res => {
        const data = await res.json();
        // Si el backend frena el borrado porque está en uso (Error 400)
        if (!res.ok) {
          throw new Error(data.error || "No se pudo eliminar la pieza.");
        }
        return data;
      })
      .then(() => {
        // Si la base de datos la eliminó con éxito, la quitamos del estado local
        setPiezas(piezas.filter(p => p.id !== id));
        lanzarAlerta("¡Eliminado!", "La pieza fue dada de baja correctamente del depósito.");
      })
      .catch(err => {
        console.error(err);
        // Mostramos el mensaje exacto de bloqueo que configuramos en el backend
        lanzarAlerta("Acción Bloqueada", err.message);
      });
  };

  return (
    <div className="seccion-contenedor">
      <div className="tarjeta-formulario">
        <h3 className="formulario-titulo">🏭 Registro de Nuevas Piezas Físicas</h3>
        
        <form onSubmit={guardarPieza} className="grid-formulario">
          <div className="grupo-input">
            <label>Tipo de Componente</label>
            <select value={tipoPieza} onChange={(e) => setTipoPieza(e.target.value)}>
              <option value="Cabeza">Cabeza</option>
              <option value="Torso">Torso</option>
              <option value="Brazo Derecho">Brazo Derecho</option>
              <option value="Brazo Izquierdo">Brazo Izquierdo</option>
              <option value="Pierna Derecha">Pierna Derecha</option>
              <option value="Pierna Izquierda">Pierna Izquierda</option>
            </select>
          </div>

          <div className="grupo-input">
            <label>Color / Pigmento</label>
            <input 
              type="text" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              placeholder="Ej: Marfil, Negro, Piel" 
              required 
            />
          </div>

          <div className="grupo-input">
            <label>Talle / Escala estructural</label>
            <select value={tamano} onChange={(e) => setTamano(e.target.value)}>
              <option value="S">S (Niño / Pequeño)</option>
              <option value="M">M (Estándar / Adulto)</option>
              <option value="L">L (Especial / Exhibición)</option>
            </select>
          </div>

          <div className="grupo-input">
            <label>Material base</label>
            <input 
              type="text" 
              value={material} 
              onChange={(e) => setMaterial(e.target.value)} 
              placeholder="Ej: Plástico Reforzado, Silicona" 
            />
          </div>

          {/* CAMPOS CONDICIONALES EXCLUSIVOS PARA CABEZAS */}
          {tipoPieza === 'Cabeza' && (
            <>
              <div className="grupo-input">
                <label>Rasgos / Escultura</label>
                <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Unisex / Neutro">Unisex / Neutro</option>
                </select>
              </div>

              <div className="grupo-input">
                <label>Color de Iris (Ojos)</label>
                <input 
                  type="text" 
                  value={ojos} 
                  onChange={(e) => setOjos(e.target.value)} 
                  placeholder="Ej: Azules, Verdes, Resina" 
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-registrar" style={{ gridColumn: 'span 3', marginTop: '10px' }}>
            ⚙️ Fabricar e Ingresar a Depósito
          </button>
        </form>
      </div>

      <h3 style={{ margin: '24px 0 12px 0', color: '#1e293b' }}>📦 Inventario Físico en Depósito</h3>
      <div className="contenedor-grilla">
        {!Array.isArray(piezas) || piezas.length === 0 ? (
          <p style={{ color: '#64748b' }}>No se registran piezas en el depósito actualmente.</p>
        ) : (
          piezas.map(p => (
            <div key={p.id} className="tarjeta-pieza">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge-tipo">{p.tipo}</span>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>ID: {p.id}</span>
              </div>
              <p style={{ margin: '10px 0 4px 0', fontSize: '14px', color: '#475569' }}>Material: <strong>{p.material || 'Plástico'}</strong></p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#475569' }}>Detalles: <strong>{p.tamano} — {p.color}</strong></p>
              
              {p.tipo === 'Cabeza' && p.sexo && (
                <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#f0fdf4', borderRadius: '4px', fontSize: '13px', color: '#16a34a', fontStyle: 'italic' }}>
                  👤 {p.sexo} | 👀 Ojos {p.ojos || 'Común'}
                </div>
              )}

              <div style={{ marginTop: '10px', fontSize: '12px' }}>
                {p.disponible !== false ? (
                  <span style={{ color: '#16a34a', fontWeight: 'bold' }}>🟢 Disponible en Depósito</span>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🔴 En Uso (Maniquí)</span>
                )}
              </div>
              
              {/* Al hacer clic, ahora llama a solicitarBorrarPieza que maneja el Modal */}
              <button onClick={() => solicitarBorrarPieza(p.id)} className="btn-eliminar" style={{ marginTop: '12px' }}>
                🗑️ Descartar Pieza
              </button>
            </div>
          ))
        )}
      </div>

      {/* COMPONENTE MODAL INTERNO CONTROLADO POR EL ESTADO LOCAL */}
      <Modal 
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirm={modal.confirm}
        onClose={cerrarModal}
        onAccept={modal.onAccept}
      />
    </div>
  );
}

export default ComponentePiezas;