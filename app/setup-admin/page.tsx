"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, UserCheck, Key } from "lucide-react";

export default function SetupAdminPage() {
  const [adminStatus, setAdminStatus] = useState<{
    exists: boolean;
    isAdmin: boolean;
    data: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/setup-admin');
      const data = await response.json();
      
      if (data.success) {
        setAdminStatus(data);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const setupAdmin = async () => {
    setLoading(true);
    setSetupResult(null);
    
    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      setSetupResult({
        success: data.success,
        message: data.message
      });
      
      if (data.success) {
        // Refresh admin status
        await checkAdminStatus();
      }
    } catch (error) {
      setSetupResult({
        success: false,
        message: 'Failed to set up admin user'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121217] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1E1E2E] rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-[#4E9CF5] to-[#1A73E8] rounded-lg flex items-center justify-center shadow-lg mb-4">
              <Key className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#F3F3F5] mb-2">
              Admin Setup
            </h1>
            <p className="text-[#8E8EA8]">
              Set up default admin user for TimeTrackr
            </p>
          </div>

          {/* Admin Status */}
          {adminStatus && (
            <div className="mb-6 p-4 rounded-lg border border-[#2A2A3A]">
              <h3 className="text-[#F3F3F5] font-medium mb-3 flex items-center gap-2">
                <UserCheck size={16} />
                Admin Status
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {adminStatus.exists ? (
                    <CheckCircle className="text-green-500" size={16} />
                  ) : (
                    <AlertCircle className="text-yellow-500" size={16} />
                  )}
                  <span className="text-[#C2C2CC] text-sm">
                    User exists: {adminStatus.exists ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {adminStatus.exists && (
                  <div className="flex items-center gap-2">
                    {adminStatus.isAdmin ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <AlertCircle className="text-red-500" size={16} />
                    )}
                    <span className="text-[#C2C2CC] text-sm">
                      Admin role: {adminStatus.isAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                
                {adminStatus.data && (
                  <div className="mt-3 p-3 bg-[#242435] rounded text-sm">
                    <div className="text-[#F3F3F5] font-medium">
                      {adminStatus.data.name}
                    </div>
                    <div className="text-[#8E8EA8]">
                      {adminStatus.data.email}
                    </div>
                    <div className="text-[#8E8EA8]">
                      Role: {adminStatus.data.role} • Position: {adminStatus.data.position}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Setup Result */}
          {setupResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              setupResult.success 
                ? 'bg-green-900/20 border border-green-500/30' 
                : 'bg-red-900/20 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {setupResult.success ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <AlertCircle className="text-red-500" size={16} />
                )}
                <span className={`text-sm ${
                  setupResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {setupResult.message}
                </span>
              </div>
            </div>
          )}

          {/* Setup Button */}
          <button
            onClick={setupAdmin}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-[#2A2A3A] text-[#6B7280] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#4E9CF5] to-[#1A73E8] text-white hover:from-[#3B82F6] hover:to-[#1A73E8]'
            }`}
          >
            {loading ? 'Setting up...' : 'Set Up Default Admin'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-[#8E8EA8] text-sm">
              This will create/update the admin user for:
            </p>
            <p className="text-[#F3F3F5] font-medium">
              joel.schrock@presidentialdigs.com
            </p>
          </div>

          <div className="mt-6 p-4 bg-[#242435] rounded-lg">
            <h4 className="text-[#F3F3F5] font-medium mb-2">What this does:</h4>
            <ul className="text-[#8E8EA8] text-sm space-y-1">
              <li>• Creates admin user if it doesn't exist</li>
              <li>• Sets role to 'admin' and position to 'Owner'</li>
              <li>• Marks user as Google OAuth user</li>
              <li>• Enables full admin privileges in TimeTrackr</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 