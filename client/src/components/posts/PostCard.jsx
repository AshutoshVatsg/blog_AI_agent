import { useNavigate } from 'react-router-dom';
import { HiOutlineEye } from 'react-icons/hi2';

const COLORS = ['cover-purple', 'cover-yellow', 'cover-pink', 'cover-blue', 'cover-green', 'cover-orange'];
const TAG_COLORS = ['tag-purple', 'tag-yellow', 'tag-pink', 'tag-blue', 'tag-green'];
const EMOJIS = ['📝', '💡', '🚀', '🎯', '⚡', '🔥', '✨', '🎨'];

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const colorIndex = post.title.length % COLORS.length;
  const emoji = EMOJIS[post.title.length % EMOJIS.length];
  const badgeClass = post.credibilityBadge === 'verified' ? 'badge-verified' : post.credibilityBadge === 'disputed' ? 'badge-disputed' : 'badge-unverified';
  const badgeIcon = post.credibilityBadge === 'verified' ? '✅' : post.credibilityBadge === 'disputed' ? '⚠️' : '❔';
  const authorName = post.isAnonymous ? 'Anonymous' : (post.authorId?.name || 'Unknown');
  const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="post-card animate-in" onClick={() => navigate(`/post/${post._id}`)}>
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} className="post-card-cover" />
      ) : (
        <div className={`post-card-cover-placeholder ${COLORS[colorIndex]}`}>{emoji}</div>
      )}
      <div className="post-card-body">
        <div className="post-card-tags">
          {post.tags?.slice(0, 3).map((tag, i) => (
            <span key={tag} className={`tag ${TAG_COLORS[i % TAG_COLORS.length]}`}>{tag}</span>
          ))}
        </div>
        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-summary">{post.summary || post.paragraphs?.[0]?.content?.substring(0, 120)}</p>
        <div className="post-card-footer">
          <div className="post-card-meta">
            <span style={{ fontWeight: 600 }}>{authorName}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge ${badgeClass}`}>{badgeIcon}</span>
            <span className="post-card-meta"><HiOutlineEye /> {post.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PostCard;
