import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Users, Search, Mail, MapPin, User, Plus, X, Trash2, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import useDebounce from '../../hooks/useDebounce';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    address: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});

  // Debounce search term to prevent API calls on every character
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (roleFilter) params.append('role', roleFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`/api/admin/users?${params}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.length < 2 || formData.name.length > 100) {
      errors.name = 'Name must be between 2 and 100 characters';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.address || formData.address.length > 400) {
      errors.address = 'Address must not exceed 400 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      console.log('Sending request to /api/admin/users with data:', formData);
      const response = await axios.post('/api/admin/users', formData);
      console.log('Response received:', response.data);
      toast.success('User created successfully!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.error || 'Failed to create user';
      toast.error(message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.fullName,
      email: user.email,
      address: user.address,
      role: user.role.toLowerCase().replace(' ', '_')
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.name || editFormData.name.length < 2 || editFormData.name.length > 100) {
      errors.name = 'Name must be between 2 and 100 characters';
    }

    if (!editFormData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!editFormData.address || editFormData.address.length > 400) {
      errors.address = 'Address must not exceed 400 characters';
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log('Edit form submitted with data:', editFormData);

    if (!validateEditForm()) {
      console.log('Edit form validation failed');
      return;
    }

    try {
      console.log('Sending edit request to /api/admin/users/' + selectedUser.id);
      const response = await axios.put(`/api/admin/users/${selectedUser.id}`, editFormData);
      console.log('Edit response received:', response.data);
      toast.success('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      setEditFormData({ name: '', email: '', address: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.error || 'Failed to update user';
      toast.error(message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [userId]: true }));
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete user';
      toast.error(message);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getRoleBadgeColor = (role) => {
    const normalizedRole = role.toLowerCase();

    switch (normalizedRole) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'store_owner':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="panel bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management 👥</h1>
                <p className="text-gray-600">View and manage all users in the system</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-300 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="panel bg-white shadow-lg rounded-xl p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-blue-500"></div>
                </div>
              )}
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg input-field focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg input-field focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="role">Sort by Role</option>
              <option value="created_at">Sort by Date</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-lg input-field focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden panel bg-white shadow-lg rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Users ({users.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Address
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {user.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.role.toLowerCase() !== 'admin' && (
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            disabled={deleteLoading[user.id]}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {users.length === 0 && !loading && (
          <div className="p-12 text-center panel bg-white shadow-lg rounded-xl">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter ? 'Try adjusting your search criteria.' : 'No users are currently registered.'}
            </p>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm">
            <div className="relative p-6 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">Add New User 🚀</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name (20-100 characters)"
                    required
                  />
                  {formErrors.name && (<p className="mt-1 text-xs text-red-500">{formErrors.name}</p>)}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                    required
                  />
                  {formErrors.email && (<p className="mt-1 text-xs text-red-500">{formErrors.email}</p>)}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password (min 6 characters)"
                    required
                  />
                  {formErrors.password && (<p className="mt-1 text-xs text-red-500">{formErrors.password}</p>)}
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full address"
                    required
                  />
                  {formErrors.address && (<p className="mt-1 text-xs text-red-500">{formErrors.address}</p>)}
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                  {formErrors.role && (<p className="mt-1 text-xs text-red-500">{formErrors.role}</p>)}
                </div>
                <div className="flex pt-4 space-x-3">
                  <button type="submit" className="flex-1 btn-primary py-2 px-4 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md">Create User</button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary py-2 px-4 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm">
            <div className="relative p-6 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">Edit User ✏️</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name (2-100 characters)"
                    required
                  />
                  {editFormErrors.name && (<p className="mt-1 text-xs text-red-500">{editFormErrors.name}</p>)}
                </div>
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                    required
                  />
                  {editFormErrors.email && (<p className="mt-1 text-xs text-red-500">{editFormErrors.email}</p>)}
                </div>
                <div>
                  <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    id="edit-address"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full address"
                    required
                  />
                  {editFormErrors.address && (<p className="mt-1 text-xs text-red-500">{editFormErrors.address}</p>)}
                </div>
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="edit-role"
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    className="mt-1 input-field w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                  {editFormErrors.role && (<p className="mt-1 text-xs text-red-500">{editFormErrors.role}</p>)}
                </div>
                <div className="flex pt-4 space-x-3">
                  <button type="submit" className="flex-1 btn-primary py-2 px-4 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md">Update User</button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 btn-secondary py-2 px-4 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;