import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import TeamMember, { ITeamMember } from '../../../models/TeamMember';

// GET /api/team-members - Get all team members
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build query filters
    const filters: any = {};
    
    if (department) filters.department = department;
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }
    
    const teamMembers = await TeamMember.find(filters)
      .sort({ createdAt: -1 })
      .select('-__v');
    
    return NextResponse.json({
      success: true,
      data: teamMembers,
      count: teamMembers.length
    });
    
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/team-members - Create a new team member
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const { name, email, department, position } = body;
    
    if (!name || !email || !department || !position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email, department, position' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingMember = await TeamMember.findOne({ email: email.toLowerCase() });
    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Create new team member
    const teamMember = new TeamMember({
      ...body,
      email: email.toLowerCase(),
      joinDate: body.joinDate || new Date()
    });
    
    await teamMember.save();
    
    return NextResponse.json({
      success: true,
      data: teamMember,
      message: 'Team member created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating team member:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    );
  }
} 