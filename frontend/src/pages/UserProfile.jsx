import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const UserProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/users/${id}`);
        setData(res.data);
      } catch (err) {
        setError('User not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div style={styles.center}>Loading profile...</div>;
  if (error)   return <div style={{...styles.center, color:'#dc2626'}}>{error}</div>;

  const { user, projects } = data;

  return (
    <div style={styles.container}>
      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={styles.name}>{user.name}</h1>
          <p style={styles.email}>{user.email}</p>
          <p style={styles.joined}>
            Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>
        Projects ({projects.length})
      </h2>

      {projects.length === 0 ? (
        <div style={styles.empty}>
          <p>This user hasn't posted any projects yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map(project => (
            <Link to={`/projects/${project.id}`} key={project.id} style={styles.card}>
              <div style={styles.cardTop}>
                <h3 style={styles.cardTitle}>{project.name}</h3>
                <span style={{
                  ...styles.badge,
                  background: project.is_open ? '#f0fdf4' : '#f3f4f6',
                  color: project.is_open ? '#16a34a' : '#6b7280'
                }}>
                  {project.is_open ? 'Open' : 'Closed'}
                </span>
              </div>
              <p style={styles.cardDesc}>
                {project.description.length > 100
                  ? project.description.slice(0, 100) + '...'
                  : project.description}
              </p>
              <div style={styles.tags}>
                {(project.stack_tags || []).slice(0, 3).map(tag => (
                  <span key={tag} style={styles.tag}>{tag}</span>
                ))}
              </div>
              <p style={styles.appCount}>
                👥 {project.application_count} applicant{project.application_count != 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '32px 24px' },
  center: { textAlign: 'center', padding: '60px', color: '#6b7280' },
  profileCard: {
    background: '#fff', borderRadius: '16px', padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px'
  },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: '#4f46e5', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '700', flexShrink: 0
  },
  name: { fontSize: '24px', fontWeight: '800', marginBottom: '4px' },
  email: { color: '#6b7280', fontSize: '14px', marginBottom: '4px' },
  joined: { color: '#9ca3af', fontSize: '13px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px' },
  empty: { textAlign: 'center', padding: '40px', color: '#6b7280', background: '#fff', borderRadius: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: {
    background: '#fff', borderRadius: '16px', padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    textDecoration: 'none', color: 'inherit', display: 'block'
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', flex: 1, marginRight: '8px' },
  badge: { fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '600', whiteSpace: 'nowrap' },
  cardDesc: { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' },
  tag: { background: '#ede9fe', color: '#6d28d9', fontSize: '11px', padding: '3px 8px', borderRadius: '20px' },
  appCount: { fontSize: '12px', color: '#9ca3af' }
};

export default UserProfile;