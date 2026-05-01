import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { userApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    userApi.getAll()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load team members'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await userApi.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
      toast.success('Role updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = filtered.filter(u => u.role === 'ADMIN');
  const members = filtered.filter(u => u.role === 'MEMBER');

  return (
    <AppLayout title="Team">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">{users.length} member{users.length !== 1 ? 's' : ''} in your organization</p>
        </div>
      </div>

      <input
        className="form-input"
        placeholder="🔍 Search members..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: '320px', marginBottom: '1.5rem' }}
      />

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <>
          {admins.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-light)',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👑 Admins ({admins.length})
              </h3>
              <div className="grid-3">
                {admins.map(u => <UserCard key={u.id} user={u} isAdmin={isAdmin} onRoleChange={handleRoleChange} />)}
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)',
              marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👤 Members ({members.length})
            </h3>
            {members.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <div className="empty-title">No members found</div>
              </div>
            ) : (
              <div className="grid-3">
                {members.map(u => <UserCard key={u.id} user={u} isAdmin={isAdmin} onRoleChange={handleRoleChange} />)}
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}

function UserCard({ user, isAdmin, onRoleChange }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div className="avatar avatar-lg" style={{ background: user.avatarColor || '#6366f1' }}>
          {user.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }} className="truncate">{user.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} className="truncate">{user.email}</div>
        </div>
      </div>
      <div className="flex-between">
        <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
          {user.role === 'ADMIN' ? '👑' : '👤'} {user.role}
        </span>
        {isAdmin && (
          <select
            className="form-select"
            value={user.role}
            onChange={e => onRoleChange(user.id, e.target.value)}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', width: 'auto' }}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        )}
      </div>
    </div>
  );
}
