"use client";

import { useCombinedAuth } from "../../hooks/useCombinedAuth";
import { useSession } from "next-auth/react";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthDebug() {
  const combinedAuth = useCombinedAuth();
  const { data: session, status } = useSession();
  const authContext = useAuth();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#1E1E2E',
      border: '1px solid #3E3E50',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '400px',
      fontSize: '12px',
      color: '#F3F3F5',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#4E9CF5' }}>Auth Debug</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>NextAuth Session:</strong>
        <pre style={{ margin: '4px 0', fontSize: '10px', color: '#8E8EA8' }}>
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>NextAuth Status:</strong> {status}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>AuthContext User:</strong>
        <pre style={{ margin: '4px 0', fontSize: '10px', color: '#8E8EA8' }}>
          {JSON.stringify(authContext.user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Combined User:</strong>
        <pre style={{ margin: '4px 0', fontSize: '10px', color: '#8E8EA8' }}>
          {JSON.stringify(combinedAuth.user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Is Google User:</strong> {combinedAuth.isGoogleUser ? 'Yes' : 'No'}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Is Authenticated:</strong> {combinedAuth.isAuthenticated ? 'Yes' : 'No'}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Is Loading:</strong> {combinedAuth.isLoading ? 'Yes' : 'No'}
      </div>
    </div>
  );
} 