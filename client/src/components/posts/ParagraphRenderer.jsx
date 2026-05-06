import { useState, useEffect } from 'react';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

const ParagraphRenderer = ({ paragraph, postId, reactions = [], heatLevel = 0 }) => {
  const { user } = useAuth();
  const [localReactions, setLocalReactions] = useState(reactions);
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    setLocalReactions(reactions);
    if (user && reactions.length) {
      const mine = reactions.find(r => r.userId?._id === user._id || r.userId === user._id);
      if (mine) setUserReaction(mine.emoji);
    }
  }, [reactions, user]);

  const handleReaction = async (emoji) => {
    if (!user) return;
    try {
      await API.post(`/posts/${postId}/reactions`, { paragraphIndex: paragraph.index, emoji });
      setUserReaction(emoji);
      setLocalReactions(prev => {
        const filtered = prev.filter(r => (r.userId?._id || r.userId) !== user._id);
        return [...filtered, { userId: { _id: user._id }, emoji }];
      });
    } catch (err) { console.error(err); }
  };

  const typeClass = paragraph.type !== 'text' ? paragraph.type : '';
  const heatClass = `heatmap-${Math.min(heatLevel, 5)}`;

  const emojiCounts = {};
  localReactions.forEach(r => { emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1; });

  return (
    <div className={`paragraph-block ${typeClass} ${heatClass}`}>
      <div dangerouslySetInnerHTML={{ __html: paragraph.content }} />
      <div className="emoji-bar">
        {EMOJIS.map(emoji => (
          <button key={emoji} className={`emoji-btn ${userReaction === emoji ? 'active' : ''}`} onClick={() => handleReaction(emoji)} title={emoji}>
            {emoji}
            {emojiCounts[emoji] > 0 && <span className="emoji-count">{emojiCounts[emoji]}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
export default ParagraphRenderer;
