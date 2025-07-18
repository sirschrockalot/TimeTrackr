import { ITeamMember } from '../../models/TeamMember';

export interface CreateTeamMemberData {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'inactive' | 'pending';
  department: string;
  position: string;
  joinDate?: Date;
  phone?: string;
  location?: string;
  skills?: string[];
  bio?: string;
  avatar?: string;
  isGoogleUser?: boolean;
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {}

export interface TeamMembersResponse {
  success: boolean;
  data: ITeamMember[];
  count: number;
}

export interface TeamMemberResponse {
  success: boolean;
  data: ITeamMember;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
}

// Get all team members with optional filters
export async function getTeamMembers(filters?: {
  department?: string;
  role?: string;
  status?: string;
  search?: string;
}): Promise<TeamMembersResponse> {
  const params = new URLSearchParams();
  
  if (filters?.department) params.append('department', filters.department);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  
  const response = await fetch(`/api/team-members?${params.toString()}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch team members');
  }
  
  return data;
}

// Get a single team member by ID
export async function getTeamMember(id: string): Promise<TeamMemberResponse> {
  const response = await fetch(`/api/team-members/${id}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch team member');
  }
  
  return data;
}

// Create a new team member
export async function createTeamMember(teamMemberData: CreateTeamMemberData): Promise<TeamMemberResponse> {
  const response = await fetch('/api/team-members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teamMemberData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create team member');
  }
  
  return data;
}

// Update a team member
export async function updateTeamMember(id: string, teamMemberData: UpdateTeamMemberData): Promise<TeamMemberResponse> {
  const response = await fetch(`/api/team-members/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teamMemberData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update team member');
  }
  
  return data;
}

// Delete a team member
export async function deleteTeamMember(id: string): Promise<ApiResponse> {
  const response = await fetch(`/api/team-members/${id}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete team member');
  }
  
  return data;
}

// Get team member statistics
export async function getTeamMemberStats() {
  const response = await fetch('/api/team-members');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch team member statistics');
  }
  
  const teamMembers = data.data;
  
  const stats = {
    total: teamMembers.length,
    byRole: {
      admin: teamMembers.filter((member: ITeamMember) => member.role === 'admin').length,
      manager: teamMembers.filter((member: ITeamMember) => member.role === 'manager').length,
      employee: teamMembers.filter((member: ITeamMember) => member.role === 'employee').length,
    },
    byStatus: {
      active: teamMembers.filter((member: ITeamMember) => member.status === 'active').length,
      inactive: teamMembers.filter((member: ITeamMember) => member.status === 'inactive').length,
      pending: teamMembers.filter((member: ITeamMember) => member.status === 'pending').length,
    },
    byDepartment: teamMembers.reduce((acc: any, member: ITeamMember) => {
      acc[member.department] = (acc[member.department] || 0) + 1;
      return acc;
    }, {}),
  };
  
  return stats;
} 