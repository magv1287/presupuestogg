export interface User {
  uid: string;
  email: string;
  name: string;
  monthlyIncome?: number;
  savingsAccounts: string[];
  onboardingCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  monthlyIncome?: number;
  savingsAccounts: string[];
  onboardingCompleted?: boolean;
}
