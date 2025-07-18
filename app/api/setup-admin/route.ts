import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import TeamMember from '../../../models/TeamMember';

// POST /api/setup-admin - Set up default admin user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const adminEmail = 'joel.schrock@presidentialdigs.com';
    
    // Check if admin already exists
    const existingAdmin = await TeamMember.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing user to ensure they have admin role
      const updatedAdmin = await TeamMember.findOneAndUpdate(
        { email: adminEmail },
        {
          role: 'admin',
          status: 'active',
          department: 'Presidential Digs Real Estate',
          position: 'Owner',
          isGoogleUser: true
        },
        { new: true }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        data: updatedAdmin
      });
    } else {
      // Create new admin user
      const adminUser = new TeamMember({
        name: 'Joel Schrock',
        email: adminEmail,
        role: 'admin',
        status: 'active',
        department: 'Presidential Digs Real Estate',
        position: 'Owner',
        joinDate: new Date(),
        isGoogleUser: true,
        skills: ['Leadership', 'Management', 'Real Estate'],
        bio: 'Owner and Administrator of Presidential Digs Real Estate'
      });
      
      await adminUser.save();
      
      return NextResponse.json({
        success: true,
        message: 'Default admin user created successfully',
        data: adminUser
      }, { status: 201 });
    }
    
  } catch (error: any) {
    console.error('Error setting up default admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set up default admin' },
      { status: 500 }
    );
  }
}

// GET /api/setup-admin - Check if admin exists
export async function GET() {
  try {
    await connectDB();
    
    const adminEmail = 'joel.schrock@presidentialdigs.com';
    const admin = await TeamMember.findOne({ email: adminEmail });
    
    return NextResponse.json({
      success: true,
      exists: !!admin,
      isAdmin: admin?.role === 'admin',
      data: admin
    });
    
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
} 