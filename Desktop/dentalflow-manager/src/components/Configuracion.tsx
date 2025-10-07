// src/components/Configuracion.tsx

import React, { useState } from 'react';
import { settings, clinicas } from '../data/database';

interface ConfiguracionProps {
  onBack: () => void;
}

const Configuracion: React.FC<ConfiguracionProps> = ({ onBack }) => {
  const [taxNatural, setTaxNatural] = useState(settings.impuestoPersonaNatural);
  const [taxJuridica, setTaxJuridica] = useState(settings.impuestoPersonaJuridica);
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleSaveTaxes = () => {
    settings.impuestoPersonaNatural = taxNatural;
    settings.impuestoPersonaJuridica = taxJuridica;
    alert('✅ Impuestos guardados correctamente.');
  };

  const handleClinicTypeChange = (clinicId: string, tipo: 'natural' | 'juridica') => {
    const clinica = clinicas.find(c => c.id === clinicId);
    if (clinica) {
      clinica.tipoPersona = tipo;
      setForceUpdate(prev => prev + 1);
    }
  };

  const handleLogoUpload = (clinicId: string) => {
    const logoUrl = prompt("Pega la URL del logo para esta clínica (simulación):");
    if (logoUrl) {
        const clinica = clinicas.find(c => c.id === clinicId);
        if(clinica) {
            clinica.logoUrl = logoUrl;
            setForceUpdate(prev => prev + 1);
            alert('Logo actualizado.');
        }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>⚙️ Configuración del Sistema</h1>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Configuración de Impuestos</h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>Impuesto Persona Natural (Boleta Honorarios)</label>
          <div style={styles.inputGroup}>
            <input
              type="number"
              value={taxNatural}
              onChange={(e) => setTaxNatural(parseFloat(e.target.value) || 0)}
              style={styles.input}
            />
            <span>%</span>
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Impuesto Persona Jurídica (Empresa)</label>
           <div style={styles.inputGroup}>
            <input
              type="number"
              value={taxJuridica}
              onChange={(e) => setTaxJuridica(parseFloat(e.target.value) || 0)}
              style={styles.input}
            />
            <span>%</span>
          </div>
        </div>
        <button style={styles.button} onClick={handleSaveTaxes}>
          Guardar Impuestos
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Configuración de Clínicas</h2>
        {clinicas.map(clinica => (
          <div key={clinica.id} style={styles.clinicRow}>
            <div style={styles.clinicInfo}>
                <img src={clinica.logoUrl || 'https://via.placeholder.com/50'} alt="Logo" style={styles.logo} />
                <span>{clinica.nombre}</span>
            </div>
            <div style={styles.clinicActions}>
              <select
                value={clinica.tipoPersona}
                onChange={(e) => handleClinicTypeChange(clinica.id, e.target.value as any)}
                style={styles.select}
              >
                <option value="natural">Persona Natural</option>
                <option value="juridica">Persona Jurídica</option>
              </select>
               <button style={{...styles.button, backgroundColor: '#64748b'}} onClick={() => handleLogoUpload(clinica.id)}>
                Cambiar Logo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Estilos
const styles = {
  container: { padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: '2rem' },
  title: { color: '#1e293b', fontSize: '1.5rem', fontWeight: 'bold' as const },
  backButton: { backgroundColor: '#64748b', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', marginRight: '0.5rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
  cardTitle: { margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' as const },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block' as const, color: '#374151', fontSize: '0.875rem', fontWeight: '500' as const, marginBottom: '0.5rem' },
  input: { width: 'calc(100% - 30px)', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' },
  inputGroup: { display: 'flex' as const, alignItems: 'center' as const, gap: '0.5rem' },
  button: { backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' },
  clinicRow: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, padding: '1rem 0', borderBottom: '1px solid #e2e8f0' },
  clinicInfo: { display: 'flex' as const, alignItems: 'center' as const, gap: '1rem', fontWeight: '500' as const, color: '#1e293b' },
  logo: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' as const },
  clinicActions: { display: 'flex' as const, gap: '1rem' },
  select: { padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white' }
};

export default Configuracion;