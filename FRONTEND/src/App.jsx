import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import UserDashboard from "./pages/user/UserDashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard.jsx";
import Profile from "./pages/Profile";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminUsers from "./pages/admin/AdminUser.jsx";
import AdminStores from "./pages/admin/AdminStore.jsx";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Stores from "./pages/Stores.jsx";

function useCurrentUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return data?.user ?? null;
      })
      .then((u) => { if (isMounted) setUser(u); })
      .catch(() => { if (isMounted) setUser(null); });
    return () => { isMounted = false; };
  }, []);
  return user;
}

function App() {
  const user = useCurrentUser();
  const getHomePath = (u) => {
    const role = String(u?.role || '').toLowerCase();
    if (role === 'admin') return '/admin';
    if (role === 'owner') return '/store-owner';
    if (role === 'user' || role === 'normal user') return '/user';
    return '/user';
  };
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Root redirect route */}
        <Route path="/" element={
          <ProtectedRoute user={user}>
            {user ? <Navigate to={getHomePath(user)} replace /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />

        {/* Dashboard redirect route */}
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            {user ? <Navigate to={getHomePath(user)} replace /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />

        {/* Admin routes with Layout */}
        <Route path="/admin" element={
          <ProtectedRoute user={user}>
            <ProtectedRoute allowedRoles={["admin"]} user={user}>
              <Layout />
            </ProtectedRoute>
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="stores" element={<Stores />} />
          <Route path="profile" element={<Profile />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="admin-stores" element={<AdminStores />} />
          <Route path="admin-profile" element={<AdminProfile />} />
        </Route>

        {/* Non-admin routes without Layout */}
        <Route path="/store-owner" element={
          <ProtectedRoute allowedRoles={["owner"]} user={user}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/store-owner/profile" element={
          <ProtectedRoute allowedRoles={["owner"]} user={user}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={["user"]} user={user}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user/profile" element={
          <ProtectedRoute allowedRoles={["user"]} user={user}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/user/stores" element={
          <ProtectedRoute allowedRoles={["user"]} user={user}>
            <Stores />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}
export default App;
