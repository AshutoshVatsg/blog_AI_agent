import PostCard from './PostCard';

const PostList = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <div className="empty-state"><div className="emoji">📭</div><p>No posts found</p></div>;
  }
  return (
    <div className="grid-3 stagger">
      {posts.map((post) => <PostCard key={post._id} post={post} />)}
    </div>
  );
};
export default PostList;
