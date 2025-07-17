import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import TimeEntry from '../../../models/TimeEntry';

// GET /api/time-entries - Get time entries with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const weekStart = searchParams.get('weekStart');
    const weekEnd = searchParams.get('weekEnd');
    
    // Build query
    const query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (weekStart || weekEnd) {
      query.weekStart = {};
      if (weekStart) {
        query.weekStart.$gte = new Date(weekStart);
      }
      if (weekEnd) {
        query.weekStart.$lte = new Date(weekEnd);
      }
    }
    
    const timeEntries = await TimeEntry.find(query)
      .sort({ weekStart: -1 })
      .select('-__v');
    
    return NextResponse.json({
      success: true,
      data: timeEntries,
      count: timeEntries.length
    });
    
  } catch (error: any) {
    console.error('Error fetching time entries:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

// POST /api/time-entries - Create a new time entry
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const { userId, weekStart, weekEnd, hours, notes, status } = body;
    
    if (!userId || !weekStart || !weekEnd || !hours) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, weekStart, weekEnd, hours' },
        { status: 400 }
      );
    }
    
    // Validate hours array
    if (!Array.isArray(hours) || hours.length !== 7) {
      return NextResponse.json(
        { success: false, error: 'Hours must be an array of 7 numbers' },
        { status: 400 }
      );
    }
    
    // Check if entry already exists for this user and week
    const existingEntry = await TimeEntry.findOne({
      userId,
      weekStart: new Date(weekStart)
    });
    
    if (existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Time entry already exists for this week' },
        { status: 400 }
      );
    }
    
    // Create new time entry
    const timeEntry = new TimeEntry({
      userId,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      hours,
      notes: notes || '',
      status: status || 'draft',
      submittedAt: status === 'submitted' ? new Date() : undefined
    });
    
    await timeEntry.save();
    
    return NextResponse.json({
      success: true,
      data: timeEntry,
      message: 'Time entry created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating time entry:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Time entry already exists for this week' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
} 