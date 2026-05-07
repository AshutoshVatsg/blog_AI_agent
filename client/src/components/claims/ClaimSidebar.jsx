import { useState } from 'react';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const ClaimSidebar = ({ postId, claims = [], onRefresh, authorId, isAdmin }) => {
  const { user } = useAuth();
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseUrl, setResponseUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reasonFor, setReasonFor] = useState(null);
  const [voteReason, setVoteReason] = useState('');

  const isAuthor = user && authorId && user._id === authorId;

  const handleVote = async (claimId, verdict) => {
    if (!user) return toast.error('Login to vote');
    const reason = reasonFor === claimId ? voteReason : '';
    try {
      await API.post(`/posts/${postId}/claims/${claimId}/vote`, { verdict, reason });
      toast.success('Vote recorded!');
      setReasonFor(null);
      setVoteReason('');
      onRefresh?.();
    } catch (err) { toast.error('Vote failed'); }
  };

  const handleRespond = async (claimId) => {
    if (!responseText.trim()) return toast.error('Response text is required');
    setSubmitting(true);
    try {
      await API.put(`/posts/${postId}/claims/${claimId}/respond`, { text: responseText, sourceUrl: responseUrl });
      toast.success('Response submitted!');
      setRespondingTo(null);
      setResponseText('');
      setResponseUrl('');
      onRefresh?.();
    } catch (err) { toast.error('Failed to submit response'); }
    setSubmitting(false);
  };

  const handleDismiss = async (claimId) => {
    if (!window.confirm('Dismiss this claim? This cannot be undone.')) return;
    try {
      await API.delete(`/posts/${postId}/claims/${claimId}`);
      toast.success('Claim dismissed');
      onRefresh?.();
    } catch (err) { toast.error('Failed to dismiss claim'); }
  };

  const getVoteCounts = (claim) => {
    const v = claim.votes || [];
    return {
      verified: v.filter(x => x.verdict === 'verified').length,
      misleading: v.filter(x => x.verdict === 'misleading').length,
      needs_source: v.filter(x => x.verdict === 'needs_source').length,
    };
  };

  const getUserVote = (claim) => {
    if (!user) return null;
    return claim.votes?.find(v => (v.userId?._id || v.userId) === user._id)?.verdict;
  };

  if (claims.length === 0) {
    return (
      <div className="claims-sidebar">
        <div className="card card-flat" style={{ background: 'var(--bg-alt)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No claims flagged yet.<br/>Select text in the post to flag a claim.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="claims-sidebar">
      <h3 style={{ marginBottom: '1rem' }}>📋 Claims ({claims.length})</h3>
      {claims.map(claim => {
        const counts = getVoteCounts(claim);
        const myVote = getUserVote(claim);
        const isResponding = respondingTo === claim._id;
        const showReason = reasonFor === claim._id;

        return (
          <div key={claim._id} className="claim-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div className="claim-text">"{claim.claimText}"</div>
              {isAdmin && (
                <button
                  onClick={() => handleDismiss(claim._id)}
                  title="Dismiss claim"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem', flexShrink: 0, padding: 0 }}
                >✕</button>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Flagged by {claim.flaggedBy?.name || 'user'} · {timeAgo(claim.createdAt)}
            </div>

            <div className="claim-votes">
              <button className={`claim-vote-btn ${myVote === 'verified' ? 'active' : ''}`} onClick={() => handleVote(claim._id, 'verified')}>✅ {counts.verified}</button>
              <button className={`claim-vote-btn ${myVote === 'misleading' ? 'active' : ''}`} onClick={() => handleVote(claim._id, 'misleading')}>⚠️ {counts.misleading}</button>
              <button className={`claim-vote-btn ${myVote === 'needs_source' ? 'active' : ''}`} onClick={() => handleVote(claim._id, 'needs_source')}>❔ {counts.needs_source}</button>
              {user && (
                <button
                  onClick={() => { setReasonFor(showReason ? null : claim._id); setVoteReason(''); }}
                  style={{ fontSize: '0.72rem', background: 'none', border: '1px dashed var(--border)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >+ reason</button>
              )}
            </div>

            {showReason && (
              <div style={{ marginTop: '0.4rem' }}>
                <textarea
                  value={voteReason}
                  onChange={e => setVoteReason(e.target.value)}
                  placeholder="Add a reason for your vote..."
                  rows={2}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Then click a verdict above to vote with this reason.</p>
              </div>
            )}

            {claim.authorResponse?.text && !isResponding && (
              <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: '#dcfce7', borderRadius: '6px', fontSize: '0.82rem', border: '1.5px solid var(--border)' }}>
                <strong>Author:</strong> {claim.authorResponse.text}
                {claim.authorResponse.sourceUrl && (
                  <a href={claim.authorResponse.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem' }}>🔗 Source</a>
                )}
              </div>
            )}

            {isAuthor && !isResponding && (
              <button
                onClick={() => { setRespondingTo(claim._id); setResponseText(claim.authorResponse?.text || ''); setResponseUrl(claim.authorResponse?.sourceUrl || ''); }}
                style={{ marginTop: '0.5rem', fontSize: '0.78rem', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
              >
                {claim.authorResponse?.text ? '✏️ Edit response' : '💬 Respond'}
              </button>
            )}

            {isResponding && (
              <div style={{ marginTop: '0.6rem', padding: '0.6rem', background: 'var(--bg-alt)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Your response to this claim..."
                  rows={3}
                  style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', resize: 'vertical', boxSizing: 'border-box', marginBottom: '0.4rem' }}
                />
                <input
                  type="url"
                  value={responseUrl}
                  onChange={e => setResponseUrl(e.target.value)}
                  placeholder="Source URL (optional)"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '0.3rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)', boxSizing: 'border-box', marginBottom: '0.4rem' }}
                />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleRespond(claim._id)}
                    disabled={submitting}
                    style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '4px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}
                  >{submitting ? 'Submitting...' : 'Submit'}</button>
                  <button
                    onClick={() => { setRespondingTo(null); setResponseText(''); setResponseUrl(''); }}
                    style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}
                  >Cancel</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default ClaimSidebar;
