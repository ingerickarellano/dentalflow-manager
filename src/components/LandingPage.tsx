import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PayPalButton from '../components/PayPalButton';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#1e293b'
    },
    header: {
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    nav: {
      display: 'flex',
      gap: '2rem'
    },
    navLink: {
      color: '#64748b',
      textDecoration: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'color 0.2s'
    },
    hero: {
      textAlign: 'center' as const,
      padding: '6rem 2rem',
      maxWidth: '1000px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
      color: 'white',
      borderRadius: '1rem',
      marginTop: '2rem'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      marginBottom: '2.5rem',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto'
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
      margin: '0 0.5rem',
      transition: 'background-color 0.2s'
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
      margin: '0 0.5rem',
      transition: 'background-color 0.2s'
    },
    features: {
      padding: '6rem 2rem',
      backgroundColor: 'white'
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
      padding: '2.5rem',
      borderRadius: '0.75rem',
      textAlign: 'center' as const,
      border: '1px solid #e2e8f0',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1.5rem'
    },
    pricing: {
      padding: '6rem 2rem',
      backgroundColor: '#f1f5f9'
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    planCard: {
      backgroundColor: 'white',
      padding: '2.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      textAlign: 'center' as const,
      border: '2px solid #e2e8f0',
      transition: 'all 0.3s ease',
      position: 'relative' as const
    },
    planCardFeatured: {
      borderColor: '#475569',
      transform: 'scale(1.05)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
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
      color: '#475569',
      marginBottom: '0.5rem'
    },
    planPeriod: {
      color: '#64748b',
      fontSize: '1rem',
      marginBottom: '1.5rem'
    },
    planFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: '2rem 0'
    },
    planFeature: {
      padding: '0.75rem 0',
      color: '#475569',
      borderBottom: '1px solid #f1f5f9'
    },
    popularBadge: {
      position: 'absolute' as const,
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#475569',
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '2rem',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    paypalContainer: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0'
    },
    paymentStatus: {
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      textAlign: 'center' as const,
      fontWeight: '600'
    },
    paymentSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    paymentError: {
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    paymentProcessing: {
      backgroundColor: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #dbeafe'
    },
    ctaSection: {
      backgroundColor: '#475569',
      color: 'white',
      padding: '6rem 2rem',
      textAlign: 'center' as const
    },
    emailInput: {
      padding: '1rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      marginRight: '1rem',
      minWidth: '300px',
      backgroundColor: 'white'
    },
    footer: {
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '3rem 2rem',
      textAlign: 'center' as const
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      maxWidth: '800px',
      margin: '4rem auto',
      textAlign: 'center' as const
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#475569',
      marginBottom: '0.5rem'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '1rem'
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '1rem',
      maxWidth: '500px',
      width: '90%',
      textAlign: 'center' as const
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Inicial',
      price: 19.99,
      period: 'mes',
      originalPrice: 24.99,
      features: [
        '3 clínicas incluidas',
        '10 dentistas máximo',
        '100 trabajos/mes',
        'Soporte por email',
        'Reportes básicos',
        'App móvil básica'
      ],
      featured: false,
      popular: false
    },
    {
      id: 'professional',
      name: 'Profesional',
      price: 49.99,
      period: 'mes',
      originalPrice: 59.99,
      features: [
        '15 clínicas incluidas',
        '50 dentistas máximo',
        '500 trabajos/mes',
        'Soporte prioritario',
        'Reportes avanzados',
        'App móvil completa',
        'API acceso',
        'Backup automático'
      ],
      featured: true,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 129.99,
      period: 'mes',
      originalPrice: 149.99,
      features: [
        'Clínicas ilimitadas',
        'Dentistas ilimitados',
        'Trabajos ilimitados',
        'Soporte 24/7 dedicado',
        'Reportes personalizados',
        'App móvil premium',
        'API completo',
        'White-label',
        'Onboarding personalizado'
      ],
      featured: false,
      popular: false
    }
  ];

  const features = [
    {
      icon: '🏥',
      title: 'Gestión Multi-Clínica',
      description: 'Administra múltiples clínicas dentales desde una sola plataforma.'
    },
    {
      icon: '📋',
      title: 'Trabajos en Tiempo Real',
      description: 'Seguimiento en vivo de todos los trabajos dentales en producción.'
    },
    {
      icon: '💰',
      title: 'Control de Precios Inteligente',
      description: 'Listas de precios personalizables por servicio y cliente.'
    },
    {
      icon: '📊',
      title: 'Reportes Avanzados',
      description: 'Métricas detalladas de productividad, ingresos y rentabilidad.'
    },
    {
      icon: '👨‍🔧',
      title: 'Gestión de Laboratoristas',
      description: 'Organiza y supervisa a tu equipo técnico eficientemente.'
    },
    {
      icon: '🔒',
      title: 'Seguridad Enterprise',
      description: 'Tus datos protegidos con encriptación de grado bancario.'
    }
  ];

  const stats = [
    { number: '100+', label: 'Laboratorios' },
    { number: '5,000+', label: 'Trabajos Mensuales' },
    { number: '98%', label: 'Satisfacción Clientes' },
    { number: '24/7', label: 'Soporte' }
  ];

  const handleRegistro = (planId?: string) => {
    if (planId) {
      setSelectedPlan(planId);
      setShowPayPal(true);
    } else {
      navigate('/registro');
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    setPaymentStatus('success');
    
    // Aquí integrarías con tu backend para crear la cuenta
    console.log('Pago exitoso:', details);
    console.log('Plan seleccionado:', selectedPlan);
    
    // Redirigir al registro después de 2 segundos
    setTimeout(() => {
      navigate('/registro', { 
        state: { 
          plan: selectedPlan,
          paymentDetails: details 
        } 
      });
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus('error');
    console.error('Error en el pago:', error);
  };

  const handlePaymentCancel = () => {
    setShowPayPal(false);
    setSelectedPlan(null);
    setPaymentStatus('idle');
  };

  const handleDemoRequest = () => {
    if (email) {
      alert(`¡Gracias! Te contactaremos pronto al email: ${email} para coordinar tu demo.`);
      setEmail('');
    } else {
      alert('Por favor ingresa tu email para solicitar el demo.');
    }
  };

  const getSelectedPlan = () => {
    return plans.find(plan => plan.id === selectedPlan);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>🦷 DentalFlow</div>
        <nav style={styles.nav}>
          <a style={styles.navLink} href="#features">Características</a>
          <a style={styles.navLink} href="#pricing">Precios</a>
          <a style={styles.navLink} href="#contact">Contacto</a>
          <a 
            style={{...styles.navLink, color: '#475569', fontWeight: '600'}} 
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </a>
        </nav>
      </header>

      {/* Modal de PayPal */}
      {showPayPal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{marginBottom: '1rem', color: '#1e293b'}}>
              Completar Pago - {getSelectedPlan()?.name}
            </h2>
            <p style={{marginBottom: '1.5rem', color: '#64748b'}}>
              Total: <strong>${getSelectedPlan()?.price} USD</strong>
            </p>

            {paymentStatus === 'processing' && (
              <div style={{...styles.paymentStatus, ...styles.paymentProcessing}}>
                Procesando pago...
              </div>
            )}

            {paymentStatus === 'success' && (
              <div style={{...styles.paymentStatus, ...styles.paymentSuccess}}>
                ✅ Pago exitoso! Redirigiendo...
              </div>
            )}

            {paymentStatus === 'error' && (
              <div style={{...styles.paymentStatus, ...styles.paymentError}}>
                ❌ Error en el pago. Intenta nuevamente.
              </div>
            )}

            {paymentStatus === 'idle' && (
              <div style={styles.paypalContainer}>
                <PayPalButton
                  amount={getSelectedPlan()?.price || 0}
                  planId={selectedPlan || ''}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>
            )}

            <button 
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
              onClick={() => setShowPayPal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          La Plataforma Todo-en-Uno para Laboratorios Dentales
        </h1>
        <p style={styles.heroSubtitle}>
          Optimiza tu workflow, aumenta tu productividad y haz crecer tu laboratorio 
          con la solución más completa del mercado.
        </p>
        <div>
          <button 
            style={styles.ctaButton}
            onClick={() => handleRegistro('professional')}
          >
            Comenzar Prueba Gratis
          </button>
          <button 
            style={styles.secondaryButton}
            onClick={() => document.getElementById('pricing')?.scrollIntoView()}
          >
            Ver Planes
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
        <div style={styles.stats}>
          {stats.map((stat, index) => (
            <div key={index}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features} id="features">
        <h2 style={styles.sectionTitle}>Todo lo que Necesitas en un Solo Lugar</h2>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={index}
              style={styles.featureCard}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={{color: '#1e293b', marginBottom: '1rem'}}>{feature.title}</h3>
              <p style={{color: '#64748b', lineHeight: '1.6'}}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={styles.pricing} id="pricing">
        <h2 style={styles.sectionTitle}>Planes que Crecen Contigo</h2>
        <p style={{textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '1.125rem'}}>
          Sin contratos largos. Cancela cuando quieras.
        </p>
        <div style={styles.plansGrid}>
          {plans.map((plan) => (
            <div 
              key={plan.id}
              style={{
                ...styles.planCard,
                ...(plan.featured ? styles.planCardFeatured : {})
              }}
            >
              {plan.popular && <div style={styles.popularBadge}>MÁS POPULAR</div>}
              <h3 style={styles.planName}>{plan.name}</h3>
              <div style={styles.planPrice}>
                ${plan.price}
                <span style={styles.planPeriod}>/mes</span>
              </div>
              {plan.originalPrice && (
                <div style={{color: '#94a3b8', textDecoration: 'line-through', marginBottom: '1rem'}}>
                  Antes: ${plan.originalPrice}
                </div>
              )}
              <ul style={styles.planFeatures}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={styles.planFeature}>✓ {feature}</li>
                ))}
              </ul>
              <button 
                style={{
                  ...styles.ctaButton,
                  backgroundColor: plan.featured ? '#475569' : '#10b981',
                  width: '100%',
                  marginTop: '1rem'
                }}
                onClick={() => handleRegistro(plan.id)}
              >
                {plan.price === 0 ? 'Comenzar Gratis' : 'Seleccionar Plan'}
              </button>
              
              {/* Botón de PayPal alternativo */}
              <div style={{marginTop: '1rem'}}>
                <button 
                  style={{
                    backgroundColor: '#0070ba',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: '600'
                  }}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setShowPayPal(true);
                  }}
                >
                  💳 Pagar con PayPal
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Garantía */}
        <div style={{textAlign: 'center', marginTop: '3rem', color: '#64748b'}}>
          <p>✅ 14 días de garantía de devolución | ✅ Soporte 24/7 | ✅ Actualizaciones gratuitas</p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection} id="contact">
        <h2 style={{...styles.sectionTitle, color: 'white'}}>¿Listo para Transformar tu Laboratorio?</h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Agenda una demo personalizada y descubre cómo DentalFlow puede aumentar tu productividad en un 40%
        </p>
        <div>
          <input
            type="email"
            placeholder="Tu email..."
            style={styles.emailInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            style={styles.ctaButton}
            onClick={handleDemoRequest}
          >
            Solicitar Demo
          </button>
        </div>
        <p style={{ marginTop: '2rem', opacity: 0.8 }}>
          O llámanos: <strong>+56 9 1234 5678</strong>
        </p>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={styles.logo}>🦷 DentalFlow</div>
          <p style={{marginTop: '1rem', marginBottom: '2rem', opacity: 0.8}}>
            La plataforma líder en gestión para laboratorios dentales en Latinoamérica
          </p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem'}}>
            <a style={{color: 'white', textDecoration: 'none'}} href="#features">Características</a>
            <a style={{color: 'white', textDecoration: 'none'}} href="#pricing">Precios</a>
            <a style={{color: 'white', textDecoration: 'none'}} href="#contact">Contacto</a>
            <a style={{color: 'white', textDecoration: 'none'}} onClick={() => navigate('/login')}>Login</a>
          </div>
          <p>© 2024 DentalFlow. Todos los derechos reservados.</p>
          <p style={{opacity: 0.7, marginTop: '0.5rem'}}>contacto@dentalflow.cl | +56 9 1234 5678</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;