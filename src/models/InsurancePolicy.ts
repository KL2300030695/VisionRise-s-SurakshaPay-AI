export interface IInsurancePolicy {
  id?: string;
  gigWorkerId: string;
  policyStartDate: any;
  policyEndDate: any;
  premiumAmount: number;
  coverageAmountPerDay: number;
  coverageAmountTotal: number;
  status: 'Active' | 'Expired' | 'Cancelled' | 'Pending';
  paymentDueDate: any;
  isPaid: boolean;
  riskProfileId?: string;
  coveredLocationId?: string;
  createdAt?: any;
  updatedAt?: any;
}
