"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Clock, Folder, BarChart, Users, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCombinedAuth } from "../../hooks/useCombinedAuth";
import { useLayout } from "../../contexts/LayoutContext";

const navItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard", roles: ["admin", "manager", "employee"] },
  { label: "Time Tracking", icon: Clock, href: "/time-tracking", roles: ["admin", "manager", "employee"] },
  { label: "Projects", icon: Folder, href: "/projects", roles: ["admin", "manager"] },
  { label: "Reports", icon: BarChart, href: "/reports", roles: ["admin", "manager"] },
  { label: "Team", icon: Users, href: "/team", roles: ["admin", "manager"] },
];

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useCombinedAuth();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useLayout();

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1E1E2E] border border-[#2A2A3A] rounded-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} color="#F3F3F5" /> : <Menu size={20} color="#F3F3F5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isSidebarCollapsed ? "w-16" : "w-64"} ${isMobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <Link href="/dashboard" className="logo">
              TimeTrackr
            </Link>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-1 rounded-md hover:bg-[#242435] transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={16} color="#8E8EA8" />
            ) : (
              <ChevronLeft size={16} color="#8E8EA8" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="nav-menu">
            {navItems
              .filter(item => !user || item.roles.includes(user.role))
              .map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={label} className="nav-item">
                    <Link
                      href={href}
                      onClick={handleNavClick}
                      className={`nav-link ${isActive ? "active" : ""}`}
                    >
                      <Icon className="nav-icon" size={24} />
                      {!isSidebarCollapsed && <span>{label}</span>}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="user-profile">
          <Link
            href="/profile"
            onClick={handleNavClick}
            className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "space-x-3"} hover:bg-[#242435] rounded-md p-2 transition-colors`}
          >
            <div className="user-avatar">
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
            {!isSidebarCollapsed && (
              <div className="user-info">
                <div className="user-name">{user ? user.name : "John Doe"}</div>
                <div className="user-role">{user ? getRoleLabel(user.role) : "Admin"}</div>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 