"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register, error, clearError } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        company: formData.company || undefined
      });
      router.push("/dashboard");
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-[#8E8EA8]">
            Join TimeTrackr and start tracking your productivity
          </p>
        </div>

        {error && (
          <div className="bg-[#EF4444] bg-opacity-10 border border-[#EF4444] rounded-md p-4">
            <p className="text-[#EF4444] text-sm">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#8E8EA8]">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#4E9CF5] focus:border-[#4E9CF5] focus:z-10 sm:text-sm placeholder-[#8E8EA8] text-[#F3F3F5] bg-[#2A2A3A] ${
                    errors.firstName ? "border-[#EF4444]" : "border-[#3E3E50]"
                  }`}
                  placeholder="First name"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-[#EF4444]">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#8E8EA8]">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#4E9CF5] focus:border-[#4E9CF5] focus:z-10 sm:text-sm placeholder-[#8E8EA8] text-[#F3F3F5] bg-[#2A2A3A] ${
                    errors.lastName ? "border-[#EF4444]" : "border-[#3E3E50]"
                  }`}
                  placeholder="Last name"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-[#EF4444]">{errors.lastName}</p>
                )}
              </div>
            </div>
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
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#4E9CF5] focus:border-[#4E9CF5] focus:z-10 sm:text-sm placeholder-[#8E8EA8] text-[#F3F3F5] bg-[#2A2A3A] ${
                  errors.email ? "border-[#EF4444]" : "border-[#3E3E50]"
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#8E8EA8]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#4E9CF5] focus:border-[#4E9CF5] focus:z-10 sm:text-sm placeholder-[#8E8EA8] text-[#F3F3F5] bg-[#2A2A3A] ${
                  errors.password ? "border-[#EF4444]" : "border-[#3E3E50]"
                }`}
                placeholder="Create a password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#8E8EA8]">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#4E9CF5] focus:border-[#4E9CF5] focus:z-10 sm:text-sm placeholder-[#8E8EA8] text-[#F3F3F5] bg-[#2A2A3A] ${
                  errors.confirmPassword ? "border-[#EF4444]" : "border-[#3E3E50]"
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.confirmPassword}</p>
              )}
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[#8E8EA8]">
                Company (optional)
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-[#3E3E50] rounded-md focus:outline-none focus:ring-[#4E9CF5] focus:border-[#4E9CF5] focus:z-10 sm:text-sm placeholder-[#8E8EA8] text-[#F3F3F5] bg-[#2A2A3A]"
                placeholder="Your company name"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              checked={formData.agreeTerms}
              onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
              className="h-4 w-4 text-[#4E9CF5] focus:ring-[#4E9CF5] border-[#3E3E50] rounded bg-[#2A2A3A]"
              disabled={isLoading}
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-[#C2C2CC]">
              I agree to the{" "}
              <a href="#" className="text-[#4E9CF5] hover:text-[#3E8BE0]">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#4E9CF5] hover:text-[#3E8BE0]">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-sm text-[#EF4444]">{errors.agreeTerms}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4E9CF5] hover:bg-[#3E8BE0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4E9CF5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-[#8E8EA8] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#4E9CF5] hover:text-[#3E8BE0]">
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
} 