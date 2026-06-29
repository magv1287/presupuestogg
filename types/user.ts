export interface User {
  uid: string;
  email: string;
  name: string;
  savingsAccounts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  savingsAccounts: string[];
}
