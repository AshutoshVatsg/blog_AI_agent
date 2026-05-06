import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', summary: '', tags: '', coverImage: '', isAnonymous: false, status: 'published' });
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get(`/posts/${id}`);
        setForm({ title: data.title, summary: data.summary || '', tags: data.tags?.join(', ') || '', coverImage: data.coverImage || '', isAnonymous: data.isAnonymous, status: data.status });
        setParagraphs(data.paragraphs || []);
      } catch (err) { toast.error('Post not found'); navigate('/'); }
      setLoading(false);
    };
    load();
  }, [id]);

  const addParagraph = (type = 'text') => setParagraphs(prev => [...prev, { content: '', type, index: prev.length }]);
  const updateParagraph = (i, val) => setParagraphs(prev => prev.map((p, idx) => idx === i ? { ...p, content: val } : p));
  const removeParagraph = (i) => setParagraphs(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/posts/${id}`, {
        title: form.title, summary: form.summary, coverImage: form.coverImage,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        isAnonymous: form.isAnonymous, status: form.status,
        paragraphs: paragraphs.filter(p => p.content.trim()).map((p, i) => ({ index: i, content: p.content, type: p.type })),
      });
      toast.success('Post updated!');
      navigate(`/post/${id}`);
    } catch (err) { toast.error('Failed to update'); }
    setSaving(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="page container">
      <div className="editor-page">
        <h1 className="page-title">✏️ Edit Post</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
          <div className="form-group"><label className="form-label">Summary</label><input className="form-input" value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Tags</label><input className="form-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Cover Image URL</label><input className="form-input" value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Paragraphs</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['text', 'heading', 'code', 'quote'].map(t => <button key={t} type="button" className="btn btn-white btn-sm" onClick={() => addParagraph(t)}>+ {t}</button>)}
              </div>
            </div>
            {paragraphs.map((para, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'start' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.35rem 0.5rem', background: 'var(--bg-alt)', borderRadius: '6px', border: '1.5px solid var(--border)', fontWeight: 700, minWidth: '50px', textAlign: 'center' }}>{para.type}</span>
                <textarea className="form-textarea" style={{ minHeight: '70px' }} value={para.content} onChange={e => updateParagraph(i, e.target.value)} />
                {paragraphs.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => removeParagraph(i)}>✕</button>}
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};
export default EditPostPage;
