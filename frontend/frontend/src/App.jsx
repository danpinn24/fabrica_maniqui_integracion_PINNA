import { useState, useEffect } from 'react';

function App() {
  const [maniquies, setManiquies] = useState([]);
  const [piezas, setPiezas] = useState([]);
  
  // ESTADO DEL CONFIGURADOR (Lo que el usuario va eligiendo)
  const [config, setConfig] = useState({
    sexo: 'Mujer',
    piel: 'Clara',
    ojos: 'Marrón',
    pelo: 'Calvo'
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/maniquies').then(res => res.json()).then(setManiquies);
    fetch('http://localhost:3001/api/piezas').then(res => res.json()).then(setPiezas);
  }, []);

  // Función para fabricar la pieza con la configuración elegida
  const fabricarPieza = () => {
    const nuevaPieza = { ...config, tipo: 'Cabeza' };

    fetch('http://localhost:3001/api/piezas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaPieza)
    })
    .then(res => res.json())
    .then(dato => setPiezas([...piezas, dato]));
  };

  // Función para borrar maniquí (la mantenemos igual)
  const borrarManiqui = (id) => {
    fetch(`http://localhost:3001/api/maniquies/${id}`, { method: 'DELETE' })
      .then(() => setManiquies(maniquies.filter(m => m.id !== id)));
  };

  // Estilo para los botones seleccionados
  const estiloBoton = (categoria, valor) => ({
    padding: '8px 12px',
    margin: '5px',
    cursor: 'pointer',
    backgroundColor: config[categoria] === valor ? '#4CAF50' : '#e0e0e0',
    color: config[categoria] === valor ? 'white' : 'black',
    border: 'none',
    borderRadius: '4px'
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
      <h1>Fábrica de Maniquíes - Panel de Control</h1>
      
      {/* SECCIÓN CONFIGURADOR DE CABEZAS */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2>🛠 Configurador de Cabeza</h2>
        
        <div>
          <p><strong>Sexo:</strong></p>
          <button onClick={() => setConfig({...config, sexo: 'Hombre'})} style={estiloBoton('sexo', 'Hombre')}>Hombre</button>
          <button onClick={() => setConfig({...config, sexo: 'Mujer'})} style={estiloBoton('sexo', 'Mujer')}>Mujer</button>
        </div>

        <div>
          <p><strong>Tono de Piel:</strong></p>
          <button onClick={() => setConfig({...config, piel: 'Clara'})} style={estiloBoton('piel', 'Clara')}>Clara</button>
          <button onClick={() => setConfig({...config, piel: 'Media'})} style={estiloBoton('piel', 'Media')}>Media</button>
          <button onClick={() => setConfig({...config, piel: 'Oscura'})} style={estiloBoton('piel', 'Oscura')}>Oscura</button>
        </div>

        <div>
          <p><strong>Color de Ojos:</strong></p>
          <button onClick={() => setConfig({...config, ojos: 'Marrón'})} style={estiloBoton('ojos', 'Marrón')}>Marrón</button>
          <button onClick={() => setConfig({...config, ojos: 'Azul'})} style={estiloBoton('ojos', 'Azul')}>Azul</button>
          <button onClick={() => setConfig({...config, ojos: 'Verde'})} style={estiloBoton('ojos', 'Verde')}>Verde</button>
        </div>

        <button 
          onClick={fabricarPieza} 
          style={{ marginTop: '20px', padding: '15px', width: '100%', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🚀 FABRICAR CABEZA PERSONALIZADA
        </button>
      </div>

      {/* LISTADO DE PIEZAS FABRICADAS */}
      <h3>Piezas en Stock</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {piezas.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', backgroundColor: '#fff' }}>
            <strong>{p.tipo} #{p.id}</strong><br/>
            {p.sexo} | Piel: {p.piel} | Ojos: {p.ojos}
          </div>
        ))}
      </div>

      <hr style={{ margin: '40px 0' }} />

      {/* SECCIÓN MANIQUÍES (Sigue estando para no perder lo anterior) */}
      <h2>Stock de Maniquíes</h2>
      <ul>
        {maniquies.map(m => (
          <li key={m.id}>
            Gama: {m.gama} - ${m.precio} 
            <button onClick={() => borrarManiqui(m.id)} style={{ marginLeft: '10px', color: 'red' }}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;