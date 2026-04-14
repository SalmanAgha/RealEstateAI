'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserCheck, UserMinus, Shield, Activity, Search, Edit, Trash2, X, CheckCircle } from 'lucide-react';
import { userService } from '@/services/api';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [userList, setUserList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      if (res.status === 'success') {
        setUserList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isMounted && !loading) {
      if (user?.role !== 'admin') {
        router.push('/user');
      } else {
        fetchUsers();
      }
    }
  }, [user, loading, router, isMounted]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Creation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user? This action is irreversible.')) {
      try {
        await userService.deleteUser(id);
        setUserList(userList.filter(u => u.id !== id));
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, name, email, role, subscription, status } = editingUser;
      await userService.updateUser(id, { name, email, role, subscription, status });
      setUserList(userList.map(u => u.id === id ? editingUser : u));
      setEditingUser(null);
    } catch (err) {
      alert('Update failed');
    }
  };

  if (!isMounted || loading || !user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Verifying administrator credentials...</p>
      </div>
    );
  }

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0 8px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>User Workstation</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Management of platform operators and administrators.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
             <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', borderRadius: 'var(--radius-sm)', gap: '8px' }}>
                <Search size={14} color="var(--text-tertiary)" />
                <input 
                  placeholder="Search database..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-primary)', width: '150px', outline: 'none' }} 
                />
             </div>
             <button onClick={() => setShowCreateModal(true)} style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-primary)', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
               + Create User
             </button>
             <button onClick={fetchUsers} className="glass" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
               Refresh
             </button>
        </div>
      </header>

      {/* Admin Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
            { label: 'Total Users', value: userList.length.toString(), icon: UserCheck, color: '#10b981' },
            { label: 'Admins', value: userList.filter(u => u.role === 'admin').length.toString(), icon: Shield, color: 'var(--brand-primary)' },
            { label: 'Active Sessions', value: '14', icon: Activity, color: '#3b82f6' },
            { label: 'Pending Access', value: '0', icon: UserMinus, color: 'var(--text-tertiary)' },
        ].map((stat, i) => (
            <div key={i} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{stat.value}</p>
                </div>
                <stat.icon size={20} color={stat.color} strokeWidth={1.5} />
            </div>
        ))}
      </div>

      {/* Main User Registry Table */}
      <div className="glass" style={{ padding: '0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>Neural User Registry</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontWeight: '600' }}>
              {fetching ? '...' : userList.length} Registered Profiles
            </span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-tertiary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 20px', fontWeight: '600' }}>Identifier</th>
                <th style={{ padding: '12px 20px', fontWeight: '600' }}>Authorization</th>
                <th style={{ padding: '12px 20px', fontWeight: '600' }}>Protocol</th>
                <th style={{ padding: '12px 20px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: '600', textAlign: 'right' }}>Ops</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Accessing data stream...</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '0.75rem' }}>
                         {u.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.8rem' }}>{u.name}</p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '0.7rem', color: u.role === 'admin' ? 'var(--brand-primary)' : 'inherit', fontWeight: u.role === 'admin' ? 'bold' : 'normal' }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>{u.subscription.toUpperCase()}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-md)', 
                      fontSize: '0.6rem', 
                      background: u.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: u.status === 'active' ? '#10b981' : '#ef4444',
                      border: `1px solid ${u.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      fontWeight: '700'
                    }}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => setEditingUser(u)}
                        style={{ color: 'var(--text-tertiary)', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === user.id}
                        style={{ 
                          color: '#ef4444', 
                          padding: '6px', 
                          borderRadius: 'var(--radius-sm)', 
                          border: '1px solid rgba(239, 68, 68, 0.2)', 
                          background: 'transparent', 
                          cursor: u.id === user.id ? 'not-allowed' : 'pointer',
                          opacity: u.id === user.id ? 0.3 : 1
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '400px', padding: '32px', borderRadius: '24px', background: '#fdfdfd', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', color: '#0a0a0b' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0a0a0b' }}>Create Platform User</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>
             
             <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'black', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                  <input 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    placeholder="e.g. Jean-Luc Picard"
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0a0a0b', fontSize: '0.8rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'black', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
                  <input 
                    type="email"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="officer@starfleet.com"
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0a0a0b', fontSize: '0.8rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'black', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>Initial Password</label>
                  <input 
                    type="password"
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Min 8 characters"
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0a0a0b', fontSize: '0.8rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'black', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>Role</label>
                  <select 
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0a0a0b', fontSize: '0.8rem' }}
                  >
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
                
                <button type="submit" style={{ marginTop: '12px', padding: '12px', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                   Initialize User
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '400px', padding: '32px', borderRadius: '24px', background: '#fdfdfd', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', color: '#0a0a0b' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0a0a0b' }}>Authorize Adjustment</h3>
                <button onClick={() => setEditingUser(null)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>
             
             <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'black', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                  <input 
                    value={editingUser.name} 
                    onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0a0a0b', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'black', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>Role</label>
                  <select 
                    value={editingUser.role} 
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0a0a0b', fontSize: '0.8rem' }}
                  >
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'black', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>Status</label>
                  <select 
                    value={editingUser.status} 
                    onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0a0a0b', fontSize: '0.8rem' }}
                  >
                    <option value="active">ACTIVE</option>
                    <option value="inactive">INACTIVE</option>
                  </select>
                </div>
                
                <button type="submit" style={{ marginTop: '12px', padding: '12px', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                  Commit Changes
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
