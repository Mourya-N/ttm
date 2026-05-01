import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { taskApi } from '../api/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckSquare } from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITY_COLORS = {
  LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', URGENT: 'badge-urgent'
};
const STATUS_COLORS = {
  TODO: 'badge-todo', IN_PROGRESS: 'badge-inprogress', IN_REVIEW: 'badge-inreview', DONE: 'badge-done'
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    taskApi.getMy()
      .then(r => setTasks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskApi.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
      toast.success('Status updated!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = tasks.filter(t => {
    const matchFilter = filter === 'ALL' || t.status === filter;
    const matchSearch = search === '' || t.title.toLowerCase().includes(search.toLowerCase())
      || t.projectName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const overdue = filtered.filter(t => t.overdue);
  const nonOverdue = filtered.filter(t => !t.overdue);

  return (
    <AppLayout title="My Tasks">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} total · {tasks.filter(t => t.overdue).length} overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.5 }} />
          <div className="empty-title">{filter === 'DONE' ? 'No completed tasks' : 'No tasks found'}</div>
          <div className="empty-desc">Any tasks assigned to your identity will appear in this workspace</div>
        </div>
      ) : (
        <>
          {/* Overdue Section */}
          {overdue.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--red)', marginBottom: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ Overdue ({overdue.length})
              </h3>
              <div className="table-container">
                <table className="table">
                  <TaskTableBody tasks={overdue} onStatusChange={handleStatusChange} />
                </table>
              </div>
            </div>
          )}

          {/* Normal Tasks */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <TaskTableBody tasks={nonOverdue} onStatusChange={handleStatusChange} />
            </table>
          </div>
        </>
      )}
    </AppLayout>
  );
}

function TaskTableBody({ tasks, onStatusChange }) {
  return (
    <tbody>
      {tasks.map(task => (
        <tr key={task.id}>
          <td>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{task.title}</div>
            {task.description && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', maxWidth: '300px' }}
                className="truncate">{task.description}</div>
            )}
          </td>
          <td>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {task.projectName || '—'}
            </span>
          </td>
          <td>
            <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
          </td>
          <td>
            <select
              className="form-select"
              value={task.status}
              onChange={e => onStatusChange(task.id, e.target.value)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto', fontWeight: 600, background: '#f8fafc' }}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </td>
          <td>
            {task.dueDate ? (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: task.overdue ? '#f43f5e' : 'var(--text-secondary)' }}>
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}
          </td>
          <td>
            <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_', ' ')}</span>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
