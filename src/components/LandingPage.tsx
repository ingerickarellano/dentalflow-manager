import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { planesMembresia } from '../data/database';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
      color: 'white'
    },
    header: {
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    nav: {
      display: 'flex',
      gap: '2rem'
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    hero: {
      textAlign: 'center' as const,
      padding: '4rem 2rem',
      maxWidth: '800px',
      margin: '0 auto'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      marginBottom: '2rem',
      opacity: 0.9
    },
    ctaButton: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1.125rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '0 0.5rem'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: 'white',
      padding: '1rem 2rem',
      border: '2px solid white',
      borderRadius: '0.5rem',
      fontSize: '1.125rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '0 0.5rem'
    },
    features: {
      backgroundColor: 'white',
      color: '#1e293b',
      padding: '4rem 2rem'
    },
    sectionTitle: {
      textAlign: 'center' as const,
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '3rem',
      color: '#1e293b'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    featureCard: {
      backgroundColor: '#f8fafc',
      padding: '2rem',
      borderRadius: '0.5rem',
      textAlign: 'center' as const
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    pricing: {
      padding: '4rem 2rem',
      backgroundColor: '#f1f5f9'
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    planCard: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      textAlign: 'center' as const,
      border: '2px solid transparent',
      transition: 'all 0.3s ease'
    },
    planCardFeatured: {
      borderColor: '#2563eb',
      transform: 'scale(1.05)'
    },
    planName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#1e293b'
    },
    planPrice: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#2563eb',
      marginBottom: '1rem'
    },
    planPeriod: {
      color: '#64748b',
      fontSize: '1rem'
    },
    planFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: '2rem 0'
    },
    planFeature: {
      padding: '0.5rem 0',
      color: '#475569'
    },
    ctaSection: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '4rem 2rem',
      textAlign: 'center' as const
    },
    emailInput: {
      padding: '1rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      marginRight: '1rem',
      minWidth: '300px'
    },
    footer: {
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '2rem',
      textAlign: 'center' as const
    }
  };

  const handleRegistro = (planId?: string) => {
    if (planId) {
      navigate(`/registro?plan=${planId}`);
    } else {
      navigate('/registro');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>🦷 DentalFlow</div>
        <nav style={styles.nav}>
          <a style={styles.navLink} href="#features">Características</a>
          <a style={styles.navLink} href="#pricing">Precios</a>
          <a style={styles.navLink} onClick={() => navigate('/login')}>Iniciar Sesión</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Gestión Inteligente para Tu Laboratorio Dental
        </h1>
        <p style={styles.heroSubtitle}>
          Optimiza tu workflow, gestiona pacientes y haz crecer tu laboratorio con nuestra plataforma todo-en-uno.
        </p>
        <div>
          <button style={styles.ctaButton} onClick={() => handleRegistro()}>
            Comenzar Gratis
          </button>
          <button style={styles.secondaryButton} onClick={() => navigate('/login')}>
            Demo en Vivo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features} id="features">
        <h2 style={styles.sectionTitle}>Todo lo que Necesitas en un Solo Lugar</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏥</div>
            <h3>Gestión de Clínicas</h3>
            <p>Administra múltiples clínicas y dentistas asociados de forma centralizada.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📋</div>
            <h3>Trabajos en Proceso</h3>
            <p>Seguimiento en tiempo real de todos los trabajos dentales en producción.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💰</div>
            <h3>Control de Precios</h3>
            <p>Listas de precios personalizables por servicio y cliente.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3>Reportes Avanzados</h3>
            <p>Métricas detalladas de productividad e ingresos.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={styles.pricing} id="pricing">
        <h2 style={styles.sectionTitle}>Planes que se Adaptan a Ti</h2>
        <div style={styles.plansGrid}>
          {planesMembresia.map((plan, index) => (
            <div 
              key={plan.id}
              style={{
                ...styles.planCard,
                ...(plan.id === 'premium' ? styles.planCardFeatured : {})
              }}
            >
              <h3 style={styles.planName}>{plan.nombre}</h3>
              <div style={styles.planPrice}>
                ${plan.precio}
                <span style={styles.planPeriod}>/mes</span>
              </div>
              <ul style={styles.planFeatures}>
                {plan.caracteristicas.map((caracteristica, idx) => (
                  <li key={idx} style={styles.planFeature}>✓ {caracteristica}</li>
                ))}
              </ul>
              <button 
                style={{
                  ...styles.ctaButton,
                  backgroundColor: plan.id === 'premium' ? '#2563eb' : '#10b981',
                  width: '100%'
                }}
                onClick={() => handleRegistro(plan.id)}
              >
                {plan.precio === 0 ? 'Comenzar Gratis' : 'Seleccionar Plan'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.sectionTitle}>¿Listo para Transformar tu Laboratorio?</h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          Únete a más de 100 laboratorios que ya usan DentalFlow
        </p>
        <div>
          <input
            type="email"
            placeholder="Tu email..."
            style={styles.emailInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button style={styles.ctaButton}>
            Solicitar Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2024 DentalFlow. Todos los derechos reservados.</p>
        <p>contacto@dentalflow.com | +1 (555) 123-4567</p>
      </footer>
    </div>
  );
};

export default LandingPage;