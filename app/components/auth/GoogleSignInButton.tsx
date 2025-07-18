"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

interface GoogleSignInButtonProps {
  disabled?: boolean;
}

export default function GoogleSignInButton({ disabled = false }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      style={{
        width: '100%',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#FFFFFF',
        border: '1px solid #DADCE0',
        borderRadius: '8px',
        color: '#3C4043',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: 'Roboto, Arial, sans-serif',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.12)',
        opacity: disabled || isLoading ? 0.6 : 1,
        textDecoration: 'none',
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.16)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.12)';
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid #4285F4';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 18 18" 
        style={{ marginRight: '12px' }}
      >
        <path
          fill="#4285F4"
          d="M17.785 9.169c0-.738-.06-1.276-.189-1.834h-8.42v3.328h4.842c-.1.828-.638 2.328-1.834 3.263l2.953 2.258c1.732-1.591 2.648-3.927 2.648-7.015z"
        />
        <path
          fill="#34A853"
          d="M9.175 17.938c2.479 0 4.558-.823 6.077-2.248l-2.953-2.258c-.823.551-1.877.857-3.124.857-2.402 0-4.437-1.624-5.163-3.806H1.254v2.332c1.48 2.941 4.524 4.123 7.921 4.123z"
        />
        <path
          fill="#FBBC05"
          d="M4.012 10.723c-.551-.165-1.163-.49-1.163-1.165s.612-1 1.163-1.165L6.254 8.2c.165.551.49 1.163 1.165 1.163s1-.612 1.165-1.163l2.242.807c-.551 1.732-1.624 3.124-3.124 3.124s-2.573-1.392-3.124-3.124z"
        />
        <path
          fill="#EA4335"
          d="M9.175 2.062c-1.624 0-2.748.551-3.124 1.165L3.809.415C5.328-.823 7.407-1.646 9.175-1.646c3.397 0 6.441 1.182 7.921 4.123L14.842 6.4c-.726-2.182-2.761-3.806-5.163-3.806z"
        />
      </svg>
      <span style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>
        {isLoading ? "Signing in..." : "Continue with Google"}
      </span>
    </button>
  );
} 