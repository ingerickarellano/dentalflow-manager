import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

// Importar componentes
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Registro from './components/Registro';
import RecuperacionCuenta from './components/RecuperacionCuenta';
import Dashboard from './components/Dashboard';
import CrearTrabajo from './components/CrearTrabajo';
import GestionClinicas from './components/GestionClinicas';
import GestionDentistas from './components/GestionDentistas';
import GestionLaboratoristas from './components/GestionLaboratoristas';
import GestionServicios from './components/GestionServicios';
import GestionTrabajos from './components/GestionTrabajos';
import GestionPrecios from './components/GestionPrecios';
import OpcionesCuenta from './components/OpcionesCuenta';
import Reportes from './components/Reportes';
import AdminPanel from './components/AdminPanel';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  suscripcion_activa?: boolean;
  fecha_expiracion?: string | null;
  plan?: string;
  laboratorio?: string;
  telefono?: string;
}

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. INICIALIZACIÓN SIMPLE Y SEGURA
  useEffect(() => {
    console.log('🚀 App.tsx montado (solo una vez)');
    
    let isActive = true;

    // Función para verificar sesión
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isActive) return;
        
        if (error) {
          console.error('❌ Error obteniendo sesión:', error);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setLoading(false);
        
        // Si hay sesión y estamos en login/registro, redirigir
        if (session?.user && (window.location.pathname === '/login' || window.location.pathname === '/registro')) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('💥 Error en checkSession:', error);
        if (isActive) setLoading(false);
      }
    };

    checkSession();

    // 2. LISTENER MINIMALISTA - sin lógica compleja
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isActive) return;
        
        console.log('🔄 Evento auth:', event, 'en ruta:', window.location.pathname);
        
        // Solo actualizar la sesión - sin lógica de redirección
        setSession(newSession);
        
        // SOLO DOS CASOS ESPECÍFICOS:
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Si acabamos de hacer login desde la página de login
          if (window.location.pathname === '/login') {
            console.log('🎯 Redirigiendo desde login a dashboard');
            navigate('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          // Si cerramos sesión, redirigir a home
          console.log('🔒 Redirigiendo a home después de logout');
          navigate('/');
        }
      }
    );

    // Cleanup limpio
    return () => {
      console.log('🧹 App.tsx cleanup');
      isActive = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // 3. DERIVAR currentUser DESDE session (sin estado separado)
  const currentUser: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email!,
    nombre: session.user.user_metadata?.nombre || session.user.email!.split('@')[0],
    rol: session.user.user_metadata?.rol || 'cliente',
    suscripcion_activa: false,
    plan: 'gratuita'
  } : null;

  // 4. LOADER SIMPLE
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦷</div>
          <div style={{ color: '#64748b', fontSize: '1.125rem' }}>DentalFlow</div>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Inicializando...
          </div>
        </div>
      </div>
    );
  }

  console.log('🎉 App lista. Usuario:', currentUser?.email || 'No autenticado', 'Ruta:', window.location.pathname);

  // 5. FUNCIÓN DE LOGOUT DIRECTO
  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      console.log('🚪 Logout solicitado');
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="App">
      <Routes>
        {/* RUTA PRINCIPAL */}
        <Route path="/" element={<LandingPage />} />
        
        {/* AUTENTICACIÓN */}
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        <Route 
          path="/registro" 
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Registro onBack={() => navigate('/')} />} 
        />
        
        <Route 
          path="/recuperacion" 
          element={currentUser ? <Navigate to="/dashboard" replace /> : <RecuperacionCuenta onBack={() => navigate('/login')} />} 
        />
        
        {/* DASHBOARD PRINCIPAL */}
        <Route 
          path="/dashboard" 
          element={
            currentUser ? 
              <Dashboard user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* MÓDULOS DEL SISTEMA */}
        <Route 
          path="/crear-trabajo" 
          element={
            currentUser ? 
              <CrearTrabajo onBack={() => navigate('/dashboard')} /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/clinicas" 
          element={
            currentUser ? 
              <GestionClinicas /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/dentistas" 
          element={
            currentUser ? 
              <GestionDentistas /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/laboratoristas" 
          element={
            currentUser ? 
              <GestionLaboratoristas /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/servicios" 
          element={
            currentUser ? 
              <GestionServicios /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/trabajos" 
          element={
            currentUser ? 
              <GestionTrabajos /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/precios" 
          element={
            currentUser ? 
              <GestionPrecios /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/configuracion" 
          element={
            currentUser ? 
              <OpcionesCuenta onBack={() => navigate('/dashboard')} /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/reportes" 
          element={
            currentUser ? 
              <Reportes onBack={() => navigate('/dashboard')} /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            currentUser && currentUser.rol === 'admin' ? 
              <AdminPanel onBack={() => navigate('/dashboard')} /> : 
              <Navigate to="/dashboard" replace />
          } 
        />
        
        <Route 
          path="/opciones-cuenta" 
          element={
            currentUser ? 
              <OpcionesCuenta onBack={() => navigate('/dashboard')} /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* RUTA POR DEFECTO */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;