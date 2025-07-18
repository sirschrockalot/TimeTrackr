"use client";

import React, { useState, useEffect } from "react";
import { useCombinedAuth, CombinedUser } from "../hooks/useCombinedAuth";
import { useData } from "../contexts/DataContext";
import { 
  User, 
  Settings, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff,
  Camera,
  Save,
  Check,
  AlertCircle,
  Shield,
  Globe,
  Clock,
  FileText,
  Mail
} from "lucide-react";

const Profile = () => {
  const { user, updateUser, isGoogleUser } = useCombinedAuth();
  const { users } = useData();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    jobTitle: "",
    department: "",
    hourlyRate: 85,
    timezone: "UTC-8",
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    timerReminders: true,
    profileVisibility: "team",
    timeTrackingVisibility: "team",
    weeklyReports: true,
    projectUpdates: true,
  });

  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user data
  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = user.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      setProfileForm({
        firstName: firstName || "",
        lastName: lastName || "",
        email: user.email,
        phone: "+1 (555) 123-4567", // Mock data
        bio: "Senior software developer with 5+ years of experience in web development.",
        jobTitle: "Senior Developer",
        department: "Engineering",
        hourlyRate: 85,
        timezone: "UTC-8",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in context
      if (user) {
        await updateUser({
          id: user.id,
          name: `${profileForm.firstName} ${profileForm.lastName}`,
          email: profileForm.email,
          role: user.role as 'admin' | 'manager' | 'employee',
          avatar: user.avatar,
        });
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSettingChange = (setting: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#4E9CF5';
      case 'manager':
        return '#F59E0B';
      case 'employee':
        return '#6B7280';
      default:
        return '#4E9CF5';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'employee':
        return 'Employee';
      default:
        return 'User';
    }
  };



  if (!user) {
    return (
      <div className="page-content">
        <div className="flex items-center justify-center min-h-screen">
          <div className="body-text">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="title-large">Profile & Settings</h1>
        <p className="body-text">Manage your account and preferences</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className="card" style={{ 
          marginBottom: 24,
          borderColor: message.type === 'success' ? '#10B981' : '#EF4444',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
        }}>
          <div className="card-content">
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check size={16} color="#10B981" />
              ) : (
                <AlertCircle size={16} color="#EF4444" />
              )}
              <span className="body-text" style={{ 
                color: message.type === 'success' ? '#10B981' : '#EF4444' 
              }}>
                {message.text}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="content-grid">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <User className="nav-icon" size={20} />
                <h3 className="title-medium">Personal Information</h3>
              </div>
            </div>
            <div className="card-content">
              <form onSubmit={handleProfileSubmit} className="item-list" style={{ gap: 24 }}>
                <div className="content-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                  <div>
                    <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      className="body-text"
                      style={{
                        width: "100%",
                        height: 40,
                        border: "1px solid #3E3E50",
                        background: "#1E1E2E",
                        borderRadius: 6,
                        padding: 8,
                        color: "#F3F3F5",
                        outline: "none"
                      }}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      className="body-text"
                      style={{
                        width: "100%",
                        height: 40,
                        border: "1px solid #3E3E50",
                        background: "#1E1E2E",
                        borderRadius: 6,
                        padding: 8,
                        color: "#F3F3F5",
                        outline: "none"
                      }}
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="body-text"
                      style={{
                        width: "100%",
                        height: 40,
                        border: "1px solid #3E3E50",
                        background: "#1E1E2E",
                        borderRadius: 6,
                        padding: 8,
                        color: "#F3F3F5",
                        outline: "none"
                      }}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="body-text"
                      style={{
                        width: "100%",
                        height: 40,
                        border: "1px solid #3E3E50",
                        background: "#1E1E2E",
                        borderRadius: 6,
                        padding: 8,
                        color: "#F3F3F5",
                        outline: "none"
                      }}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="body-text"
                    style={{
                      width: "100%",
                      border: "1px solid #3E3E50",
                      background: "#1E1E2E",
                      borderRadius: 6,
                      padding: 8,
                      color: "#F3F3F5",
                      outline: "none",
                      resize: "vertical"
                    }}
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    <Save size={16} />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Google Profile Information */}
          {isGoogleUser && user?.image && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 'bold' }}>G</span>
                  </div>
                  <h3 className="title-medium">Google Profile</h3>
                </div>
              </div>
              <div className="card-content">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  padding: '16px',
                  background: 'rgba(66, 133, 244, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(66, 133, 244, 0.2)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #4285F4',
                    boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)'
                  }}>
                    <img
                      src={user.image}
                      alt={`${user.name}'s profile picture`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div style="
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 24px;
                            font-weight: bold;
                          ">
                            ${getInitials(user.name)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: '#F3F3F5',
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {user.name}
                    </h4>
                    <p style={{
                      color: '#8E8EA8',
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      {user.email}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        padding: '4px 8px',
                        background: 'rgba(66, 133, 244, 0.1)',
                        borderRadius: '4px',
                        border: '1px solid rgba(66, 133, 244, 0.3)'
                      }}>
                        <span style={{
                          color: '#4285F4',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          Google Account
                        </span>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        <span style={{
                          color: '#10B981',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(66, 133, 244, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(66, 133, 244, 0.1)'
                }}>
                  <p style={{
                    color: '#8E8EA8',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    margin: 0
                  }}>
                    <strong style={{ color: '#4285F4' }}>Note:</strong> Your profile information is synced from your Google account. 
                    To update your name or profile picture, please visit your{' '}
                    <a 
                      href="https://myaccount.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#4285F4',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Google Account settings
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Work Information */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Settings className="nav-icon" size={20} />
                <h3 className="title-medium">Work Information</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="content-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={profileForm.jobTitle}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="body-text"
                    style={{
                      width: "100%",
                      height: 40,
                      border: "1px solid #3E3E50",
                      background: "#1E1E2E",
                      borderRadius: 6,
                      padding: 8,
                      color: "#F3F3F5",
                      outline: "none"
                    }}
                    placeholder="Job title"
                  />
                </div>
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                    className="body-text"
                    style={{
                      width: "100%",
                      height: 40,
                      border: "1px solid #3E3E50",
                      background: "#1E1E2E",
                      borderRadius: 6,
                      padding: 8,
                      color: "#F3F3F5",
                      outline: "none"
                    }}
                    placeholder="Department"
                  />
                </div>
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    value={profileForm.hourlyRate}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    className="body-text"
                    style={{
                      width: "100%",
                      height: 40,
                      border: "1px solid #3E3E50",
                      background: "#1E1E2E",
                      borderRadius: 6,
                      padding: 8,
                      color: "#F3F3F5",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                    Time Zone
                  </label>
                  <select
                    value={profileForm.timezone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, timezone: e.target.value }))}
                    className="body-text"
                    style={{
                      width: "100%",
                      height: 40,
                      border: "1px solid #3E3E50",
                      background: "#1E1E2E",
                      borderRadius: 6,
                      padding: 8,
                      color: "#F3F3F5",
                      outline: "none"
                    }}
                  >
                    <option value="UTC-8">UTC-8 (Pacific Time)</option>
                    <option value="UTC-5">UTC-5 (Eastern Time)</option>
                    <option value="UTC+0">UTC+0 (GMT)</option>
                    <option value="UTC+1">UTC+1 (Central European Time)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Lock className="nav-icon" size={20} />
                <h3 className="title-medium">Change Password</h3>
              </div>
            </div>
            <div className="card-content">
              <form onSubmit={handlePasswordSubmit} className="item-list" style={{ gap: 16 }}>
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                      className="body-text"
                      style={{
                        width: "100%",
                        height: 40,
                        border: "1px solid #3E3E50",
                        background: "#1E1E2E",
                        borderRadius: 6,
                        padding: "8px 40px 8px 8px",
                        color: "#F3F3F5",
                        outline: "none"
                      }}
                      placeholder="Current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: '#8E8EA8' }}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                      className="body-text"
                      style={{
                        width: "100%",
                        height: 40,
                        border: "1px solid #3E3E50",
                        background: "#1E1E2E",
                        borderRadius: 6,
                        padding: "8px 40px 8px 8px",
                        color: "#F3F3F5",
                        outline: "none"
                      }}
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: '#8E8EA8' }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      className="body-text"
                      style={{
                        width: "100%",
                        height: 40,
                        border: "1px solid #3E3E50",
                        background: "#1E1E2E",
                        borderRadius: 6,
                        padding: "8px 40px 8px 8px",
                        color: "#F3F3F5",
                        outline: "none"
                      }}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: '#8E8EA8' }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    <Lock size={16} />
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <User className="nav-icon" size={20} />
                <h3 className="title-medium">Profile Picture</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="text-center">
                <div className="relative inline-block">
                  <div 
                    className="user-avatar"
                    style={{ 
                      width: 96, 
                      height: 96, 
                      backgroundColor: getRoleColor(user.role),
                      margin: "0 auto 16px",
                      fontSize: "24px",
                      fontWeight: "bold"
                    }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <button 
                    className="btn btn-secondary"
                    style={{ 
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      padding: "8px",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px"
                    }}
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <div className="item-list" style={{ gap: 8 }}>
                  <p className="body-text" style={{ color: '#F3F3F5', fontWeight: 500 }}>{user.name}</p>
                  <p className="label-text">{getRoleLabel(user.role)}</p>
                  <p className="label-text">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Bell className="nav-icon" size={20} />
                <h3 className="title-medium">Notifications</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="item-list" style={{ gap: 16 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="nav-icon" size={16} />
                    <span className="body-text">Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.emailNotifications}
                      onChange={() => handleSettingToggle('emailNotifications')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#2A2A3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E9CF5]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="nav-icon" size={16} />
                    <span className="body-text">Push Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.pushNotifications}
                      onChange={() => handleSettingToggle('pushNotifications')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#2A2A3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E9CF5]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="nav-icon" size={16} />
                    <span className="body-text">Timer Reminders</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.timerReminders}
                      onChange={() => handleSettingToggle('timerReminders')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#2A2A3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E9CF5]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Shield className="nav-icon" size={20} />
                <h3 className="title-medium">Privacy</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="item-list" style={{ gap: 16 }}>
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>Profile Visibility</label>
                  <select
                    value={settings.profileVisibility}
                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    className="body-text"
                    style={{
                      width: "100%",
                      height: 40,
                      border: "1px solid #3E3E50",
                      background: "#1E1E2E",
                      borderRadius: 6,
                      padding: 8,
                      color: "#F3F3F5",
                      outline: "none"
                    }}
                  >
                    <option value="public">Public</option>
                    <option value="team">Team Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>Time Tracking Visibility</label>
                  <select
                    value={settings.timeTrackingVisibility}
                    onChange={(e) => handleSettingChange('timeTrackingVisibility', e.target.value)}
                    className="body-text"
                    style={{
                      width: "100%",
                      height: 40,
                      border: "1px solid #3E3E50",
                      background: "#1E1E2E",
                      borderRadius: 6,
                      padding: 8,
                      color: "#F3F3F5",
                      outline: "none"
                    }}
                  >
                    <option value="team">Team Only</option>
                    <option value="managers">Managers Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Report Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <FileText className="nav-icon" size={20} />
                <h3 className="title-medium">Reports</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="item-list" style={{ gap: 16 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="nav-icon" size={16} />
                    <span className="body-text">Weekly Reports</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.weeklyReports}
                      onChange={() => handleSettingToggle('weeklyReports')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#2A2A3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E9CF5]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="nav-icon" size={16} />
                    <span className="body-text">Project Updates</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.projectUpdates}
                      onChange={() => handleSettingToggle('projectUpdates')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#2A2A3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E9CF5]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 