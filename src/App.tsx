import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GestionClinicas from './components/GestionClinicas';
import GestionDentistas from './components/GestionDentistas';
import GestionLaboratoristas from './components/GestionLaboratoristas';
import GestionServicios from './components/GestionServicios';
import GestionTrabajos from './components/GestionTrabajos';
import GestionSuscripciones from './components/GestionSuscripciones';
import Suscripciones from './components/Suscripciones';
import RecuperacionCuenta from './components/RecuperacionCuenta';
import LandingPage from './components/LandingPage';
import Registro from './components/Registro';
import AdminPanel from './components/AdminPanel';
import './App.css';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentModule, setCurrentModule] = useState<string>('landing');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentModule('dashboard');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentModule('dashboard');
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentModule('landing');
    localStorage.removeItem('currentUser');
  };

  const handleNavigate = (module: string) => {
    setCurrentModule(module);
  };

  const handleBack = () => {
    setCurrentModule('dashboard');
  };

  if (currentModule === 'landing') {
    return <LandingPage />;
  }

  if (currentModule === 'login') {
    return <Login onLogin={handleLogin} onBack={() => setCurrentModule('landing')} />;
  }

  if (currentModule === 'registro') {
    return <Registro onRegister={handleLogin} onBack={() => setCurrentModule('landing')} />;
  }

  if (currentModule === 'recuperacion') {
    return <RecuperacionCuenta onBack={() => setCurrentModule('login')} />;
  }

  if (currentModule === 'admin') {
    return <AdminPanel onBack={handleBack} />;
  }

  return (
    <div className="App">
      {currentModule === 'dashboard' && currentUser && (
        <Dashboard 
          user={currentUser}
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
        />
      )}
      
      {currentModule === 'clinicas' && (
        <GestionClinicas onBack={handleBack} />
      )}
      
      {currentModule === 'dentistas' && (
        <GestionDentistas onBack={handleBack} />
      )}
      
      {currentModule === 'laboratoristas' && (
        <GestionLaboratoristas onBack={handleBack} />
      )}
      
      {currentModule === 'servicios' && (
        <GestionServicios onBack={handleBack} />
      )}
      
      {currentModule === 'trabajos' && (
        <GestionTrabajos onBack={handleBack} />
      )}
      
      {currentModule === 'gestion-suscripciones' && (
        <GestionSuscripciones onBack={handleBack} />
      )}
      
      {currentModule === 'suscripciones' && (
        <Suscripciones onBack={handleBack} />
      )}
    </div>
  );
}

export default App;