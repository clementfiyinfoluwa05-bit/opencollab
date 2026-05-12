import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const EditProject = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', description: '', commitment: 'Casual',
    stack_tags: '', roles_needed: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/api/projects/${id}`);
        const p = res.data;

        if (!user || user.id !== p.user_id) {
          navigate('/');
          return;
        }

        setForm({
          name: p.name,
          description: p.description,
          commitment: p.commitment,
          stack_tags: (p.stack_tags || []).join(', '),
          roles_needed: (p.roles_needed || []).join(', ')
        });
      } catch (err) {
        setError('Failed to load project.');
      } finally {
        setFetching(false);
      }
    };
    if (user) fetchProject();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/api/projects/${id}`, {
        name: form.name,
        description: form.description,
        commitment: form.commitment,
        stack_tags: form.stack_tags.split(',').map(t => t.trim()).filter(Boolean),
        roles_needed: form.roles_needed.split(',').map(r => r.trim()).filter(Boolean)
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Edit Project</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Project Name</label>
            <input
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              style={styles.textarea}
              rows={5}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Tech Stack</label>
            <input
              value={form.stack_tags}
              onChange={e => setForm({...form, stack_tags: e.target.value})}
              placeholder="React, Node.js, PostgreSQL"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Roles Needed</label>
            <input
              value={form.roles_needed}
              onChange={e => setForm({...form, roles_needed: e.target.value})}
              placeholder="Frontend Developer, UI Designer"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Commitment Level</label>
            <select
              value={form.commitment}
              onChange={e => setForm({...form, commitment: e.target.value})}
              style={styles.select}
            >
              <option value="Casual">Casual</option>
              <option value="Part-time">Part-time</option>
              <option value="Serious">Serious</option>
            </select>
          </div>

          <div style={styles.buttons}>
            <button type="submit" style={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/projects/${id}`)} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '680px', margin: '0 auto', padding: '32px 24px' },
  center: { textAlign: 'center', padding: '60px', color: '#6b7280' },
  card: { background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  title: { fontSize: '24px', fontWeight: '800', marginBottom: '32px' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: '#fff' },
  buttons: { display: 'flex', gap: '12px' },
  saveBtn: { flex: 1, padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' }
};

export default EditProject;
