import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Store,
  Users,
  LogOut,
  Menu,
  X,
  User,
  BarChart3
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin, isStoreOwner } = useAuth();
  const navigate = useNavigate();
  const isDark = false;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Stores', href: '/admin/stores', icon: Store },
    { name: 'Profile', href: '/admin/profile', icon: User },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Manage Stores', href: '/admin/admin-stores', icon: Store },
  ];

  const storeOwnerNavigation = [
    { name: 'Store Dashboard', href: '/store-owner', icon: BarChart3 },
  ];

  const allNavigation = [
    ...navigation,
    ...(isAdmin ? adminNavigation : []),
    ...(isStoreOwner ? storeOwnerNavigation : []),
  ];

  const displayName = user?.fullName || user?.name || user?.email || '';
  const displayInitial = displayName?.charAt(0)?.toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark
      ? 'bg-gray-950'
      : 'bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50'
      }`}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 transition-opacity duration-300 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex w-full max-w-xs flex-1 flex-col transform transition-transform duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
              }`}>Store Rating System</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {allNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isActive
                    ? 'bg-primary-100 text-primary-900'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors duration-150 ${isActive ? 'text-primary-500' : isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className={`border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500">
                  <span className="text-sm font-medium text-white">{displayInitial}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-2 py-2 mt-3 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <LogOut className={`w-5 h-5 mr-3 transition-colors duration-150 ${isDark ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex flex-col flex-grow border-r ${isDark ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center h-16 px-4">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
              }`}>Store Rating System</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {allNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isActive
                    ? 'bg-primary-100 text-primary-900'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors duration-150 ${isActive ? 'text-primary-500' : isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500">
                  <span className="text-sm font-medium text-white">{displayInitial}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-2 py-2 mt-3 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <LogOut className={`w-5 h-5 mr-3 transition-colors duration-150 ${isDark ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 ${isDark ? 'border-gray-700 bg-slate-900' : 'border-gray-200 bg-white'
          }`}>
          <button
            type="button"
            className={`-m-2.5 p-2.5 lg:hidden rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex self-stretch flex-1 gap-x-4 lg:gap-x-6">
            <div className="flex flex-1"></div>
          </div>
        </div>

        <main className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 