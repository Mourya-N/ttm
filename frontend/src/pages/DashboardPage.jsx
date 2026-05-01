import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { dashboardApi } from '../api/api';
import { format } from 'date-fns';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Users,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const PRIORITY_COLORS = {
  LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', URGENT: 'badge-urgent'
};

const STATUS_COLORS = {
  TODO: 'badge-todo', IN_PROGRESS: 'badge-inprogress', IN_REVIEW: 'badge-inreview', DONE: 'badge-done'
};

function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color, '--stat-color-bg': bgColor }}>
      <div className="stat-icon" style={{ color: color }}>{icon}</div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout title="Dashboard">
      <div className="loading-container"><div className="spinner" /></div>
    </AppLayout>
  );

  return (
    <AppLayout title="Dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspace <span className="text-gradient">Overview</span></h1>
          <p className="page-subtitle">Track, manage and optimize your team's velocity</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
          <TrendingUp size={18} /> View Analytics
        </button>
      </div>

      {/* Stat Grid */}
      <div className="stat-grid mb-3">
        <StatCard 
          icon={<FolderKanban size={24} />} 
          label="Active Projects" 
          value={stats?.totalProjects ?? 0}
          color="#2563eb" 
          bgColor="#eff6ff" 
        />
        <StatCard 
          icon={<CheckSquare size={24} />} 
          label="Tasks Completed" 
          value={stats?.totalTasks ?? 0}
          color="#f59e0b" 
          bgColor="#fff7ed" 
        />
        <StatCard 
          icon={<Clock size={24} />} 
          label="In Progress" 
          value={stats?.inProgressTasks ?? 0}
          color="#8b5cf6" 
          bgColor="#f5f3ff" 
        />
        <StatCard 
          icon={<AlertCircle size={24} />} 
          label="Overdue" 
          value={stats?.overdueTasks ?? 0}
          color="#f43f5e" 
          bgColor="#fff1f2" 
        />
        {stats?.totalMembers !== undefined && (
          <StatCard 
            icon={<Users size={24} />} 
            label="Contributors" 
            value={stats.totalMembers}
            color="#2563eb" 
            bgColor="#eff6ff" 
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Project Progress */}
        <div className="card">
          <div className="flex-between mb-3">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Velocity Insights</h3>
          </div>
          {stats?.projectProgress?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {stats.projectProgress.map(p => (
                <div key={p.projectId}>
                  <div className="flex-between mb-1">
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{p.projectName}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {p.completedTasks}/{p.totalTasks} Tasks
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                    <span className="text-gradient" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                      {p.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FolderKanban size={48} className="empty-icon" style={{ opacity: 0.2 }} />
              <div className="empty-title">Initialization Required</div>
              <p className="empty-desc">Create your first project to begin tracking progress</p>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex-between mb-3">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Priority Stream</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>
              Expand <ChevronRight size={14} />
            </button>
          </div>
          {stats?.recentTasks?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.recentTasks.map(task => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem', background: '#fff', borderRadius: '12px',
                  border: task.overdue ? '1.5px solid #f43f5e' : '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">{task.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 500 }}>
                      {task.projectName} · {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                      {task.overdue && <span style={{ color: '#f43f5e', marginLeft: '0.5rem', fontWeight: 700 }}>⚠️ OVERDUE</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CheckSquare size={48} className="empty-icon" style={{ opacity: 0.2 }} />
              <div className="empty-title">All Clear</div>
              <p className="empty-desc">No urgent tasks requiring your attention</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
