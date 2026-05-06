import { HiMagnifyingGlass } from 'react-icons/hi2';
const SearchBar = ({ value, onChange, placeholder = 'Search posts...' }) => (
  <div className="search-bar">
    <HiMagnifyingGlass className="search-icon" />
    <input className="form-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);
export default SearchBar;
