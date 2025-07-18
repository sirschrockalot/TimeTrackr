"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Clock,
  Target,
  TrendingUp,
  UserCheck,
  UserX,
  Crown,
  Shield,
  User,
  Mail,
  Key,
} from "lucide-react";
import {
  getTeamMembers,
  deleteTeamMember,
  createTeamMember,
  updateTeamMember,
} from "../../lib/api/teamMembers";
import { useCombinedAuth } from "../hooks/useCombinedAuth";

export default function TeamPage() {
  const { user: currentUser, isAuthenticated } = useCombinedAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showManageGoogleUserModal, setShowManageGoogleUserModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "employee",
    department: "Presidential Digs Real Estate",
    position: "",
    status: "active",
  });
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [googleUserForm, setGoogleUserForm] = useState({
    email: "",
    role: "employee",
    department: "Presidential Digs Real Estate",
    position: "",
    status: "active",
  });

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Fetch team members
  useEffect(() => {
    setLoading(true);
    getTeamMembers()
      .then((res) => setTeamMembers(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Fetch online users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch('/api/online-users');
        const data = await res.json();
        if (data.success) {
          setOnlineUsers(data.users);
        }
      } catch (err) {
        // Ignore error for now
      }
    };
    fetchOnlineUsers();
    // Optionally, poll every 10 seconds
    const interval = setInterval(fetchOnlineUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;
    try {
      await deleteTeamMember(id);
      setTeamMembers((prev) => prev.filter((m) => m._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInviteForm({ ...inviteForm, [e.target.name]: e.target.value });
  };

  const handleGoogleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setGoogleUserForm({ ...googleUserForm, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const requiredFieldsFilled =
    inviteForm.name.trim() !== '' &&
    inviteForm.email.trim() !== '' &&
    validateEmail(inviteForm.email) &&
    inviteForm.role.trim() !== '' &&
    inviteForm.position.trim() !== '' &&
    inviteForm.status.trim() !== '';

  const googleUserFieldsFilled =
    googleUserForm.email.trim() !== '' &&
    validateEmail(googleUserForm.email) &&
    googleUserForm.role.trim() !== '' &&
    googleUserForm.position.trim() !== '' &&
    googleUserForm.status.trim() !== '';

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    if (!requiredFieldsFilled) {
      setInviteError('Please fill in all required fields with valid values.');
      setInviteLoading(false);
      return;
    }
    if (!validateEmail(inviteForm.email)) {
      setInviteError('Please enter a valid email address.');
      setInviteLoading(false);
      return;
    }
    try {
      const res = await createTeamMember({
        ...inviteForm,
        role: inviteForm.role as "employee" | "manager" | "admin",
        status: inviteForm.status as "active" | "inactive" | "pending"
      });
      setTeamMembers((prev) => [res.data, ...prev]);
      setShowInviteModal(false);
      setInviteForm({
        name: "",
        email: "",
        role: "employee",
        department: "Presidential Digs Real Estate",
        position: "",
        status: "active",
      });
      setInviteSuccess('Team member invited successfully!');
      setTimeout(() => setInviteSuccess(null), 3000);
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleGoogleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    
    if (!googleUserFieldsFilled) {
      setInviteError('Please fill in all required fields with valid values.');
      setInviteLoading(false);
      return;
    }
    
    if (!validateEmail(googleUserForm.email)) {
      setInviteError('Please enter a valid email address.');
      setInviteLoading(false);
      return;
    }

    try {
      // Check if user already exists in team members
      const existingMember = teamMembers.find(m => m.email === googleUserForm.email);
      
      if (existingMember) {
        // Update existing member with new role/position
        const res = await updateTeamMember(existingMember._id, {
          role: googleUserForm.role as "employee" | "manager" | "admin",
          department: googleUserForm.department,
          position: googleUserForm.position,
          status: googleUserForm.status as "active" | "inactive" | "pending"
        });
        
        setTeamMembers((prev) => 
          prev.map(m => m._id === existingMember._id ? res.data : m)
        );
        setInviteSuccess('Google user role updated successfully!');
      } else {
        // Create new team member record for Google user
        const res = await createTeamMember({
          name: `Google User (${googleUserForm.email})`, // Placeholder name
          email: googleUserForm.email,
          role: googleUserForm.role as "employee" | "manager" | "admin",
          department: googleUserForm.department,
          position: googleUserForm.position,
          status: googleUserForm.status as "active" | "inactive" | "pending",
          isGoogleUser: true
        });
        
        setTeamMembers((prev) => [res.data, ...prev]);
        setInviteSuccess('Google user added to team successfully!');
      }
      
      setShowManageGoogleUserModal(false);
      setGoogleUserForm({
        email: "",
        role: "employee",
        department: "Presidential Digs Real Estate",
        position: "",
        status: "active",
      });
      setTimeout(() => setInviteSuccess(null), 3000);
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="nav-icon" size={16} />;
      case "manager":
        return <Shield className="nav-icon" size={16} />;
      case "employee":
        return <User className="nav-icon" size={16} />;
      default:
        return <User className="nav-icon" size={16} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#4E9CF5";
      case "manager":
        return "#F59E0B";
      case "employee":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="nav-icon" size={16} />;
      case "away":
        return <UserX className="nav-icon" size={16} />;
      default:
        return <UserCheck className="nav-icon" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "away":
        return "#EF4444";
      default:
        return "#10B981";
    }
  };

  const roleDistribution = {
    admins: teamMembers.filter((m) => m.role === "admin").length,
    managers: teamMembers.filter((m) => m.role === "manager").length,
    employees: teamMembers.filter((m) => m.role === "employee").length,
  };

  // Helper to determine if a member is online
  const isMemberOnline = (member: any) => onlineUsers.includes(member.email);

  if (loading) return <div>Loading team members...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <h1 className="title-large">Team Management</h1>
        <p className="body-text">Manage your team members, roles, and permissions</p>
        {isAdmin && (
          <div style={{ float: "right", marginTop: -48, display: "flex", gap: 12 }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowManageGoogleUserModal(true)}
            >
              <Key size={16} /> Manage Google User
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus size={16} /> Invite Member
            </button>
          </div>
        )}
      </div>
      {inviteSuccess && (
        <div style={{ background: '#10B981', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
          {inviteSuccess}
        </div>
      )}

      {/* Team Statistics */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Total Members</div>
              <div className="stat-value">{teamMembers.length}</div>
              <div className="label-text" style={{ color: "#10B981", fontSize: 12 }}>
                +2 this month
              </div>
            </div>
            <div className="stat-icon">
              <Users className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Active Projects</div>
              <div className="stat-value">8</div>
              <div className="label-text" style={{ color: "#10B981", fontSize: 12 }}>
                +1 this week
              </div>
            </div>
            <div className="stat-icon">
              <Target className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Avg. Utilization</div>
              <div className="stat-value">78%</div>
              <div className="label-text" style={{ color: "#F59E0B", fontSize: 12 }}>
                -3% vs last month
              </div>
            </div>
            <div className="stat-icon">
              <TrendingUp className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Total Hours</div>
              <div className="stat-value">1,247h</div>
              <div className="label-text" style={{ color: "#10B981", fontSize: 12 }}>
                +156h this month
              </div>
            </div>
            <div className="stat-icon">
              <Clock className="nav-icon" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Users className="nav-icon" size={20} />
            <h2 className="title-medium">Team Members</h2>
          </div>
        </div>
        <div className="card-content" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%" }}>
              <thead style={{ background: "#242435" }}>
                <tr>
                  <th style={thStyle}>Member</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Projects</th>
                  <th style={thStyle}>Hours This Week</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, index) => (
                  <tr key={member._id} style={{ borderBottom: index < teamMembers.length - 1 ? "1px solid #2A2A3A" : "none" }}>
                    <td style={tdStyle}>
                      <div className="flex items-center">
                        <div
                          className="user-avatar"
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: member.avatarColor || "#4E9CF5",
                            marginRight: 16,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {member.isGoogleUser ? (
                            <Key size={16} />
                          ) : (
                            member.avatar || member.name?.split(" ").map((n: string) => n[0]).join("")
                          )}
                        </div>
                        <div>
                          <div className="body-text" style={{ color: "#F3F3F5", fontWeight: 500 }}>
                            {member.name}
                            {member.isGoogleUser && (
                              <span style={{ marginLeft: 8, fontSize: 12, color: "#F59E0B" }}>
                                (Google)
                              </span>
                            )}
                          </div>
                          <div className="label-text">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span className="label-text" style={{
                          color: getRoleColor(member.role),
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "capitalize"
                        }}>
                          {member.role}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(isMemberOnline(member) ? "active" : "inactive")}
                        <span className="label-text" style={{
                          color: getStatusColor(isMemberOnline(member) ? "active" : "inactive"),
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "capitalize"
                        }}>
                          {isMemberOnline(member) ? "active" : "inactive"}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {member.projects ?? "-"}
                    </td>
                    <td style={{ ...tdStyle, color: "#4E9CF5", fontWeight: 500 }}>
                      {member.hoursThisWeek ?? "-"}h
                    </td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", fontSize: 12 }}
                          onClick={() => setSelectedMember(member._id)}
                        >
                          <Edit size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", fontSize: 12, color: "#EF4444" }}
                            onClick={() => handleDelete(member._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Users className="nav-icon" size={20} />
            <h3 className="title-medium">Role Distribution</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="content-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 24 }}>
            <div className="text-center">
              <div className="stat-value" style={{ color: "#4E9CF5", marginBottom: 8 }}>{roleDistribution.admins}</div>
              <div className="label-text">Admins</div>
            </div>
            <div className="text-center">
              <div className="stat-value" style={{ color: "#F59E0B", marginBottom: 8 }}>{roleDistribution.managers}</div>
              <div className="label-text">Managers</div>
            </div>
            <div className="text-center">
              <div className="stat-value" style={{ color: "#6B7280", marginBottom: 8 }}>{roleDistribution.employees}</div>
              <div className="label-text">Employees</div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && isAdmin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowInviteModal(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleInviteSubmit}
            style={{
              background: "#1E1E2E",
              borderRadius: 12,
              padding: 32,
              minWidth: 340,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              color: "#F3F3F5",
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Invite New Team Member</h2>
            {inviteError && <div style={{ color: "#EF4444", marginBottom: 8 }}>{inviteError}</div>}
            <div style={{ marginBottom: 12 }}>
              <label>Name</label>
              <input
                name="name"
                value={inviteForm.name}
                onChange={handleInviteChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={inviteForm.email}
                onChange={handleInviteChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Role</label>
              <select
                name="role"
                value={inviteForm.role}
                onChange={handleInviteChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Department</label>
              <input
                name="department"
                value={inviteForm.department}
                onChange={handleInviteChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Position</label>
              <select
                name="position"
                value={inviteForm.position}
                onChange={handleInviteChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              >
                <option value="">Select a position</option>
                <option value="Owner">Owner</option>
                <option value="Acquisition Manager">Acquisition Manager</option>
                <option value="Lead Manager">Lead Manager</option>
                <option value="Dispositions Manager">Dispositions Manager</option>
                <option value="Dispo Lead">Dispo Lead</option>
                <option value="Transaction Coordinator">Transaction Coordinator</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Status</label>
              <select
                name="status"
                value={inviteForm.status}
                onChange={handleInviteChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowInviteModal(false)}
                disabled={inviteLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviteLoading || !requiredFieldsFilled}
              >
                {inviteLoading ? "Inviting..." : "Invite"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Google User Modal */}
      {showManageGoogleUserModal && isAdmin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowManageGoogleUserModal(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleGoogleUserSubmit}
            style={{
              background: "#1E1E2E",
              borderRadius: 12,
              padding: 32,
              minWidth: 340,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              color: "#F3F3F5",
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Manage Google OAuth User</h2>
            <p style={{ marginBottom: 16, fontSize: 14, color: "#8E8EA8" }}>
              Assign roles and permissions to Google OAuth users
            </p>
            {inviteError && <div style={{ color: "#EF4444", marginBottom: 8 }}>{inviteError}</div>}
            <div style={{ marginBottom: 12 }}>
              <label>Google User Email</label>
              <input
                name="email"
                type="email"
                value={googleUserForm.email}
                onChange={handleGoogleUserChange}
                required
                placeholder="user@gmail.com"
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Role</label>
              <select
                name="role"
                value={googleUserForm.role}
                onChange={handleGoogleUserChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Department</label>
              <input
                name="department"
                value={googleUserForm.department}
                onChange={handleGoogleUserChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Position</label>
              <select
                name="position"
                value={googleUserForm.position}
                onChange={handleGoogleUserChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              >
                <option value="">Select a position</option>
                <option value="Owner">Owner</option>
                <option value="Acquisition Manager">Acquisition Manager</option>
                <option value="Lead Manager">Lead Manager</option>
                <option value="Dispositions Manager">Dispositions Manager</option>
                <option value="Dispo Lead">Dispo Lead</option>
                <option value="Transaction Coordinator">Transaction Coordinator</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Status</label>
              <select
                name="status"
                value={googleUserForm.status}
                onChange={handleGoogleUserChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #2A2A3A", background: "#242435", color: "#F3F3F5" }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowManageGoogleUserModal(false)}
                disabled={inviteLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviteLoading || !googleUserFieldsFilled}
              >
                {inviteLoading ? "Processing..." : "Assign Role"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "12px 24px",
  textAlign: "left" as const,
  fontSize: 12,
  fontWeight: 500,
  color: "#8E8EA8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em"
};

const tdStyle = {
  padding: "16px 24px",
  whiteSpace: "nowrap" as const,
  color: "#C2C2CC"
};