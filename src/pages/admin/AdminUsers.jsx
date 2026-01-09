// src/pages/admin/AdminUsers.jsx

import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/adminService';
import './AdminUsers.css';
import { useNavigate } from 'react-router-dom';

const roles = ['TASIYICI', 'YUK_SAHIBI'];

const AdminUsers = () => {
const navigate = useNavigate();
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Kullanıcıları çekerken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error('Rol güncellenemedi:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Kullanıcı silinemedi:', error);
    }
  };

  return (
    <div className="admin-users-container">
      <div className="sticky-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ⬅ Geri Dön
            </button>
            </div>
      <h1>Kullanıcı Yönetimi</h1>

      {loading ? (
        <p>Kullanıcılar yükleniyor...</p>
      ) : users.length === 0 ? (
        <p>Gösterilecek kullanıcı bulunamadı.</p>
      ) : (
        <div className="users-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <h3>{user.ad} {user.soyad}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Şirket:</strong> {user.sirketAdi || '-'}</p>
              <div className="role-section">
                <label>Rol:</label>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>
                Kullanıcıyı Sil
              </button>
        
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
