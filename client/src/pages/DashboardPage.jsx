import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import InsightsCard from '../components/insights/InsightsCard';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [postsRes, insightsRes] = await Promise.all([API.get('/posts/my'), API.get('/insights/my')]);
        setPosts(postsRes.data);
        setInsights(insightsRes.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, []);

  const handleGenerateInsights = async () => {
    setGenLoading(true);
    try {
      const { data } = await API.post('/insights/generate');
      setInsights(data);
      toast.success('Insights generated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setGenLoading(false);
  };

  if (loading) return <Loader />;

  const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0);
  const published = posts.filter(p => p.status === 'published');
  const drafts = posts.filter(p => p.status === 'draft');

  return (
    <div className="page container">
      <div className="page-header">
        <h1 className="page-title">📊 Author Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{published.length}</div><div className="stat-label">Published</div></div>
        <div className="stat-card"><div className="stat-value">{totalViews}</div><div className="stat-label">Total Views</div></div>
        <div className="stat-card"><div className="stat-value">{drafts.length}</div><div className="stat-label">Drafts</div></div>
        <div className="stat-card"><div className="stat-value">{posts.length}</div><div className="stat-label">All Posts</div></div>
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <InsightsCard insights={insights?.insights} analytics={insights?.analytics} onRefresh={handleGenerateInsights} loading={genLoading} />
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>🎨 Tone Breakdown</h3>
          {insights?.analytics?.toneBreakdown && Object.keys(insights.analytics.toneBreakdown).length > 0 ? (
            Object.entries(insights.analytics.toneBreakdown).map(([tone, data]) => (
              <div key={tone} className="consensus-bar-wrapper">
                <div className="consensus-bar-label"><span style={{ textTransform: 'capitalize' }}>{tone}</span><span>{data.count} posts · avg {data.avgViews} views</span></div>
                <div className="consensus-bar"><div className="consensus-bar-fill mind" style={{ width: `${Math.min((data.avgViews / Math.max(totalViews / posts.length, 1)) * 50, 100)}%` }} /></div>
              </div>
            ))
          ) : <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Not enough data yet. Publish more posts!</p>}
        </div>
      </div>

      <h2 className="section-title" style={{ marginBottom: '1rem' }}><span className="icon-box" style={{ background: 'var(--accent-pink)' }}>📝</span> My Posts</h2>
      {posts.length === 0 ? (
        <div className="empty-state"><div className="emoji">✍️</div><p>No posts yet. <Link to="/create">Write your first post!</Link></p></div>
      ) : (
        <div className="card card-flat" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Status</th><th>Views</th><th>Credibility</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {posts.map(post => (
                <tr key={post._id}>
                  <td><Link to={`/post/${post._id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>{post.title}</Link></td>
                  <td><span className={`badge ${post.status === 'published' ? 'badge-verified' : 'badge-unverified'}`}>{post.status}</span></td>
                  <td>{post.views || 0}</td>
                  <td><span className={`badge badge-${post.credibilityBadge || 'unverified'}`}>{post.credibilityBadge === 'verified' ? '✅' : post.credibilityBadge === 'disputed' ? '⚠️' : '❔'}</span></td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td><Link to={`/edit/${post._id}`} className="btn btn-white btn-sm">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default DashboardPage;
