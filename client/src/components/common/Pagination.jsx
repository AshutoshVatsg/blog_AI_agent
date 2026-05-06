const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</button>
      {Array.from({ length: pages }, (_, i) => (
        <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => onPageChange(i + 1)}>{i + 1}</button>
      ))}
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>›</button>
    </div>
  );
};
export default Pagination;
