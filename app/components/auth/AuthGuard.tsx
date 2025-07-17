"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../shared/Sidebar";
import Header from "../shared/Header";
import MainContent from "../shared/MainContent";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/forgot-password"];

  // Role-based route restrictions
  const roleRestrictions = {
    "/projects": ["admin", "manager"],
    "/reports": ["admin", "manager"],
    "/team": ["admin", "manager"],
  };

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      if (!isAuthenticated && !isPublicRoute) {
        router.push("/login");
      } else if (isAuthenticated && isPublicRoute) {
        router.push("/dashboard");
      } else if (isAuthenticated && !isPublicRoute) {
        // Check role-based access
        const restrictedRoute = roleRestrictions[pathname as keyof typeof roleRestrictions];
        if (restrictedRoute && user && !restrictedRoute.includes(user.role)) {
          router.push("/dashboard");
        }
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121217] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-[#4E9CF5] to-[#1A73E8] rounded-lg flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-xl font-bold">T</span>
          </div>
          <div className="text-[#F3F3F5]">Loading...</div>
        </div>
      </div>
    );
  }

  // For public routes, render children directly
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // For protected routes, render with layout
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="app-container">
      <Sidebar />
      <MainContent>
        <Header />
        {children}
      </MainContent>
    </div>
  );
};

export default AuthGuard; 