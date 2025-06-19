
import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  phone: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastUpdated: Date;
  emailReminderCount: number;
  emailRemindersEnabled: boolean;
  createdAt: Date;
  lastSyncAttempt?: Date;
  syncStatus: 'success' | 'pending' | 'error';
  syncError?: string;
  isInactive: boolean;
  inactiveDays: number;
  lastActivityDate?: Date;
}

const StudentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  codeforcesHandle: { type: String, required: true, unique: true },
  currentRating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  emailReminderCount: { type: Number, default: 0 },
  emailRemindersEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastSyncAttempt: { type: Date },
  syncStatus: { type: String, enum: ['success', 'pending', 'error'], default: 'pending' },
  syncError: { type: String },
  isInactive: { type: Boolean, default: false },
  inactiveDays: { type: Number, default: 0 },
  lastActivityDate: { type: Date }
});

export default mongoose.model<IStudent>('Student', StudentSchema);
