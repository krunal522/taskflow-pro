import { Link } from 'react-router-dom';
import { Zap, CheckCircle, BarChart3, Shield, Layers, Clock, ArrowRight, GitBranch } from 'lucide-react';
import Navbar from '../components/Navbar';
import './LandingPage.css';

const features = [
  {
    icon: '🎯',
    color: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    title: 'Kanban Board',
    desc: 'Visually manage tasks with drag & drop columns — Todo, In Progress, Done. See your workflow at a glance.',
  },
  {
    icon: '🔐',
    color: 'linear-gradient(135deg,#059669,#0891b2)',
    title: 'JWT Authentication',
    desc: 'Secure login & registration with bcrypt password hashing and JSON Web Tokens. Your data stays safe.',
  },
  {
    icon: '📊',
    color: 'linear-gradient(135deg,#d97706,#dc2626)',
    title: 'Real-time Stats',
    desc: 'Live dashboard with completion rates, priority breakdowns, and productivity analytics.',
  },
  {
    icon: '☁️',
    color: 'linear-gradient(135deg,#0284c7,#7c3aed)',
    title: 'Azure Ready',
    desc: 'Built for cloud deployment on Microsoft Azure App Service with health check endpoints.',
  },
  {
    icon: '🔍',
    color: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    title: 'Smart Search & Filter',
    desc: 'Filter by status, priority, category or search by keyword — find any task instantly.',
  },
  {
    icon: '📱',
    color: 'linear-gradient(135deg,#be185d,#7c3aed)',
    title: 'Fully Responsive',
    desc: 'Pixel-perfect on desktop, tablet and mobile. Manage your tasks from anywhere.',
  },
];

const LandingPage = () => {
  return (
    <div className="landing">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="hero-badge">
          <Zap size={12} />
          Full Stack App — React + Node.js + MongoDB
        </div>

        <h1 className="hero-title">
          <span>Manage Tasks Like a</span>
          <span className="gradient-text">Pro Developer</span>
        </h1>

        <p className="hero-subtitle">
          A professional-grade task management platform built with
          React.js, Node.js, Express & MongoDB. JWT Auth, Kanban Board,
          real-time stats — production ready.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            <Zap size={18} /> Get Started Free
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
            <GitBranch size={16} /> View on GitHub
          </a>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In <ArrowRight size={16} />
          </Link>
        </div>

        <div className="hero-stats">
          {[
            { value: '10+', label: 'API Endpoints' },
            { value: 'JWT', label: 'Secure Auth' },
            { value: '100%', label: 'Responsive' },
            { value: 'Azure', label: 'Cloud Ready' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <span className="hero-stat-value gradient-text">{s.value}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">
            Everything a <span className="gradient-text">Full Stack Dev</span> Needs
          </h2>
          <p className="section-desc">
            Built to demonstrate mastery of React, Node.js, Express, MongoDB and cloud deployment.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <div className="tech-section">
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Built With
        </p>
        <div className="tech-tags">
          {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'JWT', 'bcrypt', 'Axios', 'Vite', 'Microsoft Azure'].map(t => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">
            Ready to <span className="gradient-text">Get Hired?</span>
          </h2>
          <p className="cta-desc">
            Start managing your tasks today. Built as a professional portfolio project
            demonstrating full stack development skills.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <Zap size={18} /> Create Account
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
