export interface IGigWorker {
  id?: string;
  externalAuthId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  upiId?: string;
  address?: string;
  deliveryPartnerCategory: string[];
  onboardingDate: any; // Can be Date or Firestore Timestamp
  isActive: boolean;
  lastActivityDate?: any;
  createdAt?: any;
  updatedAt?: any;
}
