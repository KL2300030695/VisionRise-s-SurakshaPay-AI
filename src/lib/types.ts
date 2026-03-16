export type Persona = 'Food' | 'E-commerce' | 'Grocery';

export interface GigWorker {
  id: string;
  name: string;
  persona: Persona;
  platform: string;
  city: string;
}

export interface Policy {
  id: string;
  workerId: string;
  startDate: string;
  endDate: string;
  weeklyPremium: number;
  coverageAmount: number;
  status: 'active' | 'expired' | 'pending';
}

export interface Claim {
  id: string;
  policyId: string;
  date: string;
  disruptionType: string;
  status: 'approved' | 'rejected' | 'pending';
  payoutAmount: number;
  fraudScore?: number;
}