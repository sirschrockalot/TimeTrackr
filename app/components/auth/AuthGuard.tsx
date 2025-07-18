"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useSession } from "next-auth/react";
import Sidebar from "../shared/Sidebar";
import Header from "../shared/Header";
import MainContent from "../shared/MainContent";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is authenticated via either method
  const isUserAuthenticated = isAuthenticated || !!session;
  const isCheckingAuth = isLoading || status === "loading";

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/forgot-password"];

  // Role-based route restrictions
  const roleRestrictions = {
    "/projects": ["admin", "manager"],
    "/reports": ["admin", "manager"],
    "/team": ["admin", "manager"],
  };

  useEffect(() => {
    if (!isCheckingAuth) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      if (!isUserAuthenticated && !isPublicRoute) {
        router.push("/login");
      } else if (isUserAuthenticated && isPublicRoute) {
        router.push("/dashboard");
      } else if (isUserAuthenticated && !isPublicRoute) {
        // Check role-based access
        const currentUser = user || session?.user;
        const userRole = currentUser?.role || 'employee';
        const restrictedRoute = roleRestrictions[pathname as keyof typeof roleRestrictions];
        if (restrictedRoute && !restrictedRoute.includes(userRole)) {
          router.push("/dashboard");
        }
      }
    }
  }, [isUserAuthenticated, isCheckingAuth, pathname, router, user, session]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
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
  if (!isUserAuthenticated) {
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