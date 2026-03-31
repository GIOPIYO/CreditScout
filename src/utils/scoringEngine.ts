import { MpesaTransaction, SMSLog, ChamaHistory, CreditScore, FinancialProduct } from '../types';

export function calculateCreditScore(
  transactions: MpesaTransaction[],
  smsLogs: SMSLog[],
  chama: ChamaHistory
): CreditScore {
  // 1. Cash Flow Volatility (Standard Deviation of daily business inbound)
  const dailyInbound: Record<string, number> = {};
  transactions.filter(t => t.type === 'BUSINESS_INBOUND').forEach(t => {
    const day = t.date.split(' ')[0];
    dailyInbound[day] = (dailyInbound[day] || 0) + t.amount;
  });
  
  const values = Object.values(dailyInbound);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const volatility = Math.sqrt(variance) / mean; // Coefficient of variation
  
  // 2. Digital Footprint Consistency (Ratio of days with business activity)
  const activeDays = Object.keys(dailyInbound).length;
  const totalDays = 60; // Based on our generator
  const consistency = activeDays / totalDays;
  
  // 3. Social Capital (Chama reliability)
  const socialCapital = (chama.contributionConsistency * 0.6) + (chama.loanRepaymentPerformance * 0.4);
  
  // 4. Business Velocity (Growth in inbound volume over time)
  // Compare last 30 days vs previous 30 days
  const midPoint = new Date();
  midPoint.setDate(midPoint.getDate() - 30);
  const midPointStr = midPoint.toISOString().split('T')[0];
  
  let recentVolume = 0;
  let previousVolume = 0;
  transactions.filter(t => t.type === 'BUSINESS_INBOUND').forEach(t => {
    if (t.date.split(' ')[0] >= midPointStr) {
      recentVolume += t.amount;
    } else {
      previousVolume += t.amount;
    }
  });
  const velocity = previousVolume === 0 ? 1 : recentVolume / previousVolume;
  
  // Weighted Scoring Logic
  // Base score 300
  // Volatility (Lower is better): 150 pts
  // Consistency (Higher is better): 150 pts
  // Social Capital (Higher is better): 150 pts
  // Velocity (Higher is better): 100 pts
  
  const volScore = Math.max(0, 150 * (1 - volatility));
  const conScore = 150 * consistency;
  const socScore = 150 * socialCapital;
  const velScore = Math.min(100, 50 * velocity);
  
  const creditworthinessIndex = Math.round(300 + volScore + conScore + socScore + velScore);
  const growthScore = Math.round((conScore + velScore + socScore) / 4); // Simple 0-100 growth metric
  
  let riskLevel: 'Low' | 'Medium' | 'High' = 'High';
  if (creditworthinessIndex > 700) riskLevel = 'Low';
  else if (creditworthinessIndex > 550) riskLevel = 'Medium';
  
  return {
    growthScore,
    creditworthinessIndex,
    riskLevel,
    features: {
      cashFlowVolatility: volatility,
      digitalFootprintConsistency: consistency,
      socialCapital,
      businessVelocity: velocity
    }
  };
}

export const FINANCIAL_PRODUCTS: FinancialProduct[] = [
  {
    id: 'MFI-001',
    institution: 'Musoni Kenya',
    type: 'MFI',
    name: 'Kilimo Biashara Loan',
    minScore: 600,
    maxLoanAmount: 150000,
    interestRate: '1.5% monthly',
    requirements: ['M-Pesa Statement (6 months)', 'Chama Membership', 'Business Permit']
  },
  {
    id: 'SACCO-001',
    institution: 'Stima SACCO',
    type: 'SACCO',
    name: 'M-Pawa Emergency Loan',
    minScore: 500,
    maxLoanAmount: 50000,
    interestRate: '1% monthly',
    requirements: ['SACCO Membership', 'Guarantors or Social Collateral']
  },
  {
    id: 'BANK-001',
    institution: 'Equity Bank',
    type: 'BANK',
    name: 'EazzyBiz SME Loan',
    minScore: 720,
    maxLoanAmount: 1000000,
    interestRate: '13% p.a.',
    requirements: ['Registered Business', 'KRA PIN', 'Strong Digital Footprint']
  }
];
