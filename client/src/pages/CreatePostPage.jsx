import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', summary: '', tags: '', coverImage: '', isAnonymous: false, status: 'published' });
  const [paragraphs, setParagraphs] = useState([{ content: '', type: 'text' }]);
  const [loading, setLoading] = useState(false);

  const addParagraph = (type = 'text') => setParagraphs(prev => [...prev, { content: '', type }]);
  const updateParagraph = (i, val) => setParagraphs(prev => prev.map((p, idx) => idx === i ? { ...p, content: val } : p));
  const removeParagraph = (i) => setParagraphs(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!paragraphs.some(p => p.content.trim())) return toast.error('Add at least one paragraph');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        coverImage: form.coverImage,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        isAnonymous: form.isAnonymous,
        status: form.status,
        paragraphs: paragraphs.filter(p => p.content.trim()).map((p, i) => ({ index: i, content: p.content, type: p.type })),
      };
      const { data } = await API.post('/posts', payload);
      toast.success('Post published! 🎉');
      navigate(`/post/${data._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create post'); }
    setLoading(false);
  };

  return (
    <div className="page container">
      <div className="editor-page">
        <h1 className="page-title">✍️ Create New Post</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="An eye-catching title..." required /></div>
          <div className="form-group"><label className="form-label">Summary</label><input className="form-input" value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} placeholder="Brief description for preview cards" /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Tags (comma-separated)</label><input className="form-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="tech, javascript, opinion" /></div>
            <div className="form-group"><label className="form-label">Cover Image URL</label><input className="form-input" value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))} placeholder="https://..." /></div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Paragraphs</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button type="button" className="btn btn-white btn-sm" onClick={() => addParagraph('text')}>+ Text</button>
                <button type="button" className="btn btn-white btn-sm" onClick={() => addParagraph('heading')}>+ Heading</button>
                <button type="button" className="btn btn-white btn-sm" onClick={() => addParagraph('code')}>+ Code</button>
                <button type="button" className="btn btn-white btn-sm" onClick={() => addParagraph('quote')}>+ Quote</button>
              </div>
            </div>
            {paragraphs.map((para, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'start' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.35rem 0.5rem', background: 'var(--bg-alt)', borderRadius: '6px', border: '1.5px solid var(--border)', fontWeight: 700, minWidth: '50px', textAlign: 'center' }}>{para.type}</span>
                <textarea className="form-textarea" style={{ minHeight: para.type === 'heading' ? '50px' : '80px' }} value={para.content} onChange={e => updateParagraph(i, e.target.value)} placeholder={`${para.type === 'heading' ? 'Section heading...' : para.type === 'code' ? 'Code block...' : para.type === 'quote' ? 'Quote...' : 'Write your paragraph...'}`} />
                {paragraphs.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => removeParagraph(i)}>✕</button>}
              </div>
            ))}
          </div>

          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(p => ({ ...p, isAnonymous: e.target.checked }))} /> Post anonymously
            </label>
            <select className="form-select" style={{ width: 'auto' }} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="published">Publish Now</option>
              <option value="draft">Save as Draft</option>
            </select>
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>{loading ? 'Publishing...' : '🚀 Publish Post'}</button>
        </form>
      </div>
    </div>
  );
};
export default CreatePostPage;
