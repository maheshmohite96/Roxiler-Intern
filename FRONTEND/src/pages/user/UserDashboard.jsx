import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logoutApi } from '../../services/auth';
import axios from 'axios';
import toast from 'react-hot-toast';
import StoreCard from '../../components/storeCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function UserDashboard() {
  const { isUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRatingsCount, setUserRatingsCount] = useState(0);

  // Debug: Log when component renders

  // Fetch stores data
  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/stores/public/authenticated');
      const storesData = response?.data?.data || response?.data?.stores || [];
      setStores(storesData);

      // Count user's ratings
      const ratingsCount = storesData.filter(store => store.user_rating && parseFloat(store.user_rating) > 0).length;
      setUserRatingsCount(ratingsCount);
    } catch (error) {
      toast.error('Failed to fetch stores: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

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

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutApi();
      window.location.href = '/';
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome! Browse and rate stores</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/user/profile"
              className="flex items-center px-6 py-3 space-x-2 text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>View Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${loggingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white`}
            >
              {loggingOut ? (
                <>
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                  </svg>
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 text-white bg-blue-500 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Browse Stores</p>
                <p className="text-2xl font-bold text-gray-900">Find & Rate</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 text-white bg-green-500 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{userRatingsCount}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 text-white bg-purple-500 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile</p>
                <p className="text-2xl font-bold text-gray-900">Manage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Welcome to Your Dashboard</h2>
          <p className="mb-6 text-gray-600">
            As a user, you can browse stores, rate them, and manage your profile.
            Use the navigation above to access different features.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              to="/user/stores"
              className="p-6 transition-colors duration-200 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700">Browse All Stores</h3>
                <p className="text-gray-500">View and rate stores in your area</p>
              </div>
            </Link>

            <Link
              to="/user/profile"
              className="p-6 transition-colors duration-200 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700">Manage Profile</h3>
                <p className="text-gray-500">Update your personal information</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Featured Stores Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Featured Stores</h2>
            <Link
              to="/user/stores"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Stores →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner className="h-64" />
          ) : stores.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stores.slice(0, 6).map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onRatingUpdate={handleRatingUpdate}
                  isUser={isUser}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stores available</h3>
              <p className="text-gray-600">There are currently no stores registered in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
