import React, { useState } from 'react';
import { settings, clinicas } from '../data/database';

interface ConfiguracionProps {
  onBack: () => void;
}

const Configuracion: React.FC<ConfiguracionProps> = ({ onBack }) => {
  const [taxNatural, setTaxNatural] = useState(0);
  const [taxJuridica, setTaxJuridica] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={onBack} style={{ 
        backgroundColor: '#64748b',
        color: 'white',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        marginBottom: '2rem'
      }}>
        ← Volver al Dashboard
      </button>
      
      <h1>⚙️ Configuración</h1>
      <p>Módulo de configuración - En construcción</p>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem',
        marginTop: '2rem'
      }}>
        <h3>Configuración de Impuestos</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label>Impuesto Persona Natural: </label>
          <input 
            type="number" 
            value={taxNatural} 
            onChange={(e) => setTaxNatural(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Impuesto Persona Jurídica: </label>
          <input 
            type="number" 
            value={taxJuridica} 
            onChange={(e) => setTaxJuridica(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default Configuracion;