import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import TimeEntry from '../../../../models/TimeEntry';

// GET /api/time-entries/[id] - Get a specific time entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const timeEntry = await TimeEntry.findById(params.id).select('-__v');
    
    if (!timeEntry) {
      return NextResponse.json(
        { success: false, error: 'Time entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: timeEntry
    });
    
  } catch (error: any) {
    console.error('Error fetching time entry:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid time entry ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time entry' },
      { status: 500 }
    );
  }
}

// PUT /api/time-entries/[id] - Update a time entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate hours array if provided
    if (body.hours && (!Array.isArray(body.hours) || body.hours.length !== 7)) {
      return NextResponse.json(
        { success: false, error: 'Hours must be an array of 7 numbers' },
        { status: 400 }
      );
    }
    
    // Check if updating status to submitted
    if (body.status === 'submitted' && !body.submittedAt) {
      body.submittedAt = new Date();
    }
    
    const updatedTimeEntry = await TimeEntry.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedTimeEntry) {
      return NextResponse.json(
        { success: false, error: 'Time entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTimeEntry,
      message: 'Time entry updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating time entry:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid time entry ID' },
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
      { success: false, error: 'Failed to update time entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/time-entries/[id] - Delete a time entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const deletedTimeEntry = await TimeEntry.findByIdAndDelete(params.id);
    
    if (!deletedTimeEntry) {
      return NextResponse.json(
        { success: false, error: 'Time entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Time entry deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting time entry:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid time entry ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
} 