import { useState } from 'react';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ConsensusDisplay = ({ averages }) => (
  <div>
    {[
      { label: 'Mind-changing', value: averages?.avgMindChanging || 0, cls: 'mind' },
      { label: 'Originality', value: averages?.avgOriginality || 0, cls: 'originality' },
      { label: 'Clarity', value: averages?.avgClarity || 0, cls: 'clarity' },
    ].map(item => (
      <div key={item.label} className="consensus-bar-wrapper">
        <div className="consensus-bar-label"><span>{item.label}</span><span>{item.value}/10</span></div>
        <div className="consensus-bar"><div className={`consensus-bar-fill ${item.cls}`} style={{ width: `${item.value * 10}%` }} /></div>
      </div>
    ))}
    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{averages?.totalRatings || 0} ratings</p>
  </div>
);

const ConsensusMeter = ({ postId }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState({ mindChanging: 5, originality: 5, clarity: 5 });
  const [averages, setAverages] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useState(() => {
    const load = async () => {
      try {
        const { data } = await API.get(`/posts/${postId}/consensus`);
        setAverages(data);
        if (user) {
          const { data: myRating } = await API.get(`/posts/${postId}/consensus/me`);
          if (myRating) { setRatings({ mindChanging: myRating.mindChanging, originality: myRating.originality, clarity: myRating.clarity }); setSubmitted(true); }
        }
      } catch (err) { /* silent */ }
    };
    if (postId) load();
  }, [postId]);

  const handleSubmit = async () => {
    if (!user) return toast.error('Login to rate');
    setLoading(true);
    try {
      await API.post(`/posts/${postId}/consensus`, ratings);
      const { data } = await API.get(`/posts/${postId}/consensus`);
      setAverages(data);
      setSubmitted(true);
      toast.success('Rating submitted!');
    } catch (err) { toast.error('Failed to submit'); }
    setLoading(false);
  };

  return (
    <div className="consensus-section">
      <h3 style={{ marginBottom: '1rem' }}>📊 Consensus Meters</h3>
      {averages && <ConsensusDisplay averages={averages} />}
      {user && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '2px solid var(--bg-alt)' }}>
          <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.75rem' }}>{submitted ? 'Update your rating' : 'Rate this post'}</p>
          {['mindChanging', 'originality', 'clarity'].map(key => (
            <div key={key} className="slider-group">
              <label><span>{key === 'mindChanging' ? '🧠 Mind-changing' : key === 'originality' ? '💡 Originality' : '🔍 Clarity'}</span><span>{ratings[key]}</span></label>
              <input type="range" min="1" max="10" value={ratings[key]} onChange={e => setRatings(prev => ({ ...prev, [key]: parseInt(e.target.value) }))} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{submitted ? 'Update' : 'Submit'} Rating</button>
        </div>
      )}
    </div>
  );
};
export default ConsensusMeter;
