import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi, logoutApi } from '../services/auth';

const AuthContext = createContext({
    user: null,
    loading: true,
    isAdmin: false,
    isStoreOwner: false,
    isUser: false,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    refresh: async () => { },
    updateProfile: async () => { },
    updatePassword: async () => { },
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (!res.ok) {
                setUser(null);
                return null;
            }
            const data = await res.json();
            setUser(data?.user ?? null);
            return data?.user ?? null;
        } catch (e) {
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            await refresh();
            if (mounted) setLoading(false);
        })();
        return () => { mounted = false; };
    }, [refresh]);

    const login = useCallback(async (credentials) => {
        const data = await loginApi(credentials);
        await refresh();
        return data;
    }, [refresh]);

    const register = useCallback(async (payload) => {
        const data = await registerApi(payload);
        await refresh();
        return data;
    }, [refresh]);

    const logout = useCallback(async () => {
        await logoutApi();
        setUser(null);
        navigate('/');
    }, [navigate]);

    const updateProfile = useCallback(async (profileData) => {
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const data = await response.json();
            await refresh(); // Refresh user data
            return data;
        } catch (error) {
            throw error;
        }
    }, [refresh]);

    const updatePassword = useCallback(async (currentPassword, newPassword) => {
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const role = String(user?.role || '').toLowerCase();
    const isAdmin = role === 'admin';
    const isStoreOwner = role === 'owner';
    const isUser = role === 'user' || role === 'normal user';

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, isStoreOwner, isUser, login, register, logout, refresh, updateProfile, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}