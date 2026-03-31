export type TransactionType = 'LIPA_NA_MPESA' | 'BUSINESS_INBOUND' | 'PERSONAL_TRANSFER' | 'CHAMA_CONTRIBUTION' | 'UTILITY_PAYMENT';

export interface MpesaTransaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  reference: string;
}

export interface SMSLog {
  id: string;
  timestamp: string;
  sender: string;
  message: string;
  category?: 'STOCK_PURCHASE' | 'CUSTOMER_ORDER' | 'UTILITY_CONFIRMATION' | 'MPESA_REF' | 'OTHER';
  intent?: string;
}

export interface ChamaHistory {
  groupId: string;
  groupName: string;
  contributionConsistency: number; // 0 to 1
  loanRepaymentPerformance: number; // 0 to 1
  totalSavings: number;
  lastContributionDate: string;
}

export interface CreditScore {
  growthScore: number; // 0 to 100
  creditworthinessIndex: number; // 300 to 850
  riskLevel: 'Low' | 'Medium' | 'High';
  features: {
    cashFlowVolatility: number;
    digitalFootprintConsistency: number;
    socialCapital: number;
    businessVelocity: number;
  };
}

export interface FinancialProduct {
  id: string;
  institution: string;
  type: 'MFI' | 'SACCO' | 'BANK';
  name: string;
  minScore: number;
  maxLoanAmount: number;
  interestRate: string;
  requirements: string[];
}
