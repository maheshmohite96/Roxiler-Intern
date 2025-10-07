import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
// import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, User, Mail, MapPin, Lock, Settings } from 'lucide-react';

const Profile = () => {
  const { user, updatePassword, updateProfile } = useAuth();
  const { isDark } = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      address: user?.address || '',
    },
  }); 

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm();

  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setIsLoading(true);
      await updatePassword(data.currentPassword, data.newPassword);
      resetPasswordForm();
    } catch (error) {
      console.error('Password update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'password', name: 'Change Password', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-lg shadow-sm p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-400">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
              }`}>Profile Settings</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Manage your account information and security</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`rounded-lg shadow-sm transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
          <nav className="flex px-6 -mb-px space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : isDark
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Full Name
                    </label>
                    <div className="relative mt-1 border-2 rounded-lg">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        className="w-full py-2 pl-10 input-field"
                        placeholder="Enter your full name"
                        {...registerProfile('name', {
                          required: 'Name is required',
                          minLength: {
                            value: 20,
                            message: 'Name must be at least 20 characters long',
                          },
                          maxLength: {
                            value: 60,
                            message: 'Name must not exceed 60 characters',
                          },
                        })}
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="form-error">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Email Address
                    </label>
                    <div className="relative py-2 mt-1 overflow-hidden border-2 rounded-lg">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 input-field bg-gray-50"
                      />
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Email cannot be changed</p>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Address
                    </label>
                    <div className="relative w-1/3 h-full mt-1 border-2 rounded-lg">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <textarea
                        id="address"
                        rows={3}
                        className="w-full h-full pb-2 pl-10 input-field"
                        placeholder="Enter your address"
                        {...registerProfile('address', {
                          required: 'Address is required',
                          maxLength: {
                            value: 400,
                            message: 'Address must not exceed 400 characters',
                          },
                        })}
                      />
                    </div>
                    {profileErrors.address && (
                      <p className="form-error">{profileErrors.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-white transition-colors duration-200 transform rounded-lg bg-emerald-500 hover:bg-emerald-600"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>Change Password</h3>
                <div className="space-y-4 ">
                  <div>
                    <label htmlFor="currentPassword" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Current Password
                    </label>
                    <div className="relative w-full border-2 rounded-lg">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="w-full py-2 pl-10 pr-10 input-field"
                        placeholder="Enter your current password"
                        {...registerPassword('currentPassword', {
                          required: 'Current password is required',
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="form-error">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      New Password
                    </label>
                    <div className="relative mt-1 border-2 rounded-lg">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        className="w-full py-2 pl-10 pr-10 input-field"
                        placeholder="Enter your new password"
                        {...registerPassword('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters long',
                          },
                          maxLength: {
                            value: 16,
                            message: 'Password must not exceed 16 characters',
                          },
                          pattern: {
                            value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
                            message: 'Password must include at least one uppercase letter and one special character',
                          },
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="form-error">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Confirm New Password
                    </label>
                    <div className="relative mt-1 border-2 rounded-lg">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full py-2 pl-10 pr-10 input-field"
                        placeholder="Confirm your new password"
                        {...registerPassword('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === newPassword || 'Passwords do not match',
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="form-error">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 