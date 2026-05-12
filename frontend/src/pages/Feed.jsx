import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Feed = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [commitment, setCommitment] = useState('');
  const [openOnly, setOpenOnly] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.append('q', search);
      if (commitment) params.append('commitment', commitment);
      if (openOnly)   params.append('open', 'true');

      const res = await api.get(`/api/projects?${params.toString()}`);
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on first load
  useEffect(() => { fetchProjects(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const commitmentColor = {
    'Casual':   { bg: '#f0fdf4', color: '#16a34a' },
    'Part-time':{ bg: '#fffbeb', color: '#d97706' },
    'Serious':  { bg: '#fef2f2', color: '#dc2626' }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Find Your Next Collab</h1>
        <p style={styles.subtitle}>Browse projects looking for collaborators</p>
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearch} style={styles.filterBar}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, description, or stack..."
          style={styles.searchInput}
        />
        <select
          value={commitment}
          onChange={e => setCommitment(e.target.value)}
          style={styles.select}
        >
          <option value="">All commitment levels</option>
          <option value="Casual">Casual</option>
          <option value="Part-time">Part-time</option>
          <option value="Serious">Serious</option>
        </select>
        <label style={styles.checkLabel}>
          <input
            type="checkbox"
            checked={openOnly}
            onChange={e => setOpenOnly(e.target.checked)}
          />
          &nbsp;Open only
        </label>
        <button type="submit" style={styles.searchBtn}>Search</button>
      </form>

      {/* States */}
      {loading && <p style={styles.center}>Loading projects...</p>}
      {error   && <p style={{...styles.center, color:'#dc2626'}}>{error}</p>}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div style={styles.empty}>
          <p style={{fontSize:'48px'}}>🔍</p>
          <p style={{fontSize:'18px', fontWeight:'600'}}>No projects found</p>
          <p style={{color:'#6b7280'}}>Try a different search or be the first to post!</p>
          <Link to="/projects/new" style={styles.postBtn}>Post a Project</Link>
        </div>
      )}

      {/* Project Cards */}
      <div style={styles.grid}>
        {projects.map(project => (
          <Link to={`/projects/${project.id}`} key={project.id} style={styles.card}>

            {/* Screenshot if available */}
            {project.screenshot_url && (
              <img
                src={project.screenshot_url}
                alt={project.name}
                style={styles.cardImage}
              />
            )}

            <div style={styles.cardBody}>
              {/* Top row — title + status */}
              <div style={styles.cardTop}>
                <h2 style={styles.cardTitle}>{project.name}</h2>
                <span style={{
                  ...styles.badge,
                  background: project.is_open ? '#f0fdf4' : '#f3f4f6',
                  color: project.is_open ? '#16a34a' : '#6b7280'
                }}>
                  {project.is_open ? 'Open' : 'Closed'}
                </span>
              </div>

              {/* Description preview */}
              <p style={styles.cardDesc}>
                {project.description.length > 120
                  ? project.description.slice(0, 120) + '...'
                  : project.description}
              </p>

              {/* Stack tags */}
              <div style={styles.tags}>
                {(project.stack_tags || []).slice(0, 4).map(tag => (
                  <span key={tag} style={styles.tag}>{tag}</span>
                ))}
              </div>

              {/* Roles needed */}
              {project.roles_needed?.length > 0 && (
                <div style={styles.roles}>
                  <span style={styles.rolesLabel}>Looking for: </span>
                  {project.roles_needed.slice(0, 3).join(', ')}
                </div>
              )}

              {/* Footer — commitment + applicants + author */}
              <div style={styles.cardFooter}>
                <span style={{
                  ...styles.commitment,
                  background: commitmentColor[project.commitment]?.bg,
                  color: commitmentColor[project.commitment]?.color
                }}>
                  {project.commitment}
                </span>
                <span style={styles.meta}>
                  👥 {project.application_count} applicant{project.application_count != 1 ? 's' : ''}
                </span>
                <span style={styles.meta}>by {project.author_name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '36px', fontWeight: '800', marginBottom: '8px' },
  subtitle: { color: '#6b7280', fontSize: '16px' },
  filterBar: {
    display: 'flex', gap: '12px', marginBottom: '32px',
    flexWrap: 'wrap', alignItems: 'center'
  },
  searchInput: {
    flex: 1, minWidth: '200px', padding: '10px 14px',
    border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px'
  },
  select: {
    padding: '10px 14px', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', background: '#fff'
  },
  checkLabel: { fontSize: '14px', display: 'flex', alignItems: 'center' },
  searchBtn: {
    padding: '10px 20px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
  },
  center: { textAlign: 'center', padding: '40px', color: '#6b7280' },
  empty: {
    textAlign: 'center', padding: '60px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
  },
  postBtn: {
    background: '#4f46e5', color: '#fff', padding: '12px 24px',
    borderRadius: '8px', marginTop: '8px', textDecoration: 'none'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  },
  card: {
    background: '#fff', borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    textDecoration: 'none', color: 'inherit',
    overflow: 'hidden', transition: 'transform 0.2s',
    display: 'block'
  },
  cardImage: { width: '100%', height: '180px', objectFit: 'cover' },
  cardBody: { padding: '20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', flex: 1, marginRight: '8px' },
  badge: { fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '600', whiteSpace: 'nowrap' },
  cardDesc: { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
  tag: {
    background: '#ede9fe', color: '#6d28d9',
    fontSize: '11px', padding: '3px 8px', borderRadius: '20px'
  },
  roles: { fontSize: '12px', color: '#374151', marginBottom: '12px' },
  rolesLabel: { fontWeight: '600' },
  cardFooter: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  commitment: { fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '600' },
  meta: { fontSize: '12px', color: '#9ca3af' }
};

export default Feed;
