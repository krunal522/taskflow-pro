import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConstants';

const NotFoundPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 20, textAlign: 'center', padding: '24px' }}>
    <div style={{ fontSize: 80 }}>🚀</div>
    <h1 style={{ fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 900, lineHeight: 1 }} className="gradient-text">404</h1>
    <h2 style={{ fontSize: 24, fontWeight: 700 }}>Page Not Found</h2>
    <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
      Looks like this page doesn't exist. Let's get you back on track!
    </p>
    <Link to={ROUTES.DASHBOARD} className="btn btn-primary btn-lg">
      Go to Dashboard
    </Link>
  </div>
);

export default NotFoundPage;
