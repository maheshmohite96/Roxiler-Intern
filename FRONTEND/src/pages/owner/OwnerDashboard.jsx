import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { logoutApi } from '../../services/auth';

export default function OwnerDashboard() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [userRatings, setUserRatings] = useState([]);
  const [user, setUser] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'rating'

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

  // Sample data for testing
  // const sampleRatings = [
  //   { id: 1, userName: 'John Doe', userEmail: 'john@example.com', rating: 5, comment: 'Excellent service and great products!', date: '2024-01-15' },
  //   { id: 2, userName: 'Jane Smith', userEmail: 'jane@example.com', rating: 4, comment: 'Good quality items, fast delivery', date: '2024-01-14' },
  //   { id: 3, userName: 'Mike Johnson', userEmail: 'mike@example.com', rating: 3, comment: 'Average experience, could be better', date: '2024-01-13' },
  // ];
  
  // Force sample data for testing
  // useEffect(() => {
  //   console.log('Using sample ratings data for testing');
  //   setUserRatings(sampleRatings);
  // }, []);  // Empty dependency array - only runs once

  const averageRating = userRatings.length
    ? userRatings.reduce((s, u) => s + u.rating, 0) / userRatings.length
    : 0;

  const renderStars = (rating) => (
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ))
  );

  useEffect(() => {

    const fetchUser = async () => {
      try {
        setLoading(true);
        const user = await fetch('/api/auth/me', { credentials: 'include' });
        if (!user.ok) {
          setUser(null);
          return;
        }
        const data = await user.json();
        if (data?.success) setUser(data.data);
        else setUser(null);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser(); // Call the fetchUser function

    // Fetch user ratings and store profile

    const fetchUserRatings = async () => {
      try {
        setLoading(true);
        console.log('Fetching ratings...');
        // First try to get all ratings for the store
        const userRating = await fetch('/api/owner/my-ratings', { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' 
        });
        
        if (!userRating.ok) {
          console.error('Error fetching ratings:', userRating.status);
          // Use sample data if API fails
          setUserRatings(sampleRatings);
          return;
        }
        
        const data = await userRating.json();
        console.log('Ratings data:', data);
        
        if (data?.success && data.data && data.data.ratings) {
          console.log('Setting ratings:', data.data.ratings);
          setUserRatings(data.data.ratings);
        } else {
          console.error('Invalid data format from API');
          setUserRatings(sampleRatings);
        }
      } catch (e) {
        console.error('Exception fetching ratings:', e);
        // Use sample data if API fails
        setUserRatings(sampleRatings);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRatings();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching store profile...');
        const res = await fetch('/api/stores/profile', { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' 
        });
        
        if (!res.ok) {
          console.error('Error fetching store profile:', res.status);
          setStore(null);
          return;
        }
        
        const data = await res.json();
        console.log('Store profile data:', data);
        
        if (data?.success && data.data) {
          setStore(data.data);
        } else {
          console.error('Invalid store profile data format');
          setStore(null);
        }
      } catch (e) {
        console.error('Exception fetching store profile:', e);
        setStore(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-orange-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">My Stores Dashboard</h2>
          <div className="flex gap-3">
            <Link
              to="/store-owner/profile"
              className="flex items-center px-6 py-3 space-x-2 text-white transition-colors duration-200 bg-orange-500 rounded-lg hover:bg-orange-600"
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

        {/* Header Card */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{store?.storeName || 'Your Store'}</h1>
              <p className="text-gray-600">Manage and monitor your store performance</p>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
            <Link to="/store-owner/profile" className="px-4 py-2 text-orange-700 border border-orange-200 rounded-lg btn-secondary bg-orange-50 hover:bg-orange-100">
              Edit Store
            </Link>
          </div>
          {loading ? (
            <div className="text-gray-600">Loading store...</div>
          ) : store ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{store.storeName}</h3>
                <div className="flex items-center mt-1 space-x-2 text-sm text-gray-600">{store.email}</div>
                <div className="flex items-center mt-1 space-x-2 text-sm text-gray-600">{store.address}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-2 space-x-2">
                  <span className="text-sm font-medium text-gray-700">Average Rating</span>
                  <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}/5</span>
                </div>
                <div className="flex items-center justify-end mb-2 space-x-2">{renderStars(Math.round(averageRating))}</div>
                <p className="text-sm text-gray-500">{userRatings.length} rating{userRatings.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">No store profile found. Go to Profile to create one.</div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 text-white bg-blue-500 rounded-lg">★</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 text-white bg-green-500 rounded-lg">👥</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{userRatings.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 texverhite bg-purple-500 rounded-lg">↗</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating >= 4 ? 'Excellent' : averageRating >= 3 ? 'Good' : averageRating >= 2 ? 'Fair' : 'Poor'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Customer Ratings */}
        <div className="p-6 bg-white rounded-lg shadow-sm border-2 border-orange-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-orange-600">All Customer Ratings</h2>
            <div className="flex items-center gap-4">
              
              <span className="text-sm text-gray-600">{userRatings.length} user{userRatings.length !== 1 ? 's' : ''} rated your store</span>
            </div>
          </div>
          {userRatings.length > 0 ? (
            <div className="space-y-4">
              {[...userRatings]
                .sort((a, b) => {
                  if (sortBy === 'date') {
                    return new Date(b.date) - new Date(a.date); // Most recent first
                  } else if (sortBy === 'rating') {
                    return b.rating - a.rating; // Highest rating first
                  }
                  return 0;
                })
                .map(rating => (
                <div key={rating.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 text-sm font-medium text-white bg-orange-500 rounded-full">
                          {rating.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{rating.userName}</p>
                          <p className="text-xs text-gray-500">{rating.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-2 space-x-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(rating.date).toLocaleDateString()} at {new Date(rating.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {rating.comment && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">{rating.comment}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-2 space-x-2">
                        {renderStars(rating.rating)}
                        <span className="text-sm font-medium text-gray-900">{rating.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-600">No ratings yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
