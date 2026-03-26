export interface IParametricTriggerRule {
  id?: string;
  insuranceProductType: string;
  triggerCondition: string;
  thresholdValue: number;
  payoutPercentage: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}
