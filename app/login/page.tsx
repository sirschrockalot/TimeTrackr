"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loginAsDemo, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'employee') => {
    clearError();
    
    try {
      await loginAsDemo(role);
      router.push("/dashboard");
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-[#121217] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-[#4E9CF5] to-[#1A73E8] rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">T</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-[#F3F3F5]">
            Sign in to TimeTrackr
          </h2>
          <p className="mt-2 text-center text-sm text-[#8E8EA8]">
            Track your time, manage projects, and boost productivity
          </p>
        </div>
        
        {error && (
          <div className="bg-[#EF4444] bg-opacity-10 border border-[#EF4444] rounded-md p-4">
            <p className="text-[#EF4444] text-sm">{error}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#8E8EA8]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-[#3E3E50] placeholder-[#8E8EA8] text-[#F3F3F5] bg-[#2A2A3A] rounded-md focus:outline-none focus:ring-[#4E9CF5] focus:border-[#4E9CF5] focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#8E8EA8]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-[#3E3E50] placeholder-[#8E8EA8] text-[#F3F3F5] bg-[#2A2A3A] rounded-md focus:outline-none focus:ring-[#4E9CF5] focus:border-[#4E9CF5] focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#4E9CF5] focus:ring-[#4E9CF5] border-[#3E3E50] rounded bg-[#2A2A3A]"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[#C2C2CC]">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-[#4E9CF5] hover:text-[#3E8BE0]">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4E9CF5] hover:bg-[#3E8BE0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4E9CF5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-[#8E8EA8] text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-[#4E9CF5] hover:text-[#3E8BE0]">
                Sign up
              </Link>
            </span>
          </div>
        </form>

        {/* Google Sign In */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2A3A]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#121217] text-[#8E8EA8]">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <GoogleSignInButton disabled={isLoading} />
          </div>
        </div>

        {/* Demo Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2A3A]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#121217] text-[#8E8EA8]">Or try demo</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button 
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-[#3E3E50] rounded-md shadow-sm bg-[#2A2A3A] text-sm font-medium text-[#F3F3F5] hover:bg-[#3E3E50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4E9CF5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Demo as Admin
            </button>
            <button 
              onClick={() => handleDemoLogin('employee')}
              disabled={isLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-[#3E3E50] rounded-md shadow-sm bg-[#2A2A3A] text-sm font-medium text-[#F3F3F5] hover:bg-[#3E3E50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4E9CF5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Demo as Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 