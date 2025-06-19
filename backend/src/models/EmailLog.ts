
import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailLog extends Document {
  studentId: mongoose.Types.ObjectId;
  emailAddress: string;
  subject: string;
  sentAt: Date;
  status: 'sent' | 'failed';
  error?: string;
  reminderType: 'inactivity' | 'sync_error';
}

const EmailLogSchema = new Schema<IEmailLog>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  emailAddress: { type: String, required: true },
  subject: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  error: { type: String },
  reminderType: { type: String, enum: ['inactivity', 'sync_error'], required: true }
});

export default mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
