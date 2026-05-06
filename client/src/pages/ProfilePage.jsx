import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import PostList from '../components/posts/PostList';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = currentUser?._id === id;

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, statsRes, postsRes] = await Promise.all([
          API.get(`/users/${id}`),
          API.get(`/users/${id}/stats`),
          isOwner ? API.get('/posts/my') : API.get(`/posts?limit=50`),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
        const userPosts = isOwner ? postsRes.data : postsRes.data.posts?.filter(p => p.authorId?._id === id);
        setPosts(userPosts || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [id, isOwner]);

  if (loading) return <Loader />;
  if (!profile) return <div className="page container empty-state"><div className="emoji">🤷</div><p>User not found</p></div>;

  return (
    <div className="page container">
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="nav-avatar" style={{ width: 72, height: 72, fontSize: '1.8rem', background: 'var(--accent-green)' }}>{profile.name?.[0]?.toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem' }}>{profile.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{profile.bio || 'No bio yet'}</p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.88rem' }}>
            <span><strong>{stats?.postCount || 0}</strong> Posts</span>
            <span><strong>{stats?.totalViews || 0}</strong> Views</span>
            <span className={`badge badge-${profile.role === 'admin' ? 'verified' : 'unverified'}`}>{profile.role}</span>
          </div>
        </div>
        {isOwner && <Link to="/dashboard" className="btn btn-yellow btn-sm">📊 Dashboard</Link>}
      </div>
      <h2 className="section-title"><span className="icon-box" style={{ background: 'var(--accent-purple)' }}>📝</span> Posts</h2>
      <PostList posts={posts} />
    </div>
  );
};
export default ProfilePage;
