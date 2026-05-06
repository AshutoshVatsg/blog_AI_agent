import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ErrorMessage from '../components/common/ErrorMessage';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirmPassword);
      toast.success('Account created!');
      navigate('/');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    setLoading(false);
  };

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Join TrustBlog ✦</h1>
        <p className="auth-subtitle">Create your account and start publishing</p>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={update('name')} placeholder="Your name" required /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" required /></div>
          <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Re-type password" required /></div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
};
export default RegisterPage;
