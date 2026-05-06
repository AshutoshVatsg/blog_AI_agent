const CredibilityBadge = ({ badge }) => {
  const map = { verified: { icon: '✅', label: 'Verified', cls: 'badge-verified' }, disputed: { icon: '⚠️', label: 'Disputed', cls: 'badge-disputed' }, unverified: { icon: '❔', label: 'Unverified', cls: 'badge-unverified' } };
  const info = map[badge] || map.unverified;
  return <span className={`badge ${info.cls}`}>{info.icon} {info.label}</span>;
};
export default CredibilityBadge;
