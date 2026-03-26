export interface IClaim {
  id?: string;
  gigWorkerId: string;
  policyId: string;
  disruptionEventId?: string;
  claimDate: any;
  status: string;
  claimedLostIncomeAmount: number;
  approvedPayoutAmount?: number;
  fraudScore?: number;
  fraudReason?: string;
  rejectionReason?: string;
  isAutomated: boolean;
  stimulationQuery?: string;
  payoutUpiId?: string;
  reviewerId?: string;
  lastUpdatedDate?: any;
  createdAt?: any;
  updatedAt?: any;
}
