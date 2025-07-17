# Time Tracking Backend Setup

## Overview

The time tracking backend provides API endpoints to save and manage timesheet data in MongoDB. It includes:

- **TimeEntry Model**: MongoDB schema for storing timesheet data
- **API Routes**: RESTful endpoints for CRUD operations
- **Frontend Integration**: Utility functions for API communication

## Database Schema

### TimeEntry Model

```typescript
{
  userId: string;           // User ID who created the timesheet
  weekStart: Date;          // Start of the week (Monday)
  weekEnd: Date;            // End of the week (Sunday)
  hours: number[];          // Array of 7 numbers (one for each day)
  notes: string;            // Optional notes
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;       // When timesheet was submitted
  approvedAt?: Date;        // When timesheet was approved
  approvedBy?: string;      // Who approved the timesheet
  createdAt: Date;          // When record was created
  updatedAt: Date;          // When record was last updated
}
```

## API Endpoints

### GET /api/time-entries
Get all time entries with optional filters:
- `userId`: Filter by user ID
- `status`: Filter by status (draft, submitted, approved, rejected)
- `weekStart`: Filter by week start date
- `weekEnd`: Filter by week end date

### POST /api/time-entries
Create a new time entry. Required fields:
- `userId`: User ID
- `weekStart`: Week start date
- `weekEnd`: Week end date
- `hours`: Array of 7 numbers (0-24 for each day)
- `notes`: Optional notes
- `status`: Entry status (defaults to 'draft')

### GET /api/time-entries/[id]
Get a specific time entry by ID.

### PUT /api/time-entries/[id]
Update an existing time entry.

### DELETE /api/time-entries/[id]
Delete a time entry.

## Frontend Integration

The frontend uses utility functions from `lib/api/timeEntries.ts`:

### Key Functions

- `saveDraft()`: Save timesheet as draft
- `submitTimesheet()`: Submit timesheet for approval
- `getTimeEntryForWeek()`: Load existing timesheet for a specific week
- `updateTimeEntry()`: Update existing timesheet
- `deleteTimeEntry()`: Delete timesheet

### Usage Example

```typescript
import { saveDraft, submitTimesheet } from '../../lib/api/timeEntries';

// Save as draft
const result = await saveDraft(
  userId,
  weekStart.toISOString(),
  weekEnd.toISOString(),
  [8, 8, 8, 8, 8, 0, 0], // 40 hours, Mon-Fri
  "Worked on project tasks"
);

// Submit for approval
const result = await submitTimesheet(
  userId,
  weekStart.toISOString(),
  weekEnd.toISOString(),
  [8, 8, 8, 8, 8, 0, 0],
  "Completed weekly tasks"
);
```

## Features

### Data Validation
- Hours must be an array of exactly 7 numbers
- Each hour value must be between 0 and 24
- User can only have one timesheet per week
- Required fields validation

### Status Management
- **Draft**: Work in progress, can be edited
- **Submitted**: Sent for approval, cannot be edited
- **Approved**: Approved by manager/admin
- **Rejected**: Rejected, can be resubmitted

### Error Handling
- Comprehensive error messages
- Validation error details
- Duplicate entry prevention
- Network error handling

## Database Indexes

The following indexes are created for performance:
- `{ userId: 1, weekStart: 1 }` (unique) - Prevents duplicate entries
- `{ userId: 1 }` - Fast user queries
- `{ status: 1 }` - Fast status filtering
- `{ weekStart: 1 }` - Fast date range queries

## Environment Setup

Ensure your `.env.local` file contains:
```env
MONGODB_URI=your_mongodb_connection_string
```

The backend will automatically connect to MongoDB when the API routes are accessed. 