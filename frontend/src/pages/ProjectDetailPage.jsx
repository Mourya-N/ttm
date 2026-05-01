import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { projectApi, taskApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const COLUMNS = [
  { key: 'TODO',        label: 'To Do',      color: '#64748b' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { key: 'IN_REVIEW',   label: 'In Review',   color: '#f59e0b' },
  { key: 'DONE',        label: 'Done',        color: '#22c55e' },
];

const PRIORITY_COLORS = {
  LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', URGENT: '#ef4444'
};

function CreateTaskModal({ project, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', projectId: project.id,
    assigneeId: '', priority: 'MEDIUM', dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.assigneeId) delete payload.assigneeId;
      if (!payload.dueDate) delete payload.dueDate;
      const res = await taskApi.create(payload);
      onCreated(res.data);
      toast.success('Task created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <h2 className="modal-title">+ New Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="What needs to be done?"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Add details..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assigneeId}
                onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members?.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input"
              value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '✓ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskDetailModal({ task, project, onClose, onUpdated, onDeleted }) {
  const { isAdmin, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title, description: task.description || '',
    assigneeId: task.assigneeId || '', priority: task.priority,
    status: task.status, dueDate: task.dueDate || ''
  });
  const [loading, setLoading] = useState(false);

  const canEdit = isAdmin || task.createdById === user?.id || task.assigneeId === user?.id;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      const res = await taskApi.update(task.id, payload);
      onUpdated(res.data);
      toast.success('Task updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskApi.delete(task.id);
      onDeleted(task.id);
      toast.success('Task deleted');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete task');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            {editing ? (
              <input className="form-input" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />
            ) : (
              <h2 className="modal-title">{task.title}</h2>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {editing ? (
              <>
                <select className="form-select" style={{ width: 'auto' }}
                  value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
                <select className="form-select" style={{ width: 'auto' }}
                  value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </>
            ) : (
              <>
                <span className={`badge badge-${task.status.toLowerCase().replace('_', '')}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.65rem',
                  borderRadius: '20px', color: PRIORITY_COLORS[task.priority],
                  background: `${PRIORITY_COLORS[task.priority]}22`
                }}>{task.priority}</span>
                {task.overdue && <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>⚠ Overdue</span>}
              </>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            {editing ? (
              <textarea className="form-textarea" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            ) : (
              <p style={{ fontSize: '0.875rem', color: task.description ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                {task.description || 'No description'}
              </p>
            )}
          </div>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              {editing ? (
                <select className="form-select" value={form.assigneeId}
                  onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {task.assigneeName ? (
                    <>
                      <div className="avatar avatar-sm" style={{ background: task.assigneeAvatarColor || '#6366f1' }}>
                        {task.assigneeName[0]}
                      </div>
                      <span style={{ fontSize: '0.85rem' }}>{task.assigneeName}</span>
                    </>
                  ) : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unassigned</span>}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              {editing ? (
                <input type="date" className="form-input" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              ) : (
                <span style={{ fontSize: '0.85rem', color: task.overdue ? 'var(--red)' : 'var(--text-secondary)' }}>
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                </span>
              )}
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Created by {task.createdByName} · {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : ''}
          </div>

          {/* Actions */}
          {canEdit && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Delete</button>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {editing ? (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={loading}>
                      {loading ? 'Saving...' : '✓ Save'}
                    </button>
                  </>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏ Edit</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    Promise.all([projectApi.getOne(id), taskApi.getByProject(id)])
      .then(([p, t]) => { setProject(p.data); setTasks(t.data); })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <AppLayout title="Project">
      <div className="loading-container"><div className="spinner" /></div>
    </AppLayout>
  );
  if (!project) return null;

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key);
    return acc;
  }, {});

  return (
    <AppLayout title={project.name}>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/projects')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            ← Projects
          </button>
          <h1 className="page-title">{project.name}</h1>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '-4px' }}>
            {project.members?.slice(0, 5).map(m => (
              <div key={m.id} className="avatar avatar-sm"
                style={{ background: m.avatarColor || '#6366f1', border: '2px solid var(--bg-primary)', marginLeft: '-4px' }}
                title={m.name}>{m.name[0]}</div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Task</button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLUMNS.map(col => (
          <div key={col.key} className="kanban-col">
            <div className="kanban-col-header">
              <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
              <span className="kanban-col-count">{tasksByStatus[col.key].length}</span>
            </div>

            {tasksByStatus[col.key].map(task => (
              <div
                key={task.id}
                className={`task-card ${task.overdue ? 'task-overdue' : ''}`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="task-card-title">{task.title}</div>
                {task.description && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}
                    className="truncate">{task.description}</p>
                )}
                <div className="task-card-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {task.assigneeName ? (
                      <div className="avatar avatar-sm"
                        style={{ background: task.assigneeAvatarColor || '#6366f1' }}
                        title={task.assigneeName}>{task.assigneeName[0]}</div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unassigned</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {task.dueDate && (
                      <span style={{ fontSize: '0.7rem', color: task.overdue ? 'var(--red)' : 'var(--text-muted)' }}>
                        📅 {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: PRIORITY_COLORS[task.priority], flexShrink: 0
                    }} title={task.priority} />
                  </div>
                </div>
              </div>
            ))}

            {tasksByStatus[col.key].length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No tasks
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateTaskModal
          project={project}
          onClose={() => setShowCreate(false)}
          onCreated={task => setTasks(prev => [task, ...prev])}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
          onUpdated={updated => {
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            setSelectedTask(updated);
          }}
          onDeleted={id => setTasks(prev => prev.filter(t => t.id !== id))}
        />
      )}
    </AppLayout>
  );
}
