import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Store, Search, Mail, MapPin, User, Star, Calendar, Plus, X, Trash2, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';

const btnPrimary = "bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-primary-300 transition";
const btnSecondary = "bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-gray-300 transition";
const btnDanger = "bg-red-500 hover:bg-red-600 text-white font-medium rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-red-200 transition opacity-90 disabled:opacity-60";
const card = "p-6 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur rounded-lg shadow flex flex-col h-full border border-white/50";
const inputField = "block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-primary-400 focus:ring-1 focus:ring-primary-300 transition outline-none";
const selectField = "block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-primary-400 focus:ring-1 focus:ring-primary-300 transition outline-none";

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [storeOwners, setStoreOwners] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Debounce search term to prevent API calls on every character
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`/api/admin/stores?${params}`);
      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  const fetchStoreOwners = async () => {
    try {
      const response = await axios.get('/api/admin/users?role=Owner');
      setStoreOwners(response.data.users);
    } catch (error) {
      console.error('Error fetching store owners:', error);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, [fetchStores]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Store name is required';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.address || formData.address.length > 400) {
      errors.address = 'Address must not exceed 400 characters';
    }

    if (!formData.ownerId) {
      errors.ownerId = 'Please select a store owner';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('/api/admin/stores', formData);

      toast.success('Store created successfully!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (error) {
      console.error('Store creation error:', error.response?.data);
      const message = error.response?.data?.error || 'Failed to create store';
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

  const handleEditStore = (store) => {
    setEditingStore(store);
    setEditFormData({
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.owner_id || ''
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.name || editFormData.name.trim().length === 0) {
      errors.name = 'Store name is required';
    }

    if (!editFormData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!editFormData.address || editFormData.address.length > 400) {
      errors.address = 'Address must not exceed 400 characters';
    }

    if (!editFormData.ownerId) {
      errors.ownerId = 'Please select a store owner';
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    try {
      console.log('Starting edit submission...');
      setEditLoading(true);
      console.log('Edit loading set to true');

      await axios.put(`/api/admin/stores/${editingStore.id}`, editFormData);

      toast.success('Store updated successfully!');
      setShowEditModal(false);
      setEditingStore(null);
      setEditFormData({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (error) {
      console.error('Store update error:', error.response?.data);
      const message = error.response?.data?.error || 'Failed to update store';
      toast.error(message);
    } finally {
      console.log('Setting edit loading to false');
      setEditLoading(false);
    }
  };

  const handleDeleteStore = async (storeId, storeName) => {
    if (!window.confirm(`Are you sure you want to delete store "${storeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [storeId]: true }));
      await axios.delete(`/api/admin/stores/${storeId}`);
      toast.success('Store deleted successfully!');
      fetchStores();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete store';
      toast.error(message);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [storeId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <div className="px-2 pb-12 mx-auto space-y-6 md:px-8 max-w-7xl ">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border shadow bg-gradient-to-br from-white/90 to-white/70 backdrop-blur border-white/50 rounded-xl">
        <div className="flex items-center space-x-5">
          <div className="flex items-center justify-center bg-green-400 rounded-full shadow w-14 h-14">
            <Store className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-500">View and manage all stores in the system</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={"flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white font-medium rounded-md px-6 py-2 transition-all duration-700 hover:shadow-lg"}
        >
          <Plus className="w-5 h-5" />
          Add Store
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border shadow bg-gradient-to-br from-white/90 to-white/70 backdrop-blur border-white/50 rounded-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputField + " pl-10"}
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute -translate-y-1/2 right-3 top-1/2">
                <div className="w-4 h-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
              </div>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={selectField}
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="average_rating">Sort by Rating</option>
            <option value="created_at">Sort by Date</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={selectField}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <div key={store.id} className={card + " group"}>
            <div className="flex flex-col h-full space-y-4">
              {/* Store Header */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                <div className="flex items-center mt-0.5 gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">{store.email}</span>
                </div>
                <div className="flex items-center mt-0.5 gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">{store.address}</span>
                </div>
                <div className="flex items-center mt-0.5 gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Joined {formatDate(store.created_at)}</span>
                </div>
              </div>

              {/* Owner Information */}
              {store.owner_name && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">Owner</div>
                      <div className="text-xs text-gray-600">{store.owner_name}</div>
                      <div className="text-xs text-gray-400">{store.owner_email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating Information */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Average Rating</span>
                  <span className="text-xs text-gray-600">
                    {store.average_rating ? parseFloat(store.average_rating).toFixed(1) : '0.0'}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= Math.round(parseFloat(store.average_rating) || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    ({store.total_ratings || 0} rating{(store.total_ratings || 0) !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-gray-100">
                <button
                  onClick={() => handleEditStore(store)}
                  className={btnSecondary + " flex items-center justify-center gap-2"}
                  title="Edit store"
                >
                  <Edit className="w-4 h-4" />
                  Edit Store
                </button>
                <button
                  onClick={() => handleDeleteStore(store.id, store.name)}
                  disabled={deleteLoading[store.id]}
                  className={btnDanger + " flex items-center justify-center gap-2"}
                  title="Delete store"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Store
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {stores.length === 0 && !loading && (
        <div className="text-center border shadow bg-gradient-to-br from-white/90 to-white/70 backdrop-blur border-white/50 p-14 rounded-xl">
          <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="mb-1 text-lg font-semibold text-gray-900">No stores found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'No stores are currently registered.'}
          </p>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
          <div className="relative w-full max-w-md p-8 mx-2 bg-white border rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Store</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-transparent">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputField + " mt-1"}
                  placeholder="Enter store name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Store Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputField + " mt-1"}
                  placeholder="Enter store email address"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Store Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className={inputField + " mt-1 resize-none"}
                  placeholder="Enter store address (max 400 characters)"
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>
                )}
              </div>
              {/* Owner */}
              <div>
                <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700">
                  Store Owner
                </label>
                <select
                  id="ownerId"
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleInputChange}
                  className={selectField + " mt-1"}
                >
                  <option value="">Select a store owner</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                {formErrors.ownerId && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.ownerId}</p>
                )}
              </div>
              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button type="submit" className={" flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300 transition"}>
                  Create Store
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={btnSecondary + " flex-1"}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-lg">
          <div className="relative w-full max-w-md p-8 mx-2 bg-white border rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Store</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className={inputField + " mt-1"}
                  placeholder="Enter store name"
                />
                {editFormErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{editFormErrors.name}</p>
                )}
              </div>
              {/* Email */}
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                  Store Email
                </label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className={inputField + " mt-1"}
                  placeholder="Enter store email address"
                />
                {editFormErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{editFormErrors.email}</p>
                )}
              </div>
              {/* Address */}
              <div>
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">
                  Store Address
                </label>
                <textarea
                  id="edit-address"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  rows="3"
                  className={inputField + " mt-1 resize-none"}
                  placeholder="Enter store address (max 400 characters)"
                />
                {editFormErrors.address && (
                  <p className="mt-1 text-xs text-red-500">{editFormErrors.address}</p>
                )}
              </div>
              {/* Owner */}
              <div>
                <label htmlFor="edit-ownerId" className="block text-sm font-medium text-gray-700">
                  Store Owner
                </label>
                <select
                  id="edit-ownerId"
                  name="ownerId"
                  value={editFormData.ownerId}
                  onChange={handleEditInputChange}
                  className={selectField + " mt-1"}
                >
                  <option value="">Select a store owner</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                {editFormErrors.ownerId && (
                  <p className="mt-1 text-xs text-red-500">{editFormErrors.ownerId}</p>
                )}
              </div>
              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-2 font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50"
                >
                  {editLoading && (
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  )}
                  {editLoading ? 'Updating...' : 'Update Store'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 font-medium text-gray-900 transition bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores; 