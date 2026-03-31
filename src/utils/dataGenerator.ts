import { MpesaTransaction, SMSLog, ChamaHistory } from '../types';
import { subDays, format } from 'date-fns';

export function generateSyntheticData() {
  const transactions: MpesaTransaction[] = [];
  const smsLogs: SMSLog[] = [];
  
  const now = new Date();
  
  // Generate 60 days of transactions for a "Mitumba" (second-hand clothes) seller
  for (let i = 60; i >= 0; i--) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss');
    
    // Daily sales (Business Inbound)
    if (Math.random() > 0.2) {
      const salesCount = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < salesCount; j++) {
        transactions.push({
          id: `TXN-${i}-${j}`,
          date: dateStr,
          amount: Math.floor(Math.random() * 2000) + 500,
          type: 'BUSINESS_INBOUND',
          description: 'Payment received from Customer',
          reference: `MP${Math.random().toString(36).substring(7).toUpperCase()}`
        });
      }
    }
    
    // Weekly Stock Purchase (Lipa na M-Pesa)
    if (i % 7 === 0) {
      transactions.push({
        id: `TXN-STOCK-${i}`,
        date: dateStr,
        amount: Math.floor(Math.random() * 15000) + 5000,
        type: 'LIPA_NA_MPESA',
        description: 'Payment to Gikomba Wholesalers',
        reference: `ST${Math.random().toString(36).substring(7).toUpperCase()}`
      });
      
      smsLogs.push({
        id: `SMS-STOCK-${i}`,
        timestamp: dateStr,
        sender: 'Wholesaler',
        message: `Order confirmed: 2 bales of Grade A Mitumba. Mpesa Ref: ST${Math.random().toString(36).substring(7).toUpperCase()}`,
        category: 'STOCK_PURCHASE'
      });
    }
    
    // Monthly Chama Contribution
    if (i % 30 === 0) {
      transactions.push({
        id: `TXN-CHAMA-${i}`,
        date: dateStr,
        amount: 2000,
        type: 'CHAMA_CONTRIBUTION',
        description: 'Monthly Chama Contribution - Unity Group',
        reference: `CH${Math.random().toString(36).substring(7).toUpperCase()}`
      });
    }
    
    // Random Customer Orders via SMS
    if (Math.random() > 0.5) {
      smsLogs.push({
        id: `SMS-ORDER-${i}`,
        timestamp: dateStr,
        sender: `+2547${Math.floor(Math.random() * 100000000)}`,
        message: `Hi, I want the blue denim jacket. Can I pay via Mpesa?`,
        category: 'CUSTOMER_ORDER'
      });
    }
  }
  
  const chamaHistory: ChamaHistory = {
    groupId: 'UNITY-001',
    groupName: 'Unity Self-Help Group',
    contributionConsistency: 0.95,
    loanRepaymentPerformance: 1.0,
    totalSavings: 45000,
    lastContributionDate: format(now, 'yyyy-MM-dd')
  };
  
  return { transactions, smsLogs, chamaHistory };
}
