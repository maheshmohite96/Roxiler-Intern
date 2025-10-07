import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [], user }) {
    const normalize = (r) => (r ? String(r).toLowerCase() : null);
    const role = normalize(user?.role);

    // Debug logging

    if (user === null) return null;
    if (!user) return <Navigate to="/login" replace />;

    // Check if user has any of the allowed roles (including variations)
    const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.some(allowedRole => {
        const normalizedAllowedRole = normalize(allowedRole);
        return role === normalizedAllowedRole ||
            (normalizedAllowedRole === 'user' && (role === 'user' || role === 'normal user')) ||
            (role === 'user' && (normalizedAllowedRole === 'user' || normalizedAllowedRole === 'normal user'));
    });

    if (!hasAllowedRole) {
        // Redirect to appropriate dashboard based on user role
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'owner') return <Navigate to="/store-owner" replace />;
        if (role === 'user' || role === 'normal user') return <Navigate to="/user" replace />;
        return <Navigate to="/user" replace />; // Default fallback
    }

    return children;
}