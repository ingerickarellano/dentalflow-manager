import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Clinicas from './components/Clinicas';
import CrearTrabajo from './components/CrearTrabajo';
import TrabajosProceso from './components/TrabajosProceso'; // <- Agrega esta línea
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentModule, setCurrentModule] = useState('dashboard');

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentModule('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentModule('dashboard');
  };

  const handleNavigate = (module: string) => {
    setCurrentModule(module);
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'clinicas':
        return <Clinicas onBack={() => setCurrentModule('dashboard')} />;
      case 'crear-trabajo':
        return <CrearTrabajo onBack={() => setCurrentModule('dashboard')} />;
      case 'trabajos-proceso':
        return <TrabajosProceso onBack={() => setCurrentModule('dashboard')} />; // <- Actualiza esta línea
      case 'precios':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>💰 Lista de Precios</h1>
            <p>Módulo en construcción - Próximamente</p>
            <button 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentModule('dashboard')}
            >
              Volver al Dashboard
            </button>
          </div>
        );
      case 'reportes':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>📊 Reportes</h1>
            <p>Módulo en construcción - Próximamente</p>
            <button 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentModule('dashboard')}
            >
              Volver al Dashboard
            </button>
          </div>
        );
      default:
        return <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        renderModule()
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;