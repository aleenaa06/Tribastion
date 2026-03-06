import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('tribastion_token');
        const savedUser = localStorage.getItem('tribastion_user');
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('tribastion_token');
                localStorage.removeItem('tribastion_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await authAPI.login(username, password);
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('tribastion_token', authToken);
        localStorage.setItem('tribastion_user', JSON.stringify(userData));
        return userData;
    };

    const register = async (data) => {
        const response = await authAPI.register(data);
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('tribastion_token', authToken);
        localStorage.setItem('tribastion_user', JSON.stringify(userData));
        return userData;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('tribastion_token');
        localStorage.removeItem('tribastion_user');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
