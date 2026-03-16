import mongoose, { Schema, Document } from 'mongoose';

export interface IClaim extends Document {
  gigWorkerId: mongoose.Types.ObjectId;
  policyId: mongoose.Types.ObjectId;
  disruptionEventId: mongoose.Types.ObjectId;
  claimDate: Date;
  status: string;
  claimedLostIncomeAmount: number;
  approvedPayoutAmount?: number;
  fraudScore?: number;
  fraudReason?: string;
  rejectionReason?: string;
  isAutomated: boolean;
  reviewerId?: mongoose.Types.ObjectId;
  lastUpdatedDate?: Date;
}

const ClaimSchema: Schema = new Schema({
  gigWorkerId: { type: Schema.Types.ObjectId, ref: 'GigWorker', required: true },
  policyId: { type: Schema.Types.ObjectId, ref: 'InsurancePolicy', required: true },
  disruptionEventId: { type: Schema.Types.ObjectId, ref: 'DisruptionEvent', required: true },
  claimDate: { type: Date, required: true, default: Date.now },
  status: { type: String, required: true, enum: ['Initiated', 'Under Review', 'Approved', 'Rejected', 'Fraudulent', 'Paid'] },
  claimedLostIncomeAmount: { type: Number, required: true },
  approvedPayoutAmount: { type: Number },
  fraudScore: { type: Number },
  fraudReason: { type: String },
  rejectionReason: { type: String },
  isAutomated: { type: Boolean, required: true, default: false },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  lastUpdatedDate: { type: Date },
}, { timestamps: true });

export default mongoose.models.Claim || mongoose.model<IClaim>('Claim', ClaimSchema);
