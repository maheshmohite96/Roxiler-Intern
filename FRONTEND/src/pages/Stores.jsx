import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../contexts/AuthContext';
import StoreCard from '../components/storeCard';

const Stores = () => {
  const { isUser } = useAuth();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [userRatingsCount, setUserRatingsCount] = useState(0);

  // Debounce search term to prevent API calls on every character
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      let rows = [];

      if (isUser) {
        // Try authenticated endpoint first
        try {
          const response = await axios.get('/api/stores/public/authenticated');
          rows = response?.data?.data || response?.data?.stores || [];
        } catch (authError) {
          console.log('Authenticated endpoint failed, falling back to public endpoint:', authError.message);
          // Fallback to public endpoint
          const response = await axios.get('/api/stores/public');
          rows = response?.data?.data || response?.data?.stores || [];
        }
      } else {
        // Use public endpoint for non-authenticated users
        const response = await axios.get('/api/stores/public');
        rows = response?.data?.data || response?.data?.stores || [];
      }

      setStores(rows);

      // Debug: Log the data to see what we're getting
      console.log('Stores data:', rows);
      console.log('User ratings in data:', rows.map(store => ({ id: store.id, name: store.name, user_rating: store.user_rating })));

      // Count user's ratings
      const ratingsCount = rows.filter(store => store.user_rating && parseFloat(store.user_rating) > 0).length;
      console.log('Calculated ratings count:', ratingsCount);
      setUserRatingsCount(ratingsCount);
    } catch (error) {
      toast.error('Failed to fetch stores: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  }, [isUser]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Filter and sort stores based on search term and sort options
  useEffect(() => {
    let filtered = [...stores];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(store =>
        (store.name || store.storeName || '').toLowerCase().includes(searchLower) ||
        (store.email || '').toLowerCase().includes(searchLower) ||
        (store.address || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = (a.name || a.storeName || '').toLowerCase();
          bValue = (b.name || b.storeName || '').toLowerCase();
          break;
        case 'average_rating':
          aValue = parseFloat(a.average_rating || 0);
          bValue = parseFloat(b.average_rating || 0);
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default:
          aValue = (a.name || a.storeName || '').toLowerCase();
          bValue = (b.name || b.storeName || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStores(filtered);
  }, [stores, debouncedSearchTerm, sortBy, sortOrder]);

  const handleRatingUpdate = (storeId, rating) => {
    // Update local state when rating is updated
    setStores(prevStores => {
      const updatedStores = prevStores.map(store =>
        store.id === storeId
          ? { ...store, user_rating: rating }
          : store
      );

      // Update ratings count based on all stores
      const newRatingsCount = updatedStores.filter(store =>
        store.user_rating && parseFloat(store.user_rating) > 0
      ).length;
      setUserRatingsCount(newRatingsCount);

      return updatedStores;
    });
  };


  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <div className="min-h-screen p-4 bg-sky-50 sm:p-6 lg:p-8">
      {/* The main container is centered and has a light blue background */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="panel bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stores 🏪</h1>
              <p className="text-gray-600">Browse and rate stores in the system</p>
            </div>
            {isUser && (
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm text-gray-500">Your Ratings</p>
                    <p className="text-3xl text-center font-bold text-indigo-600">
                      {userRatingsCount}
                    </p>
                  </div>
                  <button
                    onClick={fetchStores}
                    disabled={loading}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh ratings count"
                  >
                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="panel bg-white shadow-lg rounded-xl p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute w-5 h-5 pt-1 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                  <div className="w-4 h-4 border-b-2 rounded-full animate-spin border-indigo-500"></div>
                </div>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg input-field focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="name">Sort by Name</option>
              <option value="average_rating">Sort by Rating</option>
              <option value="created_at">Sort by Date</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-lg input-field focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <div className="flex items-center text-sm text-gray-600">
              <p>
                <span className="font-semibold text-indigo-600">
                  {filteredStores.length}
                </span>{' '}
                store{filteredStores.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onRatingUpdate={handleRatingUpdate}
              isUser={isUser}
              showActions={true}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredStores.length === 0 && !loading && (
          <div className="p-12 text-center bg-white shadow-lg rounded-xl">
            <Store className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
            <h3 className="mb-2 text-xl font-medium text-gray-900">
              No stores found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Try adjusting your search criteria.'
                : 'No stores are currently registered.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;