export interface IDisruptionEvent {
  id?: string;
  type: string[];
  subType: string;
  severity: string[];
  description: string;
  startDate: any;
  endDate?: any;
  affectedLocationIds: string[];
  isVerified: boolean;
  source?: string;
  createdAt?: any;
  updatedAt?: any;
}
