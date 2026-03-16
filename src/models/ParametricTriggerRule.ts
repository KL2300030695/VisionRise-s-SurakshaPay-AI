import mongoose, { Schema, Document } from 'mongoose';

export interface IParametricTriggerRule extends Document {
  name: string;
  disruptionType: string[];
  disruptionSubType: string;
  minSeverity: string[];
  durationThresholdHours: number;
  locationTag?: string;
  deliveryPartnerCategory: string[];
  impactThresholdPercentage: number;
  isActive: boolean;
  createdAt: Date;
  lastModifiedAt: Date;
}

const ParametricTriggerRuleSchema: Schema = new Schema({
  name: { type: String, required: true },
  disruptionType: { type: [String], required: true },
  disruptionSubType: { type: String, required: true },
  minSeverity: { type: [String], required: true },
  durationThresholdHours: { type: Number, required: true },
  locationTag: { type: String },
  deliveryPartnerCategory: { type: [String], required: true },
  impactThresholdPercentage: { type: Number, required: true },
  isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true });

export default mongoose.models.ParametricTriggerRule || mongoose.model<IParametricTriggerRule>('ParametricTriggerRule', ParametricTriggerRuleSchema);
