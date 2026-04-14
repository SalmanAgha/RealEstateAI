'use client';

import React, { useState, useEffect } from 'react';
import { departmentService, userService } from '@/services/api';
import { Users, Plus, UserPlus, Trash2, Shield, Settings } from 'lucide-react';
import styles from '@/styles/pages/dashboard.module.css';

interface DepartmentMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

interface Department {
  id: string;
  name: string;
  description: string;
  members: DepartmentMember[];
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [initialMemberEmail, setInitialMemberEmail] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningDeptId, setAssigningDeptId] = useState<string | null>(null);
  const [assignEmail, setAssignEmail] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const [deptRes, userRes] = await Promise.all([
        departmentService.getDepartments(),
        userService.getAllUsers()
      ]);
      setDepartments(deptRes.data);
      if (userRes.status === 'success') {
        setAllUsers(userRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to synchronise neural data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await departmentService.createDepartment({ 
        name: newDeptName,
        memberEmail: initialMemberEmail 
      });
      setNewDeptName('');
      setInitialMemberEmail('');
      setShowCreateModal(false);
      fetchDepartments();
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    }
  };

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDeptId) return;
    try {
      await departmentService.addMember(assigningDeptId, { email: assignEmail, role: 'MEMBER' });
      setAssignEmail('');
      setAssigningDeptId(null);
      fetchDepartments();
    } catch (err: any) {
      alert(err.message || 'Failed to assign personnel');
    }
  };

  if (loading) return <div>Loading Departments...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Neural Departments</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Manage collaboration nodes and department clusters</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 16px', 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--brand-primary)', 
            color: 'white', 
            border: 'none', 
            fontSize: '0.85rem', 
            fontWeight: '600', 
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Plus size={16} /> New Department
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {departments.map((dept) => (
          <div key={dept.id} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{dept.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>UID: {dept.id.substring(0, 8)}</p>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                <Users size={18} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personnel ({dept.members.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dept.members.map((member) => (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--brand-primary)' }}>
                      {member.user.avatar ? <img src={member.user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : member.user.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{member.user.name}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{member.user.email}</p>
                    </div>
                    <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '10px', background: member.role === 'OWNER' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: member.role === 'OWNER' ? 'var(--brand-primary)' : 'var(--text-tertiary)', fontWeight: 'bold', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personnel Selection</label>
              <select 
                onChange={(e) => {
                  const email = e.target.value;
                  if (email) {
                    departmentService.addMember(dept.id, { email, role: 'MEMBER' })
                      .then(() => {
                        e.target.value = '';
                        fetchDepartments();
                      })
                      .catch(err => alert(err.message));
                  }
                }}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.75rem', outline: 'none', cursor: 'pointer', appearance: 'auto' }}
              >
                <option value="">-- Choose Admin to Onboard --</option>
                {allUsers.filter(u => u.role === 'admin').map(admin => (
                  <option key={admin.id} value={admin.email}>{admin.name} ({admin.email})</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        
        {departments.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-tertiary)' }}>
              <Users size={24} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No departments initialized</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Create a new department to start collaborating on neural projects.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass animated-fade-in" style={{ width: '400px', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px' }}>Initialize Department</h2>
            <form onSubmit={handleCreateDepartment}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>DEPARTMENT NAME</label>
                <input 
                  type="text" 
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. Neural Logic Unit"
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  required
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>ASSIGN INITIAL PERSONNEL (OPTIONAL)</label>
                <input 
                  type="email" 
                  value={initialMemberEmail}
                  onChange={(e) => setInitialMemberEmail(e.target.value)}
                  placeholder="collaborator@company.com"
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer' }}>Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assigningDeptId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass animated-fade-in" style={{ width: '400px', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px' }}>Assign Personnel</h2>
            <form onSubmit={handleAssignMember}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>PERSONNEL EMAIL</label>
                <input 
                  type="email" 
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  placeholder="collaborator@company.com"
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer' }}>Assign</button>
                <button type="button" onClick={() => setAssigningDeptId(null)} style={{ flex: 1, padding: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
