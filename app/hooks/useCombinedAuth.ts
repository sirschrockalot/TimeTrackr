"use client";

import { useAuth } from "../contexts/AuthContext";
import { useSession } from "next-auth/react";

export interface CombinedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  image?: string;
  isGoogleUser: boolean;
}

export const useCombinedAuth = () => {
  const { user: authUser, isAuthenticated, isLoading: authLoading, ...authContext } = useAuth();
  const { data: session, status } = useSession();

  // Debug logging
  console.log('useCombinedAuth Debug:', {
    session,
    status,
    authUser,
    isAuthenticated,
    authLoading
  });

  // Determine which user data to use
  const user: CombinedUser | null = (() => {
    if (session?.user) {
      console.log('Using NextAuth session user:', session.user);
      // NextAuth session takes precedence (Google OAuth)
      return {
        id: session.user.id || session.user.email || 'unknown',
        name: session.user.name || 'Unknown User',
        email: session.user.email || '',
        role: (session.user as any).role || 'employee',
        image: session.user.image || undefined,
        avatar: session.user.image || undefined,
        isGoogleUser: true,
      };
    } else if (authUser) {
      console.log('Using AuthContext user:', authUser);
      // Fall back to AuthContext user (traditional login)
      return {
        ...authUser,
        image: authUser.avatar,
        isGoogleUser: false,
      };
    }
    console.log('No user found');
    return null;
  })();

  const isLoading = authLoading || status === "loading";
  const isAuthenticatedCombined = isAuthenticated || !!session;

  return {
    user,
    isAuthenticated: isAuthenticatedCombined,
    isLoading,
    isGoogleUser: !!session?.user,
    ...authContext,
  };
}; 