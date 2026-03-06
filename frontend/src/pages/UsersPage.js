import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiShieldCheck, HiUser, HiX } from 'react-icons/hi';

export default function UsersPage() {
    const { darkMode } = useTheme();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user', full_name: '' });

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const res = await userAPI.list();
            setUsers(res.data.users);
        } catch (err) {
            console.error('Load users error:', err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await userAPI.create(form);
            toast.success('User created successfully!');
            setShowModal(false);
            setForm({ username: '', email: '', password: '', role: 'user', full_name: '' });
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create user');
        }
    };

    const handleToggleRole = async (id, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await userAPI.update(id, { role: newRole });
            toast.success(`Role updated to ${newRole}`);
            loadUsers();
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const handleToggleActive = async (id, isActive) => {
        try {
            await userAPI.update(id, { is_active: !isActive });
            toast.success(isActive ? 'User deactivated' : 'User activated');
            loadUsers();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await userAPI.delete(id);
            toast.success('User deleted');
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete user');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Manage Users</h1>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{users.length} users total</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2">
                    <HiPlus className="w-4 h-4" /> <span>Add User</span>
                </button>
            </div>

            {/* Users Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(u => (
                    <div key={u.id} className={`p-5 rounded-2xl transition-all hover:-translate-y-0.5 ${darkMode ? 'bg-white/[0.03] border border-white/5 hover:border-white/10' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.role === 'admin' ? 'bg-gradient-to-r from-cyan-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
                                    {u.role === 'admin' ? <HiShieldCheck className="w-5 h-5 text-white" /> : <HiUser className="w-5 h-5 text-white" />}
                                </div>
                                <div>
                                    <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{u.full_name || u.username}</div>
                                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>@{u.username}</div>
                                </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {u.role}
                            </span>
                        </div>

                        <div className={`text-xs mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{u.email}</div>

                        <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex space-x-1">
                                <button onClick={() => handleToggleRole(u.id, u.role)} title="Toggle role"
                                    className={`p-1.5 rounded-lg text-xs ${darkMode ? 'text-gray-400 hover:text-cyan-400 hover:bg-white/5' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'} transition-all`}>
                                    <HiPencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleToggleActive(u.id, u.is_active)} title="Toggle active"
                                    className={`p-1.5 rounded-lg text-xs ${darkMode ? 'text-gray-400 hover:text-yellow-400 hover:bg-white/5' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'} transition-all`}>
                                    <HiUser className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(u.id)} title="Delete user"
                                    className={`p-1.5 rounded-lg text-xs ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-white/5' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} transition-all`}>
                                    <HiTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className={`w-full max-w-md p-6 rounded-2xl ${darkMode ? 'bg-dark-900 border border-white/10' : 'bg-white border border-gray-200 shadow-2xl'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New User</h2>
                            <button onClick={() => setShowModal(false)} className={`p-1 rounded-lg ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="Username"
                                className={`w-full px-4 py-3 rounded-xl border text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="Email"
                                className={`w-full px-4 py-3 rounded-xl border text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                            <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Full Name"
                                className={`w-full px-4 py-3 rounded-xl border text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Password"
                                className={`w-full px-4 py-3 rounded-xl border text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border text-sm ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                <option value="user">Standard User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit" className="w-full py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg">
                                Create User
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
