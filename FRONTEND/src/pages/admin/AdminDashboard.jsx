import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Store,
  Star,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Registered users in the system',
    },
    {
      name: 'Total Stores',
      value: stats?.totalStores || 0,
      icon: Store,
      color: 'bg-green-500',
      description: 'Stores registered on the platform',
    },
    {
      name: 'Total Ratings',
      value: stats?.totalRatings || 0,
      icon: Star,
      color: 'bg-yellow-500',
      description: 'Ratings submitted by users',
    },
  ];

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">System overview and statistics</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/admin/users" 
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="p-2 rounded-lg bg-blue-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Manage Users</p>
              <p className="text-xs text-gray-500">View and manage all users</p>
            </div>
          </Link>
          <Link 
            to="/admin/stores"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="p-2 rounded-lg bg-green-500">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Manage Stores</p>
              <p className="text-xs text-gray-500">Add and manage stores</p>
            </div>
          </Link>
        </div>
      </div>



      {/* Admin Features */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrative Features</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">User Management</p>
              <p className="text-sm text-gray-600">
                Add new users, view user details, and manage user roles. You can create admin users,
                normal users, and store owners with different permissions.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Store className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Store Management</p>
              <p className="text-sm text-gray-600">
                Add new stores to the platform and assign store owners. Manage store information
                and view store ratings and statistics.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">System Analytics</p>
              <p className="text-sm text-gray-600">
                Monitor system performance, view user activity, and track platform usage statistics
                to ensure optimal system operation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 