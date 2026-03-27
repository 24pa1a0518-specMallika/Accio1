import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  
  return (
    <div className="page" style={{ paddingTop: '120px' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <h1 className="display-title" style={{ fontSize: '48px', color: 'var(--brown-700)', marginBottom: '16px' }}>
          Welcome to ACCIO
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          The Campus Lost & Found Portal. Reconnect with what matters.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
              <Link to="/signup" className="btn btn-outline btn-lg">Create Account</Link>
            </>
          )}
        </div>
        
        <div style={{ marginTop: '60px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--brown-700), var(--brown-500))', padding: '40px', color: 'white' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Intelligent Matching 🪄</h2>
            <p style={{ opacity: 0.9 }}>Our system automatically matches lost items with found items using name, location, and time parameters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
