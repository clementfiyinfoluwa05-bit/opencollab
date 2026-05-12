import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SingleProject = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyForm, setApplyForm] = useState({ message: '', github_url: '' });
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/api/projects/${id}`);
        const p = res.data;
        // Ensure these are always arrays
        p.stack_tags = Array.isArray(p.stack_tags) ? p.stack_tags : [];
        p.roles_needed = Array.isArray(p.roles_needed) ? p.roles_needed : [];
        setProject(p);
      } catch (err) {
        setError('Project not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      navigate('/');
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  const handleToggle = async () => {
    try {
      const res = await api.patch(`/api/projects/${id}/toggle-open`);
      setProject({ ...project, is_open: res.data.is_open });
    } catch (err) {
      alert('Failed to toggle status.');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');
    setApplyLoading(true);
    try {
      await api.post(`/api/projects/${id}/apply`, applyForm);
      setApplySuccess('Application submitted successfully!');
      setApplyForm({ message: '', github_url: '' });
      const res = await api.get(`/api/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  const commitmentColor = {
    'Casual':    { bg: '#f0fdf4', color: '#16a34a' },
    'Part-time': { bg: '#fffbeb', color: '#d97706' },
    'Serious':   { bg: '#fef2f2', color: '#dc2626' }
  };

  const isOwner = user && project && user.id === project.user_id;

  if (loading) return <div style={styles.center}>Loading project...</div>;
  if (error)   return <div style={{...styles.center, color:'#dc2626'}}>{error}</div>;

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.back}>← Back to Feed</Link>

      <div style={styles.layout}>
        <div style={styles.main}>
          {project.screenshot_url && (
            <img src={project.screenshot_url} alt={project.name} style={styles.screenshot} />
          )}

          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>{project.name}</h1>
              <p style={styles.author}>Posted by {project.author_name}</p>
            </div>
            <div style={styles.badges}>
              <span style={{
                ...styles.badge,
                background: project.is_open ? '#f0fdf4' : '#f3f4f6',
                color: project.is_open ? '#16a34a' : '#6b7280'
              }}>
                {project.is_open ? '🟢 Open' : '🔴 Closed'}
              </span>
              <span style={{
                ...styles.badge,
                background: commitmentColor[project.commitment]?.bg,
                color: commitmentColor[project.commitment]?.color
              }}>
                {project.commitment}
              </span>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>About this project</h2>
            <p style={styles.description}>{project.description}</p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Tech Stack</h2>
            <div style={styles.tags}>
              {(project.stack_tags || []).map(tag => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Roles Needed</h2>
            <div style={styles.tags}>
              {(project.roles_needed || []).map(role => (
                <span key={role} style={styles.roleTag}>{role}</span>
              ))}
            </div>
          </div>

          <div style={styles.stats}>
            <span>👥 {project.application_count} application{project.application_count != 1 ? 's' : ''}</span>
            <span>📅 Posted {new Date(project.created_at).toLocaleDateString()}</span>
          </div>

          {isOwner && (
            <div style={styles.ownerActions}>
              <h3 style={styles.sectionTitle}>Manage Your Project</h3>
              <div style={styles.actionButtons}>
                <Link to={`/projects/${id}/edit`} style={styles.editBtn}>Edit</Link>
                <button onClick={handleToggle} style={styles.toggleBtn}>
                  {project.is_open ? 'Mark as Closed' : 'Reopen Project'}
                </button>
                <Link to={`/projects/${id}/applications`} style={styles.viewAppsBtn}>
                  View Applicants ({project.application_count})
                </Link>
                <button onClick={handleDelete} style={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.sidebar}>
          <div style={styles.applyCard}>
            <h2 style={styles.applyTitle}>Apply to Collaborate</h2>

            {!user && (
              <div>
                <p style={styles.applyNote}>You need to be logged in to apply.</p>
                <Link to="/login" style={styles.applyBtn}>Log in to Apply</Link>
              </div>
            )}

            {isOwner && (
              <p style={styles.applyNote}>You cannot apply to your own project.</p>
            )}

            {user && !isOwner && !project.is_open && (
              <p style={{...styles.applyNote, color:'#dc2626'}}>
                This project is no longer accepting applications.
              </p>
            )}

            {user && !isOwner && project.is_open && (
              <form onSubmit={handleApply}>
                {applyError   && <div style={styles.applyError}>{applyError}</div>}
                {applySuccess && <div style={styles.applySuccess}>{applySuccess}</div>}

                <div style={styles.field}>
                  <label style={styles.label}>Your Message</label>
                  <textarea
                    value={applyForm.message}
                    onChange={e => setApplyForm({...applyForm, message: e.target.value})}
                    placeholder="Tell them about yourself and why you want to join..."
                    style={styles.textarea}
                    rows={5}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Your GitHub URL</label>
                  <input
                    value={applyForm.github_url}
                    onChange={e => setApplyForm({...applyForm, github_url: e.target.value})}
                    placeholder="https://github.com/yourusername"
                    style={styles.input}
                    required
                  />
                </div>

                <button type="submit" style={styles.applyBtn} disabled={applyLoading}>
                  {applyLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  center: { textAlign: 'center', padding: '60px', color: '#6b7280' },
  back: { color: '#4f46e5', fontSize: '14px', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' },
  main: { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  screenshot: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '300px', objectFit: 'cover' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '800', marginBottom: '4px' },
  author: { color: '#6b7280', fontSize: '14px' },
  badges: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#111827' },
  description: { color: '#374151', lineHeight: '1.7', fontSize: '15px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' },
  roleTag: { background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' },
  stats: { display: 'flex', gap: '24px', color: '#6b7280', fontSize: '14px', padding: '16px 0', borderTop: '1px solid #f3f4f6', marginBottom: '24px' },
  ownerActions: { borderTop: '1px solid #f3f4f6', paddingTop: '24px' },
  actionButtons: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  editBtn: { padding: '8px 16px', background: '#4f46e5', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' },
  toggleBtn: { padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  viewAppsBtn: { padding: '8px 16px', background: '#10b981', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' },
  deleteBtn: { padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  sidebar: {},
  applyCard: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: '90px' },
  applyTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '16px' },
  applyNote: { color: '#6b7280', fontSize: '14px', marginBottom: '16px' },
  applyError: { background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' },
  applySuccess: { background: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' },
  textarea: { width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' },
  input: { width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  applyBtn: { display: 'block', width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }
};

export default SingleProject;
