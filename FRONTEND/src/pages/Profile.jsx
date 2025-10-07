import { useState, useEffect } from 'react';
import { logoutApi } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
    const { user, isStoreOwner } = useAuth();

    // Profile data - different structure for users vs store owners
    const [profile, setProfile] = useState({
        storeName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        description: "",
        establishedYear: "",
        website: ""
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(profile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Password change states
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await logoutApi();
            window.location.href = '/';
        } catch (e) {
            setError(e.message || 'Failed to logout');
        } finally {
            setLoggingOut(false);
        }
    };

    // API functions
    const fetchProfile = async () => {
        try {
            setLoading(true);

            if (isStoreOwner) {
                // Store owner - fetch store profile
                const response = await fetch('/api/stores/profile', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setProfile(data.data);
                        setEditForm(data.data);
                    } else {
                        setError(data.message || 'Failed to fetch profile');
                    }
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to fetch profile');
                }
            } else {
                // Regular user - use current user data
                const userProfile = {
                    storeName: user?.fullName || user?.name || '',
                    ownerName: user?.fullName || user?.name || '',
                    email: user?.email || '',
                    phone: '',
                    address: user?.address || '',
                    description: '',
                    establishedYear: '',
                    website: ''
                };
                setProfile(userProfile);
                setEditForm(userProfile);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            if (isStoreOwner) {
                // Store owner - save to store profile endpoint
                const response = await fetch('/api/stores/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(editForm)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setProfile(editForm);
                    setIsEditing(false);
                    setSuccess(data.message || 'Profile saved successfully!');
                    setTimeout(() => setSuccess(null), 3000);
                } else {
                    // Handle validation errors
                    if (data.errors && Array.isArray(data.errors)) {
                        const errorMessages = data.errors.map(error => error.msg).join(', ');
                        setError(`Validation failed: ${errorMessages}`);
                    } else {
                        setError(data.message || 'Failed to save profile');
                    }
                }
            } else {
                // Regular user - save to user profile endpoint
                const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: editForm.storeName || editForm.ownerName,
                        address: editForm.address
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setProfile(editForm);
                    setIsEditing(false);
                    setSuccess(data.message || 'Profile saved successfully!');
                    setTimeout(() => setSuccess(null), 3000);
                } else {
                    // Handle validation errors
                    if (data.errors && Array.isArray(data.errors)) {
                        const errorMessages = data.errors.map(error => error.msg).join(', ');
                        setError(`Validation failed: ${errorMessages}`);
                    } else {
                        setError(data.message || 'Failed to save profile');
                    }
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Password change functions
    const handlePasswordChange = async () => {
        try {
            setChangingPassword(true);
            setError(null);
            setSuccess(null);

            // Client-side validation
            if (!passwordForm.currentPassword.trim()) {
                setError('Current password is required');
                return;
            }
            if (!passwordForm.newPassword.trim()) {
                setError('New password is required');
                return;
            }
            if (passwordForm.newPassword.length < 6) {
                setError('New password must be at least 6 characters long');
                return;
            }
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setError('New password and confirm password do not match');
                return;
            }

            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(data.message || 'Password changed successfully!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordChange(false);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(error => error.msg).join(', ');
                    setError(`Validation failed: ${errorMessages}`);
                } else {
                    setError(data.message || 'Failed to change password');
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setChangingPassword(false);
        }
    };

    const handlePasswordInputChange = (field, value) => {
        setPasswordForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Load profile data on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    // Profile editing functions
    const handleEdit = () => {
        setEditForm(profile);
        setIsEditing(true);
    };

    const handleSave = () => {
        // Basic client-side validation
        if (isStoreOwner) {
            // Store owner validation
            if (!editForm.storeName.trim()) {
                setError('Store name is required');
                return;
            }
            if (!editForm.ownerName.trim()) {
                setError('Owner name is required');
                return;
            }
            if (!editForm.email.trim()) {
                setError('Email is required');
                return;
            }
            if (!editForm.phone.trim()) {
                setError('Phone number is required');
                return;
            }
            if (!editForm.address.trim()) {
                setError('Address is required');
                return;
            }
        } else {
            // Regular user validation
            if (!editForm.storeName.trim() && !editForm.ownerName.trim()) {
                setError('Name is required');
                return;
            }
        }

        saveProfile();
    };

    const handleCancel = () => {
        setEditForm(profile);
        setIsEditing(false);
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-8 bg-orange-50">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-orange-500 rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-orange-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {isStoreOwner ? 'Store Profile' : 'User Profile'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {isStoreOwner ? 'Manage your store information and settings' : 'Manage your personal information'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 bg-gray-500 rounded-lg hover:bg-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${loggingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white`}
                        >
                            {loggingOut ? (
                                <>
                                    <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                                    <span>Logging out...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                                    </svg>
                                    <span>Logout</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="px-4 py-3 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="px-4 py-3 mb-6 text-green-700 bg-green-100 border border-green-400 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Profile Card */}
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold text-gray-700">
                            {isStoreOwner ? 'Store Information' : 'Personal Information'}
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={handleEdit}
                                className="flex items-center px-6 py-3 space-x-2 text-white transition-colors duration-200 bg-orange-500 rounded-lg hover:bg-orange-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${saving
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600'
                                        } text-white`}
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center px-6 py-3 space-x-2 text-white transition-colors duration-200 bg-gray-500 rounded-lg hover:bg-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Cancel</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-8">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-6">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        {isStoreOwner ? 'Store Name' : 'Full Name'}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.storeName}
                                            onChange={(e) => handleInputChange('storeName', e.target.value)}
                                            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">{profile.storeName}</p>
                                    )}
                                </div>

                                {isStoreOwner && (
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Owner Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.ownerName}
                                                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{profile.ownerName}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profile.email}</p>
                                    )}
                                </div>

                                {isStoreOwner && (
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{profile.phone}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {isStoreOwner && (
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Website</label>
                                        {isEditing ? (
                                            <input
                                                type="url"
                                                value={editForm.website}
                                                onChange={(e) => handleInputChange('website', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{profile.website}</p>
                                        )}
                                    </div>
                                )}

                                {isStoreOwner && (
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Established Year</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editForm.establishedYear}
                                                onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{profile.establishedYear}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        {isStoreOwner ? 'Store Address' : 'Address'}
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editForm.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profile.address}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Store Description - Only for store owners */}
                        {isStoreOwner && (
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Store Description</label>
                                {isEditing ? (
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Tell customers about your store..."
                                    />
                                ) : (
                                    <p className="leading-relaxed text-gray-900">{profile.description}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Password Change Section */}
                    <div className="pt-6 mt-8 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Security Settings</h3>
                            <button
                                onClick={() => setShowPasswordChange(!showPasswordChange)}
                                className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 bg-red-500 rounded-lg hover:bg-red-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span>{showPasswordChange ? 'Cancel' : 'Change Password'}</span>
                            </button>
                        </div>

                        {showPasswordChange && (
                            <div className="p-6 rounded-lg bg-gray-50">
                                <h4 className="mb-4 font-medium text-gray-700 text-md">Change Your Password</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Enter your current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Enter your new password"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Password must be at least 6 characters long and include uppercase letter and special character
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Confirm your new password"
                                        />
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handlePasswordChange}
                                            disabled={changingPassword}
                                            className={`px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${changingPassword
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-red-500 hover:bg-red-600'
                                                } text-white`}
                                        >
                                            {changingPassword ? (
                                                <>
                                                    <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                                                    <span>Changing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Change Password</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowPasswordChange(false);
                                                setPasswordForm({
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                });
                                            }}
                                            className="flex items-center px-6 py-3 space-x-2 text-white transition-colors duration-200 bg-gray-500 rounded-lg hover:bg-gray-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
