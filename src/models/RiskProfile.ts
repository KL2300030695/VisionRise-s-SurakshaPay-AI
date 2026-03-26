export interface IRiskProfile {
  id?: string;
  gigWorkerId: string;
  locationId: string;
  riskScore: number;
  predictedDisruptionLikelihood: string;
  lastCalculatedDate: any;
  effectiveDate: any;
  createdAt?: any;
  updatedAt?: any;
}
