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
    <div className="app-background" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #28283A 0%, #121217 75%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px'
    }}>
      <div style={{ 
        maxWidth: '480px', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Logo and Branding */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #4E9CF5 0%, #1A73E8 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(78, 156, 245, 0.3)',
            marginBottom: '24px'
          }}>
            <span style={{ 
              color: '#FFFFFF', 
              fontSize: '32px', 
              fontWeight: '700',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              T
            </span>
          </div>
          <h1 style={{ 
            color: '#FFFFFF', 
            fontSize: '32px', 
            fontWeight: '600',
            marginBottom: '12px',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            Welcome to TimeTrackr
          </h1>
          <p style={{ 
            color: '#C2C2CC', 
            fontSize: '16px',
            lineHeight: '1.5',
            maxWidth: '320px'
          }}>
            Sign in to track your time, manage projects, and boost productivity
          </p>
        </div>

        {/* Main Login Card */}
        <div className="card" style={{
          width: '100%',
          padding: '40px',
          marginBottom: '32px'
        }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ color: '#EF4444', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                color: '#8E8EA8',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #3E3E50',
                  borderRadius: '8px',
                  backgroundColor: '#2A2A3A',
                  color: '#F3F3F5',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4E9CF5';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#3E3E50';
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="password" style={{
                display: 'block',
                color: '#8E8EA8',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #3E3E50',
                  borderRadius: '8px',
                  backgroundColor: '#2A2A3A',
                  color: '#F3F3F5',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4E9CF5';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#3E3E50';
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#4E9CF5',
                    marginRight: '8px'
                  }}
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" style={{
                  color: '#C2C2CC',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Remember me
                </label>
              </div>

              <Link href="/forgot-password" style={{
                color: '#4E9CF5',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3E8BE0'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#4E9CF5'}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'linear-gradient(90deg, #4E9CF5 0%, #1A73E8 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(78, 156, 245, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.background = 'linear-gradient(90deg, #3E8BE0 0%, #166ACC 100%)';
                  (e.target as HTMLElement).style.boxShadow = '0 6px 16px rgba(78, 156, 245, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.background = 'linear-gradient(90deg, #4E9CF5 0%, #1A73E8 100%)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(78, 156, 245, 0.3)';
                }
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: '#2A2A3A'
            }} />
            <div style={{
              position: 'relative',
              textAlign: 'center'
            }}>
              <span style={{
                backgroundColor: '#1E1E2E',
                padding: '0 16px',
                color: '#8E8EA8',
                fontSize: '14px'
              }}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton disabled={isLoading} />
        </div>

        {/* Demo Login Card */}
        <div className="card" style={{
          width: '100%',
          padding: '32px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{
              color: '#F3F3F5',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Try the demo
            </h3>
            <p style={{
              color: '#8E8EA8',
              fontSize: '14px'
            }}>
              Experience TimeTrackr with sample data
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#2A2A3A',
                border: '1px solid #3E3E50',
                borderRadius: '8px',
                color: '#F3F3F5',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#3E3E50';
                  e.target.style.borderColor = '#5A5A6A';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#2A2A3A';
                  e.target.style.borderColor = '#3E3E50';
                }
              }}
            >
              Admin Demo
            </button>
            <button 
              onClick={() => handleDemoLogin('employee')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#2A2A3A',
                border: '1px solid #3E3E50',
                borderRadius: '8px',
                color: '#F3F3F5',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#3E3E50';
                  e.target.style.borderColor = '#5A5A6A';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#2A2A3A';
                  e.target.style.borderColor = '#3E3E50';
                }
              }}
            >
              Employee Demo
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px'
        }}>
          <span style={{
            color: '#8E8EA8',
            fontSize: '14px'
          }}>
            Don't have an account?{" "}
            <Link href="/register" style={{
              color: '#4E9CF5',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3E8BE0'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#4E9CF5'}
            >
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
} 