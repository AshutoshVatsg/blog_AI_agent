const TagFilter = ({ tags, activeTag, onTagChange }) => (
  <div className="tag-filter">
    <button className={`tag-filter-btn ${!activeTag ? 'active' : ''}`} onClick={() => onTagChange('')}>All</button>
    {tags.map((tag) => (
      <button key={tag} className={`tag-filter-btn ${activeTag === tag ? 'active' : ''}`} onClick={() => onTagChange(tag)}>{tag}</button>
    ))}
  </div>
);
export default TagFilter;
