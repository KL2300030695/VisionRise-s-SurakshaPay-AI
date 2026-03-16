import mongoose, { Schema, Document } from 'mongoose';

export interface IInsurancePolicy extends Document {
  gigWorkerId: mongoose.Types.ObjectId;
  policyStartDate: Date;
  policyEndDate: Date;
  premiumAmount: number;
  coverageAmountPerDay: number;
  coverageAmountTotal: number;
  status: string;
  paymentDueDate: Date;
  isPaid: boolean;
  riskProfileId: mongoose.Types.ObjectId;
  coveredLocationId: mongoose.Types.ObjectId;
}

const InsurancePolicySchema: Schema = new Schema({
  gigWorkerId: { type: Schema.Types.ObjectId, ref: 'GigWorker', required: true },
  policyStartDate: { type: Date, required: true },
  policyEndDate: { type: Date, required: true },
  premiumAmount: { type: Number, required: true },
  coverageAmountPerDay: { type: Number, required: true },
  coverageAmountTotal: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Active', 'Lapsed', 'Cancelled', 'PendingPayment'] },
  paymentDueDate: { type: Date, required: true },
  isPaid: { type: Boolean, required: true, default: false },
  riskProfileId: { type: Schema.Types.ObjectId, ref: 'RiskProfile', required: true },
  coveredLocationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
}, { timestamps: true });

export default mongoose.models.InsurancePolicy || mongoose.model<IInsurancePolicy>('InsurancePolicy', InsurancePolicySchema);
