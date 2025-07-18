"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Search, Bell, User, Settings, LogOut, Sun, Moon, Menu, ChevronDown } from "lucide-react";
import { useCombinedAuth } from "../../hooks/useCombinedAuth";

interface Breadcrumb {
  label: string;
  path: string;
  isLast: boolean;
}

const Header = () => {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useCombinedAuth();
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): Breadcrumb[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
      breadcrumbs.push({ label, path: currentPath, isLast: index === segments.length - 1 });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsUserMenuOpen(false);
    }
  };

  // Remove dropdownPos and portal logic

  return (
    <>
      <header className="header">
        <div className="breadcrumbs">
          <Link href="/dashboard" className="breadcrumb">
            Dashboard
          </Link>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.path}>
              <span>/</span>
              {breadcrumb.isLast ? (
                <span className="breadcrumb active">{breadcrumb.label}</span>
              ) : (
                <Link href={breadcrumb.path} className="breadcrumb">
                  {breadcrumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="header-actions">
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search projects, tasks..."
            />
          </div>

          <button className="header-button">
            <Sun size={18} />
          </button>

          <button className="header-button">
            <Bell size={18} />
          </button>

          <div className="relative user-menu-container" ref={userMenuRef}>
            <button
              className="user-menu"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="user-menu-avatar">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={`${user.name}'s profile picture`}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = user ? getInitials(user.name) : "JD";
                    }}
                  />
                ) : (
                  user ? getInitials(user.name) : "JD"
                )}
              </div>
              <span>{user ? user.name : "John Doe"}</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

          </div>
        </div>
      </header>

      {/* User menu dropdown with inline styles */}
      {isUserMenuOpen && (
        <div style={{
          position: 'fixed',
          top: userMenuRef.current ? `${userMenuRef.current.getBoundingClientRect().bottom + 8}px` : '60px',
          left: userMenuRef.current ? `${userMenuRef.current.getBoundingClientRect().right - 224}px` : '20px',
          width: '224px',
          backgroundColor: '#1E1E2E',
          border: '1px solid #2A2A3A',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          color: '#F3F3F5'
        }}>
          <div style={{ padding: '8px 0' }}>
            {/* User Info Section */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #2A2A3A' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#4E9CF5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginRight: '12px',
                  overflow: 'hidden'
                }}>
                  {user?.image ? (
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
                        target.parentElement!.innerHTML = user ? getInitials(user.name) : "JD";
                      }}
                    />
                  ) : (
                    user ? getInitials(user.name) : "JD"
                  )}
                </div>
                <div>
                  <div style={{ color: '#F3F3F5', fontWeight: '500', fontSize: '14px' }}>
                    {user ? user.name : "John Doe"}
                  </div>
                  <div style={{ color: '#8E8EA8', fontSize: '12px' }}>
                    {user ? user.email : "john.doe@example.com"}
                  </div>
                </div>
              </div>
            </div>
            {/* Menu Items */}
            <div style={{ padding: '4px 0' }}>
              <Link
                href="/profile"
                onClick={() => setIsUserMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  color: '#C2C2CC',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242435'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={16} style={{ marginRight: '12px' }} />
                <span>Profile</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsUserMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  color: '#C2C2CC',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242435'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Settings size={16} style={{ marginRight: '12px' }} />
                <span>Settings</span>
              </Link>
            </div>
            {/* Divider */}
            <div style={{ borderTop: '1px solid #2A2A3A', margin: '4px 0' }}></div>
            {/* Logout */}
            <div style={{ padding: '4px 0' }}>
              <button
                onClick={() => {
                  handleLogout();
                  setIsUserMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px 16px',
                  color: '#EF4444',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242435'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} style={{ marginRight: '12px' }} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 