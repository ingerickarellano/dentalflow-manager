import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Clinicas from './components/Clinicas';
import CrearTrabajo from './components/CrearTrabajo';
import TrabajosProceso from './components/TrabajosProceso';
import Laboratoristas from './components/Laboratoristas';
import ListaPrecios from './components/ListaPrecios';
import Reportes from './components/Reportes';
import OpcionesCuenta from './components/OpcionesCuenta';
import Suscripciones from './components/Suscripciones';
import GestionSuscripciones from './components/GestionSuscripciones';
import RecuperacionCuenta from './components/RecuperacionCuenta';
import './App.css';

// Componente principal que maneja la lógica de la aplicación
function AppContent() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si el usuario está logueado al cargar la aplicación
  useEffect(() => {
    const savedUser = localStorage.getItem('dentalflow-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
      
      // Si está en la raíz, redirigir al dashboard
      if (location.pathname === '/') {
        navigate('/dashboard', { replace: true });
      }
    } else {
      // Si no está logueado, redirigir al login
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, location]);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Guardar usuario en localStorage
    localStorage.setItem('dentalflow-user', JSON.stringify(userData));
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('dentalflow-user');
    navigate('/login', { replace: true });
  };

  const handleNavigate = (module: string) => {
    navigate(`/${module}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  // Si no está logueado, mostrar solo la ruta de login
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  // Rutas cuando el usuario está logueado
  return (
    <Routes>
      <Route 
        path="/dashboard" 
        element={<Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />} 
      />
      <Route 
        path="/clinicas" 
        element={<Clinicas onBack={handleBack} />} 
      />
      <Route 
        path="/crear-trabajo" 
        element={<CrearTrabajo onBack={handleBack} />} 
      />
      <Route 
        path="/trabajos-proceso" 
        element={<TrabajosProceso onBack={handleBack} />} 
      />
      <Route 
        path="/laboratoristas" 
        element={<Laboratoristas onBack={handleBack} />} 
      />
      <Route 
        path="/precios" 
        element={<ListaPrecios onBack={handleBack} />}
      />
      <Route 
        path="/reportes" 
        element={<Reportes onBack={handleBack} />}
      />
      {/* AGREGAR ESTA NUEVA RUTA - línea 79 aprox */}
      <Route 
        path="/opciones-cuenta" 
        element={<OpcionesCuenta onBack={handleBack} />}
      />
      <Route 
  path="/recuperacion-cuenta" 
  element={<RecuperacionCuenta onBack={() => navigate('/login')} />}
/>

      {/* Redirigir cualquier ruta no definida al dashboard */}
      <Route path="*" element={<Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />} />
    <Route 
  path="/suscripciones" 
  element={<Suscripciones onBack={handleBack} />}
/>
<Route 
  path="/gestion-suscripciones" 
  element={<GestionSuscripciones onBack={handleBack} />}
/>
    </Routes>
    
  );
}

// Componente principal que envuelve con Router
function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;