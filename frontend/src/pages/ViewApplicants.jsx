import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ViewApplicants = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, appRes] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/projects/${id}/applications`)
        ]);
        setProject(projRes.data);
        setApplications(appRes.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You are not authorized to view these applications.');
        } else {
          setError('Failed to load applications.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
    else navigate('/login');
  }, [id, user]);

  if (loading) return <div style={styles.center}>Loading applicants...</div>;
  if (error)   return <div style={{...styles.center, color:'#dc2626'}}>{error}</div>;

  return (
    <div style={styles.container}>
      <Link to={`/projects/${id}`} style={styles.back}>← Back to Project</Link>

      <div style={styles.header}>
        <h1 style={styles.title}>Applicants for "{project?.name}"</h1>
        <p style={styles.subtitle}>{applications.length} application{applications.length !== 1 ? 's' : ''} received</p>
      </div>

      {applications.length === 0 ? (
        <div style={styles.empty}>
          <p style={{fontSize:'48px'}}>📭</p>
          <p style={{fontSize:'18px', fontWeight:'600'}}>No applications yet</p>
          <p style={{color:'#6b7280'}}>Share your project to attract collaborators!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {applications.map(app => (
            <div key={app.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.name}>{app.applicant_name}</h3>
                  <p style={styles.email}>{app.applicant_email}</p>
                </div>
                <span style={styles.date}>
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>

              <p style={styles.message}>{app.message}</p>

              <a
                href={app.github_url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.github}
              >
                🔗 {app.github_url}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '32px 24px' },
  center: { textAlign: 'center', padding: '60px', color: '#6b7280' },
  back: { color: '#4f46e5', fontSize: '14px', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: '800', marginBottom: '4px' },
  subtitle: { color: '#6b7280', fontSize: '15px' },
  empty: { textAlign: 'center', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  name: { fontSize: '16px', fontWeight: '700', marginBottom: '2px' },
  email: { color: '#6b7280', fontSize: '13px' },
  date: { color: '#9ca3af', fontSize: '13px' },
  message: { color: '#374151', lineHeight: '1.6', marginBottom: '16px', fontSize: '14px' },
  github: { color: '#4f46e5', fontSize: '13px', wordBreak: 'break-all' }
};

export default ViewApplicants;
