import mongoose, { Schema, Types } from "mongoose";

export interface ISyncLog {
  operation: "full_sync" | "student_sync" | "manual_sync";
  status: "success" | "partial" | "failed";
  startTime: Date;
  endTime?: Date;
  studentsProcessed: number;
  studentsSuccessful: number;
  studentsFailed: number;
  errors: string[];
  triggeredBy: "scheduled" | "manual" | "handle_change";
}

const SyncLogSchema = new Schema<ISyncLog>({
  operation: {
    type: String,
    enum: ["full_sync", "student_sync", "manual_sync"],
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "partial", "failed"],
    required: true,
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  studentsProcessed: { type: Number, default: 0 },
  studentsSuccessful: { type: Number, default: 0 },
  studentsFailed: { type: Number, default: 0 },
  errors: [{ type: String }],
  triggeredBy: {
    type: String,
    enum: ["scheduled", "manual", "handle_change"],
    required: true,
  },
});

// ✅ Use mongoose.model<T>(...)
const SyncLogModel = mongoose.model<ISyncLog>("SyncLog", SyncLogSchema);

export default SyncLogModel;
