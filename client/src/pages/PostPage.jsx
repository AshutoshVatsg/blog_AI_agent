import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';
import useReadingProgress from '../hooks/useReadingProgress';
import ParagraphRenderer from '../components/posts/ParagraphRenderer';
import ConsensusMeter from '../components/consensus/ConsensusMeter';
import CommentSection from '../components/comments/CommentSection';
import ClaimSidebar from '../components/claims/ClaimSidebar';
import CredibilityBadge from '../components/claims/CredibilityBadge';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const PostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [reactions, setReactions] = useState({});
  const [heatmap, setHeatmap] = useState({});
  const [loading, setLoading] = useState(true);

  const totalParas = post?.paragraphs?.length || 0;
  const { percentComplete, saveProgress } = useReadingProgress(id, totalParas);

  const loadData = useCallback(async () => {
    try {
      const [postRes, commentsRes, claimsRes, reactionsRes, heatmapRes] = await Promise.all([
        API.get(`/posts/${id}`),
        API.get(`/posts/${id}/comments`),
        API.get(`/posts/${id}/claims`),
        API.get(`/posts/${id}/reactions`),
        API.get(`/posts/${id}/reactions/heatmap`),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
      setClaims(claimsRes.data);
      setReactions(reactionsRes.data);
      const hm = {};
      heatmapRes.data.forEach(h => { hm[h._id] = h.totalReactions; });
      setHeatmap(hm);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Track scroll for reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!post) return;
      const paras = document.querySelectorAll('.paragraph-block');
      let visible = 0;
      paras.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.7) visible = i;
      });
      saveProgress(visible);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post, saveProgress]);

  // Handle text selection for claim flagging
  const handleTextSelect = async () => {
    if (!user) return;
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length < 10) return;
    const anchorNode = selection.anchorNode;
    const paraBlock = anchorNode?.parentElement?.closest('.paragraph-block');
    if (!paraBlock) return;
    const pIndex = parseInt(paraBlock.dataset.index);
    if (isNaN(pIndex)) return;
    const confirmed = window.confirm(`Flag as claim?\n"${text.substring(0, 100)}..."`);
    if (!confirmed) return;
    try {
      await API.post(`/posts/${id}/claims`, { paragraphIndex: pIndex, claimText: text, startOffset: selection.anchorOffset, endOffset: selection.focusOffset });
      toast.success('Claim flagged!');
      loadData();
    } catch (err) { toast.error('Failed to flag claim'); }
  };

  if (loading) return <Loader />;
  if (!post) return <div className="page container"><div className="empty-state"><div className="emoji">404</div><p>Post not found</p></div></div>;

  const authorName = post.isAnonymous ? 'Anonymous' : (post.authorId?.name || 'Unknown');
  const date = new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <div className="reading-bar" style={{ width: `${percentComplete}%` }} />
      <div className="container post-view">
        <div className="post-header">
          {post.coverImage && <img src={post.coverImage} alt={post.title} className="post-cover" />}
          <h1 className="post-title-view">{post.title}</h1>
          <div className="post-meta">
            <span style={{ fontWeight: 700 }}>{authorName}</span>
            <span>·</span><span>{date}</span>
            <span>·</span><span>👁️ {post.views} views</span>
            <CredibilityBadge badge={post.credibilityBadge} />
          </div>
          <div className="post-card-tags" style={{ marginTop: '0.75rem' }}>
            {post.tags?.map((t, i) => <span key={t} className={`tag tag-${['purple','yellow','pink','blue','green'][i % 5]}`}>{t}</span>)}
          </div>
        </div>

        <div className="post-layout">
          <div>
            <div className="post-content" onMouseUp={handleTextSelect}>
              {post.paragraphs?.map((para) => (
                <div key={para.index} data-index={para.index}>
                  <ParagraphRenderer paragraph={para} postId={id} reactions={reactions[para.index] || []} heatLevel={Math.min(Math.ceil((heatmap[para.index] || 0) / 3), 5)} />
                </div>
              ))}
            </div>
            <ConsensusMeter postId={id} />
            <CommentSection postId={id} comments={comments} onRefresh={loadData} />
          </div>
          <ClaimSidebar postId={id} claims={claims} onRefresh={loadData} />
        </div>
      </div>
    </div>
  );
};
export default PostPage;
