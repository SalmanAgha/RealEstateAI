'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, Search, Edit, Trash2, X, Plus } from 'lucide-react';
import { userService } from '@/services/api';

export default function AdminsManagementPage() {
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [adminList, setAdminList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await userService.getAllUsers();
      if (res.status === 'success') {
        setAdminList(res.data.filter((u: any) => u.role === 'admin'));
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isMounted && !loading) {
      if (user?.role !== 'admin') {
        router.push('/user');
      } else {
        fetchAdmins();
      }
    }
  }, [user, loading, router, isMounted]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createUser(newAdmin);
      setShowCreateModal(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Admin creation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id) {
       alert('Cannot deprovision yourself.');
       return;
    }
    if (confirm('Are you sure you want to deprovision this administrator? This role has critical access.')) {
      try {
        await userService.deleteUser(id);
        setAdminList(adminList.filter(u => u.id !== id));
      } catch (err) {
        alert('Deprovision failed');
      }
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, name, email, status } = editingAdmin;
      await userService.updateUser(id, { name, email, status });
      setAdminList(adminList.map(u => u.id === id ? editingAdmin : u));
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      alert('Update failed');
    }
  };

  if (!isMounted || loading || !user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Elevating privileges...</p>
      </div>
    );
  }

  const filteredAdmins = adminList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0 8px' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Administrator Workstation</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Management of global administrators and system supervisors.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
             <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', borderRadius: 'var(--radius-sm)', gap: '8px' }}>
                <Search size={14} color="var(--text-tertiary)" />
                <input 
                  placeholder="Search administrators..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-primary)', width: '150px', outline: 'none' }} 
                />
             </div>
             <button onClick={() => setShowCreateModal(true)} style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-primary)', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
               + New Administrator
             </button>
        </div>
      </header>

      <div className="glass" style={{ padding: '0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>Admin Registry</h4>
            <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontWeight: '600' }}>
              {fetching ? '...' : adminList.length} High-Level Identities
            </span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-tertiary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 20px', fontWeight: '600' }}>Identity</th>
                <th style={{ padding: '12px 20px', fontWeight: '600' }}>Clearance</th>
                <th style={{ padding: '12px 20px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: '600', textAlign: 'right' }}>Ops</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Authenticating identities...</td>
                </tr>
              ) : filteredAdmins.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                         <Shield size={16} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.name}</p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}><span style={{ color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '0.65rem' }}>ROOT ACCESS</span></td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-md)', fontSize: '0.6rem', background: u.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: u.status === 'active' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => setEditingAdmin(u)} style={{ color: 'var(--text-tertiary)', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer' }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} disabled={u.id === user?.id} style={{ color: '#ef4444', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'transparent', cursor: u.id === user?.id ? 'not-allowed' : 'pointer', opacity: u.id === user?.id ? 0.3 : 1 }}>
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

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ width: '400px', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Promote Administrator</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>
             <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>Legal Name</label>
                  <input value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>Admin Email</label>
                  <input type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>System Password</label>
                  <input type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} required />
                </div>
                <button type="submit" style={{ marginTop: '12px', padding: '12px', background: '#ef4444', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Elevate Account</button>
             </form>
          </div>
        </div>
      )}

      {editingAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ width: '400px', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Update Administrative Protocol</h3>
                <button onClick={() => setEditingAdmin(null)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>
             <form onSubmit={handleUpdateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Name</label>
                  <input value={editingAdmin.name} onChange={e => setEditingAdmin({...editingAdmin, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Activity Status</label>
                  <select value={editingAdmin.status} onChange={e => setEditingAdmin({...editingAdmin, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button type="submit" style={{ padding: '12px', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold', border: 'none' }}>Commit Protocols</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
