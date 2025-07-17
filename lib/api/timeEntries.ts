export interface TimeEntry {
  _id?: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  hours: number[];
  notes: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeEntryFilters {
  userId?: string;
  status?: string;
  weekStart?: string;
  weekEnd?: string;
}

// Get all time entries with optional filters
export async function getTimeEntries(filters: TimeEntryFilters = {}): Promise<{ success: boolean; data: TimeEntry[]; count: number; error?: string }> {
  try {
    const params = new URLSearchParams();
    
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.status) params.append('status', filters.status);
    if (filters.weekStart) params.append('weekStart', filters.weekStart);
    if (filters.weekEnd) params.append('weekEnd', filters.weekEnd);
    
    const response = await fetch(`/api/time-entries?${params.toString()}`);
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return {
      success: false,
      data: [],
      count: 0,
      error: 'Failed to fetch time entries'
    };
  }
}

// Get a specific time entry by ID
export async function getTimeEntry(id: string): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  try {
    const response = await fetch(`/api/time-entries/${id}`);
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('Error fetching time entry:', error);
    return {
      success: false,
      error: 'Failed to fetch time entry'
    };
  }
}

// Create a new time entry
export async function createTimeEntry(timeEntry: Omit<TimeEntry, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: TimeEntry; error?: string; message?: string }> {
  try {
    const response = await fetch('/api/time-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeEntry),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating time entry:', error);
    return {
      success: false,
      error: 'Failed to create time entry'
    };
  }
}

// Update an existing time entry
export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<{ success: boolean; data?: TimeEntry; error?: string; message?: string }> {
  try {
    const response = await fetch(`/api/time-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating time entry:', error);
    return {
      success: false,
      error: 'Failed to update time entry'
    };
  }
}

// Delete a time entry
export async function deleteTimeEntry(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const response = await fetch(`/api/time-entries/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return {
      success: false,
      error: 'Failed to delete time entry'
    };
  }
}

// Save draft timesheet
export async function saveDraft(userId: string, weekStart: string, weekEnd: string, hours: number[], notes: string): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  return createTimeEntry({
    userId,
    weekStart,
    weekEnd,
    hours,
    notes,
    status: 'draft'
  });
}

// Submit timesheet
export async function submitTimesheet(userId: string, weekStart: string, weekEnd: string, hours: number[], notes: string): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  return createTimeEntry({
    userId,
    weekStart,
    weekEnd,
    hours,
    notes,
    status: 'submitted'
  });
}

// Get time entry for a specific user and week
export async function getTimeEntryForWeek(userId: string, weekStart: string): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  try {
    const params = new URLSearchParams({
      userId,
      weekStart,
      weekEnd: weekStart // This will be adjusted by the API to find the week
    });
    
    const response = await fetch(`/api/time-entries?${params.toString()}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      return {
        success: true,
        data: result.data[0]
      };
    }
    
    return {
      success: true,
      data: undefined
    };
  } catch (error) {
    console.error('Error fetching time entry for week:', error);
    return {
      success: false,
      error: 'Failed to fetch time entry for week'
    };
  }
} 