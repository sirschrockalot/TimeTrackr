import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  hours: number[];
  notes: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema: Schema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true
  },
  weekStart: {
    type: Date,
    required: [true, 'Week start date is required']
  },
  weekEnd: {
    type: Date,
    required: [true, 'Week end date is required']
  },
  hours: {
    type: [Number],
    required: [true, 'Hours are required'],
    validate: {
      validator: function(hours: number[]) {
        return hours.length === 7 && hours.every(h => h >= 0 && h <= 24);
      },
      message: 'Hours must be an array of 7 numbers between 0 and 24'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft',
    required: true
  },
  submittedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create compound index for userId and weekStart to prevent duplicate entries
TimeEntrySchema.index({ userId: 1, weekStart: 1 }, { unique: true });

// Create indexes for better query performance
TimeEntrySchema.index({ userId: 1 });
TimeEntrySchema.index({ status: 1 });
TimeEntrySchema.index({ weekStart: 1 });

export default mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema); 