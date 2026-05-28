import { useState, useEffect } from 'react';
import './App.css'; 
import ComponenteManiquies from './ComponenteManiquies.jsx';
import ComponentePiezas from './ComponentePiezas.jsx';

function App() {
  // --- ESTADOS GLOBALES DE DATOS (Se comparten con los hijos) ---
  const [maniquies, setManiquies] = useState([]);
  const [piezas, setPiezas] = useState([]);
  
  // --- NAVEGACIÓN LATERAL ---
  const [seccionActiva, setSeccionActiva] = useState('maniquies');

  // --- CARGA INICIAL DESDE EL BACKEND ---
  useEffect(() => {
    fetch('http://localhost:3001/api/maniquies').then(res => res.json()).then(setManiquies);
    fetch('http://localhost:3001/api/piezas').then(res => res.json()).then(setPiezas);
  }, []);

  return (
    <div className="panel-contenedor">
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="sidebar">
        <h2 className="sidebar-titulo">🏬 CONTROL FÁBRICA</h2>
        <nav className="sidebar-menu">
          <button 
            className={`btn-menu ${seccionActiva === 'maniquies' ? 'activo' : ''}`}
            onClick={() => setSeccionActiva('maniquies')}
          >
            🕴️ Stock Maniquíes
          </button>
          <button 
            className={`btn-menu ${seccionActiva === 'piezas' ? 'activo' : ''}`}
            onClick={() => setSeccionActiva('piezas')}
          >
            ⚙️ Depósito Piezas
          </button>
        </nav>
        <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', marginTop: 'auto' }}>
          Sistema de Control Interno v2.0
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL RENDEREADO POR COMPONENTES */}
      <main className="contenido-principal">
        
        {seccionActiva === 'maniquies' ? (
          <ComponenteManiquies 
            maniquies={maniquies} 
            piezas={piezas} 
            setManiquies={setManiquies} 
            setPiezas={setPiezas} 
          />
        ) : (
          <ComponentePiezas 
            piezas={piezas} 
            setPiezas={setPiezas} 
          />
        )}

      </main>
    </div>
  );
}

export default App;