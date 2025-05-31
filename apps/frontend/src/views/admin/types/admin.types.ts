export interface PolicyType {
  id: number;
  walletAddress: string;
  premium: string;
  sumAssured: string;
  status: string;
  coverageStartDate: string;
  coverageEndDate: string;
  planTypeId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    walletAddress: string;
    fullName: string;
    username: string;
    age: number;
    gender: string;
    occupation: string;
    contactInfo: string;
  };
  [key: string]: any;
}
