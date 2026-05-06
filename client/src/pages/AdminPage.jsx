import { useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [dashRes, usersRes] = await Promise.all([API.get('/admin/dashboard'), API.get('/admin/users')]);
      setDashboard(dashRes.data);
      setUsers(usersRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId, role) => {
    try { await API.put(`/admin/users/${userId}/role`, { role }); toast.success('Role updated'); load(); }
    catch (err) { toast.error('Failed'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="page container">
      <h1 className="page-title">🛡️ Admin Panel</h1>

      <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
        <div className="stat-card"><div className="stat-value">{dashboard?.totalUsers || 0}</div><div className="stat-label">Users</div></div>
        <div className="stat-card"><div className="stat-value">{dashboard?.totalPosts || 0}</div><div className="stat-label">Posts</div></div>
        <div className="stat-card"><div className="stat-value">{dashboard?.totalComments || 0}</div><div className="stat-label">Comments</div></div>
        <div className="stat-card"><div className="stat-value">{dashboard?.disputedPosts || 0}</div><div className="stat-label">Disputed</div></div>
      </div>

      <h2 className="section-title"><span className="icon-box" style={{ background: 'var(--accent-green)' }}>👥</span> User Management</h2>
      <div className="card card-flat" style={{ overflow: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Posts</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-verified' : 'badge-unverified'}`}>{u.role}</span></td>
                <td>{u.postCount || 0}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '0.3rem' }}>
                  {u.role !== 'admin' && <button className="btn btn-green btn-sm" onClick={() => changeRole(u._id, 'admin')}>Make Admin</button>}
                  {u.role === 'admin' && <button className="btn btn-white btn-sm" onClick={() => changeRole(u._id, 'user')}>Remove Admin</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminPage;
