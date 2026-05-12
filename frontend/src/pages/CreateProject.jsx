import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CreateProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', description: '', commitment: 'Casual',
    stack_tags: '', roles_needed: ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('commitment', form.commitment);
      formData.append('stack_tags', JSON.stringify(
        form.stack_tags.split(',').map(t => t.trim()).filter(Boolean)
      ));
      formData.append('roles_needed', JSON.stringify(
        form.roles_needed.split(',').map(r => r.trim()).filter(Boolean)
      ));
      if (screenshot) formData.append('screenshot', screenshot);

      const res = await api.post('/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Post a Project</h1>
        <p style={styles.subtitle}>Find collaborators for your side project</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Project Name *</label>
            <input
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. DevHire — Job Board for Developers"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Describe your project, what it does, and what stage it's at..."
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
              placeholder="React, Node.js, PostgreSQL (comma separated)"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Roles Needed</label>
            <input
              value={form.roles_needed}
              onChange={e => setForm({...form, roles_needed: e.target.value})}
              placeholder="Frontend Developer, UI Designer (comma separated)"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Commitment Level *</label>
            <select
              value={form.commitment}
              onChange={e => setForm({...form, commitment: e.target.value})}
              style={styles.select}
            >
              <option value="Casual">Casual — a few hours a week</option>
              <option value="Part-time">Part-time — 10-20 hours a week</option>
              <option value="Serious">Serious — near full-time commitment</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Project Screenshot (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setScreenshot(e.target.files[0])}
              style={styles.fileInput}
            />
            <p style={styles.hint}>Upload a screenshot or mockup of your project</p>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Posting...' : 'Post Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '680px', margin: '0 auto', padding: '32px 24px' },
  card: { background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  title: { fontSize: '24px', fontWeight: '800', marginBottom: '8px' },
  subtitle: { color: '#6b7280', marginBottom: '32px', fontSize: '14px' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: '#fff' },
  fileInput: { display: 'block', marginBottom: '4px' },
  hint: { fontSize: '12px', color: '#9ca3af' },
  btn: { width: '100%', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }
};

export default CreateProject;
