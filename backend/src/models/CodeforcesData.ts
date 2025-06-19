
import mongoose, { Document, Schema } from 'mongoose';

export interface ICodeforcesData extends Document {
  studentId: mongoose.Types.ObjectId;
  handle: string;
  userInfo: any;
  contests: any[];
  submissions: any[];
  problems: any[];
  lastFetched: Date;
}

const CodeforcesDataSchema = new Schema<ICodeforcesData>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  handle: { type: String, required: true },
  userInfo: { type: Schema.Types.Mixed },
  contests: [{ type: Schema.Types.Mixed }],
  submissions: [{ type: Schema.Types.Mixed }],
  problems: [{ type: Schema.Types.Mixed }],
  lastFetched: { type: Date, default: Date.now }
});

export default mongoose.model<ICodeforcesData>('CodeforcesData', CodeforcesDataSchema);
