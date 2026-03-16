import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskProfile extends Document {
  gigWorkerId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  riskScore: number;
  predictedDisruptionLikelihood: string;
  lastCalculatedDate: Date;
  effectiveDate: Date;
}

const RiskProfileSchema: Schema = new Schema({
  gigWorkerId: { type: Schema.Types.ObjectId, ref: 'GigWorker', required: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  riskScore: { type: Number, required: true },
  predictedDisruptionLikelihood: { type: String },
  lastCalculatedDate: { type: Date, required: true, default: Date.now },
  effectiveDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.RiskProfile || mongoose.model<IRiskProfile>('RiskProfile', RiskProfileSchema);
