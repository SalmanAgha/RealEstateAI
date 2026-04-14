'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, ShieldCheck, User, CheckCircle2, Plus, Edit, Trash2, X, Lock } from 'lucide-react';
import { roleService } from '@/services/api';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export default function RolesRightsPage() {
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });
  
  const router = useRouter();

  const availablePermissions = [
    'USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE',
    'ADMIN_VIEW', 'ADMIN_CREATE', 'ADMIN_EDIT', 'ADMIN_DELETE',
    'DEPT_VIEW', 'DEPT_CREATE', 'DEPT_EDIT', 'DEPT_DELETE',
    'BILLING_MANAGE', 'SYSTEM_CONFIG'
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchRoles = async () => {
    try {
      console.log('Synchronising with Roles Registry...');
      const res = await roleService.getRoles();
      console.log('Registry Data Received:', res);
      if (res.status === 'success') {
        setRoles(res.data);
      }
    } catch (err) {
      console.error('CRITICAL: Neural Fetch Failure:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isMounted && !loading) {
      if (user?.role !== 'admin') {
        router.push('/user');
      } else {
        fetchRoles();
      }
    }
  }, [user, loading, router, isMounted]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roleService.createRole(newRole);
      setShowCreateModal(false);
      setNewRole({ name: '', description: '', permissions: [] });
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Creation failed');
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await roleService.updateRole(editingRole.id, editingRole);
      setEditingRole(null);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (confirm('Delete this role profile? This will affect all associated neural identities.')) {
      try {
        await roleService.deleteRole(id);
        fetchRoles();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const togglePermission = (perm: string, isEditing: boolean) => {
    if (isEditing && editingRole) {
      const current = editingRole.permissions;
      const updated = current.includes(perm) 
        ? current.filter(p => p !== perm) 
        : [...current, perm];
      setEditingRole({ ...editingRole, permissions: updated });
    } else {
      const current = newRole.permissions;
      const updated = current.includes(perm) 
        ? current.filter(p => p !== perm) 
        : [...current, perm];
      setNewRole({ ...newRole, permissions: updated });
    }
  };

  if (!isMounted || loading || !user) return null;

  return (
    <div className="animate-fade-in" style={{ padding: '0 8px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Permissions & Protocols</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Management of global roles and their associated system rights.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-primary)', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
          + Define New Role
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {fetching ? (
            <p style={{ color: 'var(--text-tertiary)' }}>Fetching identity protocols...</p>
        ) : roles.map((role) => (
          <div key={role.id} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                  <ShieldCheck size={18} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{role.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setEditingRole(role)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit size={14}/></button>
                <button onClick={() => handleDeleteRole(role.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14}/></button>
              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '20px', lineHeight: 1.5 }}>{role.description || 'No description provided for this protocol tier.'}</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {role.permissions.map(p => (
                <span key={p} style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  {p}
                </span>
              ))}
              {role.permissions.length === 0 && <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>No rights assigned.</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ width: '500px', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Initialize New Role Protocol</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>
             <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Role Name</label>
                  <input value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} placeholder="e.g. DATA_ARCHITECT" style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Protocol Description</label>
                  <textarea value={newRole.description} onChange={e => setNewRole({...newRole, description: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', minHeight: '80px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block' }}>Rights Assignment</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                    {availablePermissions.map(p => (
                      <div key={p} onClick={() => togglePermission(p, false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.7rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: '1px solid var(--brand-primary)', background: newRole.permissions.includes(p) ? 'var(--brand-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {newRole.permissions.includes(p) && <CheckCircle2 size={10} color="white" />}
                        </div>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" style={{ padding: '12px', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold', border: 'none' }}>Initialize Role</button>
             </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRole && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ width: '500px', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Adjust Protocol Tier</h3>
                <button onClick={() => setEditingRole(null)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>
             <form onSubmit={handleUpdateRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Name</label>
                  <input value={editingRole.name} onChange={e => setEditingRole({...editingRole, name: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Description</label>
                  <textarea value={editingRole.description} onChange={e => setEditingRole({...editingRole, description: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', minHeight: '80px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block' }}>Adjust Rights</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                    {availablePermissions.map(p => (
                      <div key={p} onClick={() => togglePermission(p, true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.7rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: '1px solid var(--brand-primary)', background: editingRole.permissions.includes(p) ? 'var(--brand-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {editingRole.permissions.includes(p) && <CheckCircle2 size={10} color="white" />}
                        </div>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" style={{ padding: '12px', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold', border: 'none' }}>Commit Adjustments</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
