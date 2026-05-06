const InsightsCard = ({ insights, analytics, onRefresh, loading }) => {
  if (!insights && !analytics) {
    return (
      <div className="insights-card">
        <h3 style={{ marginBottom: '0.75rem' }}>🧠 AI Writing Insights</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Publish more posts to unlock personalized writing insights.</p>
        <button className="btn btn-primary" onClick={onRefresh} disabled={loading}>{loading ? 'Generating...' : '🔄 Generate Insights'}</button>
      </div>
    );
  }

  return (
    <div className="insights-card">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h3>🧠 AI Writing Insights</h3>
        <button className="btn btn-white btn-sm" onClick={onRefresh} disabled={loading}>{loading ? '...' : '🔄 Refresh'}</button>
      </div>
      {analytics && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Based on your {analytics.totalPosts} posts · {analytics.totalViews} total views
        </p>
      )}
      {insights?.map((insight, i) => (
        <div key={i} className="insight-item">
          <div className="insight-icon">
            {insight.type === 'tone' ? '🎨' : insight.type === 'topic' ? '📌' : insight.type === 'engagement' ? '🔥' : insight.type === 'length' ? '📏' : '📅'}
          </div>
          <div className="insight-body">
            <h4>{insight.observation}</h4>
            <p>{insight.suggestion}</p>
            <span className={`confidence-badge confidence-${insight.confidence}`}>{insight.confidence}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default InsightsCard;
