import mongoose, { Schema, Document } from 'mongoose';

export interface IGigWorker extends Document {
  externalAuthId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  deliveryPartnerCategory: string[];
  onboardingDate: Date;
  isActive: boolean;
  lastActivityDate?: Date;
}

const GigWorkerSchema: Schema = new Schema({
  externalAuthId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  address: { type: String },
  deliveryPartnerCategory: { type: [String], required: true },
  onboardingDate: { type: Date, required: true, default: Date.now },
  isActive: { type: Boolean, required: true, default: true },
  lastActivityDate: { type: Date },
}, { timestamps: true });

export default mongoose.models.GigWorker || mongoose.model<IGigWorker>('GigWorker', GigWorkerSchema);
