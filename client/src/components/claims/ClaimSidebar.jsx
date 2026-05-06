import { useState, useEffect } from 'react';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ClaimSidebar = ({ postId, claims = [], onRefresh }) => {
  const { user } = useAuth();

  const handleVote = async (claimId, verdict) => {
    if (!user) return toast.error('Login to vote');
    try {
      await API.post(`/posts/${postId}/claims/${claimId}/vote`, { verdict });
      toast.success('Vote recorded!');
      onRefresh?.();
    } catch (err) { toast.error('Vote failed'); }
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
        return (
          <div key={claim._id} className="claim-card">
            <div className="claim-text">"{claim.claimText}"</div>
            <div className="claim-votes">
              <button className={`claim-vote-btn ${myVote === 'verified' ? 'active' : ''}`} onClick={() => handleVote(claim._id, 'verified')}>✅ {counts.verified}</button>
              <button className={`claim-vote-btn ${myVote === 'misleading' ? 'active' : ''}`} onClick={() => handleVote(claim._id, 'misleading')}>⚠️ {counts.misleading}</button>
              <button className={`claim-vote-btn ${myVote === 'needs_source' ? 'active' : ''}`} onClick={() => handleVote(claim._id, 'needs_source')}>❔ {counts.needs_source}</button>
            </div>
            {claim.authorResponse?.text && (
              <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: '#dcfce7', borderRadius: '6px', fontSize: '0.82rem', border: '1.5px solid var(--border)' }}>
                <strong>Author:</strong> {claim.authorResponse.text}
                {claim.authorResponse.sourceUrl && <a href={claim.authorResponse.sourceUrl} target="_blank" rel="noopener" style={{ marginLeft: '0.5rem' }}>🔗 Source</a>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default ClaimSidebar;
