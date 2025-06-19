
import mongoose, { Document, Schema } from 'mongoose';

export interface ISyncSettings extends Document {
  frequency: 'daily' | 'weekly';
  time: string; // Format: "HH:MM"
  timezone: string;
  lastSync: Date | null;
  isEnabled: boolean;
  inactivityThresholdDays: number;
  emailReminderEnabled: boolean;
}

const SyncSettingsSchema = new Schema<ISyncSettings>({
  frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  time: { type: String, default: '09:00' },
  timezone: { type: String, default: 'UTC' },
  lastSync: { type: Date, default: null },
  isEnabled: { type: Boolean, default: true },
  inactivityThresholdDays: { type: Number, default: 7 },
  emailReminderEnabled: { type: Boolean, default: true }
});

export default mongoose.model<ISyncSettings>('SyncSettings', SyncSettingsSchema);
