import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { projectApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FolderKanban } from 'lucide-react';

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await projectApi.create(form);
      onCreated(res.data);
      toast.success('Project created! 🎉');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🆕 New Project</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g. Website Redesign"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="What's this project about?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '✓ Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ project, onClose, onUpdated }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await projectApi.addMember(project.id, { email });
      onUpdated(res.data);
      toast.success('Member added!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">👥 Add Member to "{project.name}"</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Member Email</label>
            <input className="form-input" type="email" placeholder="member@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="flex-between mt-1">
            <div>
              <p className="text-xs text-muted">Current members:</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {project.members?.map(m => (
                  <div key={m.id} className="avatar avatar-sm" style={{ background: m.avatarColor || '#6366f1' }}
                    title={m.name}>{m.name[0]}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : '+ Add Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  ACTIVE:    { color: '#2563eb', bg: '#eff6ff' },
  ON_HOLD:   { color: '#f59e0b', bg: '#fff7ed' },
  COMPLETED: { color: '#2563eb', bg: '#eff6ff' },
  ARCHIVED:  { color: '#64748b', bg: '#f1f5f9' },
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [addMemberProject, setAddMemberProject] = useState(null);

  useEffect(() => {
    projectApi.getAll()
      .then(r => setProjects(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? All tasks will be unlinked.')) return;
    try {
      await projectApi.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete project');
    }
  };

  return (
    <AppLayout title="Projects">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Project
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.5 }} />
          <div className="empty-title">No projects found</div>
          <div className="empty-desc">Get started by creating your first project space</div>
          <button className="btn btn-primary mt-3" onClick={() => setShowCreate(true)}>+ Create Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {projects.map(project => {
            const style = STATUS_STYLES[project.status] || STATUS_STYLES.ACTIVE;
            const progress = project.totalTasks > 0
              ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;

            return (
              <div key={project.id} className="card" style={{ cursor: 'pointer', padding: '1.75rem' }}
                onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="flex-between mb-2">
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{project.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 500 }}>
                      Owned by {project.ownerName}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '0.4rem 0.8rem',
                    borderRadius: '8px', background: style.bg, color: style.color,
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>{project.status}</span>
                </div>

                {project.description && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', height: '1.4rem' }}
                    className="truncate">{project.description}</p>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="flex-between mb-1">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Progress</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {progress}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
                    {project.completedTasks} of {project.totalTasks} tasks complete
                  </div>
                </div>

                <div className="flex-between" style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', marginRight: '1rem' }}>
                      {project.members?.slice(0, 4).map((m, idx) => (
                        <div key={m.id} className="avatar avatar-sm"
                          style={{ 
                            background: m.avatarColor || '#3b82f6', 
                            border: '2px solid #fff', 
                            marginLeft: idx === 0 ? 0 : '-10px',
                            zIndex: 10 - idx
                          }}
                          title={m.name}>{m.name[0]}</div>
                      ))}
                      {project.members?.length > 4 && (
                        <div className="avatar avatar-sm"
                          style={{ 
                            background: '#f1f5f9', 
                            color: '#64748b',
                            border: '2px solid #fff', 
                            marginLeft: '-10px', 
                            fontSize: '0.7rem',
                            zIndex: 0
                          }}>
                          +{project.members.length - 4}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {project.members?.length || 0} Member{(project.members?.length !== 1) ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => setAddMemberProject(project)}>+ Member</button>
                    {isAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project.id)}>
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={p => setProjects(prev => [p, ...prev])}
        />
      )}
      {addMemberProject && (
        <AddMemberModal
          project={addMemberProject}
          onClose={() => setAddMemberProject(null)}
          onUpdated={updated => setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))}
        />
      )}
    </AppLayout>
  );
}
