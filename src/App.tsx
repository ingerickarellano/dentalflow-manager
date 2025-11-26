import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CrearTrabajo from './components/CrearTrabajo';
import GestionClinicas from './components/GestionClinicas';
import GestionDentistas from './components/GestionDentistas';
import GestionLaboratoristas from './components/GestionLaboratoristas';
import GestionServicios from './components/GestionServicios';
import GestionTrabajos from './components/GestionTrabajos';
import GestionSuscripciones from './components/GestionSuscripciones';
import Suscripciones from './components/Suscripciones';
import RecuperacionCuenta from './components/RecuperacionCuenta';
import Reportes from './components/Reportes';
import LandingPage from './components/LandingPage';
import Registro from './components/Registro';
import AdminPanel from './components/AdminPanel';
import GestionPrecios from './components/GestionPrecios';
import OpcionesCuenta from './components/OpcionesCuenta';
import './App.css';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sesión activa al cargar
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          nombre: session.user.user_metadata?.nombre || session.user.email!.split('@')[0],
          rol: session.user.user_metadata?.rol || 'cliente'
        };
        setCurrentUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            nombre: session.user.user_metadata?.nombre || session.user.email!.split('@')[0],
            rol: session.user.user_metadata?.rol || 'cliente'
          };
          setCurrentUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/registro" element={<Registro onRegister={handleLogin} />} />
        <Route 
          path="/recuperacion" 
          element={<RecuperacionCuenta onBack={() => window.history.back()} />} 
        />
        
        {/* Rutas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            currentUser ? (
              <Dashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Ruta para CrearTrabajo */}
        <Route 
          path="/crear-trabajo" 
          element={
            currentUser ? (
              <CrearTrabajo />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/clinicas" 
          element={
            currentUser ? (
              <GestionClinicas />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/dentistas" 
          element={
            currentUser ? (
              <GestionDentistas />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/laboratoristas" 
          element={
            currentUser ? (
              <GestionLaboratoristas />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/servicios" 
          element={
            currentUser ? (
              <GestionServicios />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/trabajos" 
          element={
            currentUser ? (
              <GestionTrabajos />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/gestion-suscripciones" 
          element={
            currentUser ? (
              <GestionSuscripciones />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/suscripciones" 
          element={
            currentUser ? (
              <Suscripciones />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/precios" 
          element={
            currentUser ? (
              <GestionPrecios />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

<Route 
  path="/configuracion" 
  element={
    currentUser ? (
      <OpcionesCuenta onBack={() => navigate('/dashboard')} />
    ) : (
      <Navigate to="/login" />
    )
  } 
/>
        <Route 
          path="/admin" 
          element={
            currentUser?.rol === 'admin' ? (
              <AdminPanel onBack={() => window.history.back()} />
            ) : (
              <Navigate to="/dashboard" />
            )
          } 
        />

<Route 
  path="/opciones-cuenta" 
  element={
    currentUser ? (
      <OpcionesCuenta onBack={() => navigate('/dashboard')} />
    ) : (
      <Navigate to="/login" />
    )
  } 
/>
        <Route 
          path="/reportes" 
          element={
            currentUser ? (
              <Reportes onBack={() => navigate('/dashboard')} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;