import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import TeamMember, { ITeamMember } from '../../../../models/TeamMember';

// GET /api/team-members/[id] - Get a specific team member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const teamMember = await TeamMember.findById(params.id).select('-__v');
    
    if (!teamMember) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: teamMember
    });
    
  } catch (error: any) {
    console.error('Error fetching team member:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid team member ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

// PUT /api/team-members/[id] - Update a team member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Check if email is being updated and if it already exists
    if (body.email) {
      const existingMember = await TeamMember.findOne({ 
        email: body.email.toLowerCase(),
        _id: { $ne: params.id }
      });
      
      if (existingMember) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
      
      body.email = body.email.toLowerCase();
    }
    
    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedTeamMember) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTeamMember,
      message: 'Team member updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating team member:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid team member ID' },
        { status: 400 }
      );
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE /api/team-members/[id] - Delete a team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const deletedTeamMember = await TeamMember.findByIdAndDelete(params.id);
    
    if (!deletedTeamMember) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid team member ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
} 