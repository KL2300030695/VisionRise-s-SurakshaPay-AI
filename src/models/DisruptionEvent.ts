import mongoose, { Schema, Document } from 'mongoose';

export interface IDisruptionEvent extends Document {
  type: string[];
  subType: string;
  description: string;
  severity: string[];
  startDate: Date;
  endDate?: Date;
  affectedLocationIds: mongoose.Types.ObjectId[];
  source: string;
  isVerified: boolean;
}

const DisruptionEventSchema: Schema = new Schema({
  type: { type: [String], required: true },
  subType: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: [String], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  affectedLocationIds: [{ type: Schema.Types.ObjectId, ref: 'Location', required: true }],
  source: { type: String, required: true },
  isVerified: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export default mongoose.models.DisruptionEvent || mongoose.model<IDisruptionEvent>('DisruptionEvent', DisruptionEventSchema);
