import { Link } from 'react-router-dom';
const NotFoundPage = () => (
  <div className="page container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🤔</div>
    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This page doesn't exist</p>
    <Link to="/" className="btn btn-primary">← Back to Home</Link>
  </div>
);
export default NotFoundPage;
