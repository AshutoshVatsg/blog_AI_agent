import { useState } from 'react';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const CommentSection = ({ postId, comments = [], onRefresh }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await API.post(`/posts/${postId}/comments`, { content });
      setContent('');
      toast.success('Comment added!');
      onRefresh?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add comment'); }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      await API.post(`/posts/${postId}/comments`, { content: replyContent, parentCommentId: parentId });
      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply added!');
      onRefresh?.();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (commentId) => {
    try {
      await API.delete(`/posts/${postId}/comments/${commentId}`);
      toast.success('Deleted');
      onRefresh?.();
    } catch (err) { toast.error('Failed'); }
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment._id} className={`comment-item ${isReply ? 'reply' : ''}`}>
      <div className="flex-between">
        <div>
          <span className="comment-author">{comment.userId?.name || 'User'}</span>
          <span className="comment-date" style={{ marginLeft: '0.5rem' }}>
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        {user && (user._id === comment.userId?._id || user.role === 'admin') && (
          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(comment._id)}>🗑️</button>
        )}
      </div>
      <p className="comment-body">{comment.content}</p>
      {user && !isReply && (
        <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.4rem' }} onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}>
          💬 Reply
        </button>
      )}
      {replyTo === comment._id && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <input className="form-input" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a reply..." />
          <button className="btn btn-primary btn-sm" onClick={() => handleReply(comment._id)}>Send</button>
        </div>
      )}
      {comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  );

  return (
    <div className="comment-section">
      <h3 style={{ marginBottom: '1rem' }}>💬 Comments ({comments.length})</h3>
      {user && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <textarea className="form-textarea" style={{ minHeight: '60px' }} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your thoughts..." />
          <button className="btn btn-primary" type="submit">Post</button>
        </form>
      )}
      {comments.length === 0 ? (
        <div className="empty-state"><div className="emoji">💭</div><p>No comments yet. Be the first!</p></div>
      ) : comments.map(c => renderComment(c))}
    </div>
  );
};
export default CommentSection;
