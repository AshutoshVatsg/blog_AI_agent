import { useState, useEffect } from 'react';
import API from '../api/axios';
import PostList from '../components/posts/PostList';
import TagFilter from '../components/posts/TagFilter';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';

const TAGS = ['tech', 'javascript', 'opinion', 'lifestyle', 'personal', 'science'];

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        if (search) {
          const { data } = await API.get(`/posts/search?q=${search}${tag ? `&tag=${tag}` : ''}`);
          setPosts(data);
          setPages(1);
        } else {
          const { data } = await API.get(`/posts?page=${page}&limit=9${tag ? `&tag=${tag}` : ''}`);
          setPosts(data.posts);
          setPages(data.pages);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchPosts();
  }, [page, tag, search]);

  useEffect(() => {
    API.get('/posts/trending').then(({ data }) => setTrending(data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <h1>Where Content Gets <span className="highlight">Trusted</span></h1>
          <p>Read, react paragraph-by-paragraph, challenge claims, rate with consensus meters, and get AI-powered writing insights.</p>
        </div>

        {trending.length > 0 && (
          <div className="trending-section">
            <h2 className="section-title"><span className="icon-box" style={{ background: 'var(--accent-orange)' }}>🔥</span> Trending Posts</h2>
            <PostList posts={trending.slice(0, 3)} />
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title"><span className="icon-box" style={{ background: 'var(--accent-blue)' }}>📝</span> Recent Posts</h2>
          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <SearchBar value={search} onChange={setSearch} />
            <div />
          </div>
          <TagFilter tags={TAGS} activeTag={tag} onTagChange={t => { setTag(t); setPage(1); }} />
        </div>

        {loading ? <Loader /> : <PostList posts={posts} />}
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>
    </div>
  );
};
export default HomePage;
