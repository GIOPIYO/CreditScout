/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Zap, 
  CreditCard, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  History,
  Briefcase
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

import { generateSyntheticData } from './utils/dataGenerator';
import { calculateCreditScore, FINANCIAL_PRODUCTS } from './utils/scoringEngine';
import { extractBusinessIntent } from './utils/geminiExtractor';
import { MpesaTransaction, SMSLog, ChamaHistory, CreditScore, FinancialProduct } from './types';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [data, setData] = useState<{
    transactions: MpesaTransaction[];
    smsLogs: SMSLog[];
    chamaHistory: ChamaHistory;
  } | null>(null);
  const [score, setScore] = useState<CreditScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'products'>('dashboard');

  const refreshData = async () => {
    setIsAnalyzing(true);
    const syntheticData = generateSyntheticData();
    setData(syntheticData);
    
    const initialScore = calculateCreditScore(
      syntheticData.transactions,
      syntheticData.smsLogs,
      syntheticData.chamaHistory
    );
    setScore(initialScore);

    try {
      const enrichedSms = await extractBusinessIntent(syntheticData.smsLogs);
      setData(prev => prev ? { ...prev, smsLogs: enrichedSms } : prev);
    } catch (e) {
      console.error(e);
    }
    
    setIsAnalyzing(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    const daily: Record<string, number> = {};
    data.transactions
      .filter(t => t.type === 'BUSINESS_INBOUND')
      .forEach(t => {
        const day = t.date.split(' ')[0];
        daily[day] = (daily[day] || 0) + t.amount;
      });
    
    return Object.entries(daily)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  if (!data || !score) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <RefreshCw className="w-12 h-12 text-brand-accent animate-spin" />
            <div className="absolute inset-0 border-4 border-brand-accent/20 rounded-full" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-serif italic text-gray-900">CreditScout Engine</p>
            <p className="text-sm font-mono text-gray-400 uppercase tracking-widest">Initializing Data Extraction...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary font-sans selection:bg-brand-accent/20">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-brand-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary p-2.5 rounded-xl shadow-lg shadow-black/10">
                <ShieldCheck className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-brand-primary block leading-none">CreditScout</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em]">Fintech AI v1.0</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-10">
              {['dashboard', 'history', 'products'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest transition-all relative py-2",
                    activeTab === tab ? "text-brand-primary" : "text-gray-400 hover:text-brand-primary"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={refreshData}
                disabled={isAnalyzing}
                className="flex items-center gap-2.5 bg-brand-primary text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-black/10"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isAnalyzing && "animate-spin")} />
                {isAnalyzing ? "Analyzing..." : "Refresh Data"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Hero Section: Score & Risk */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-10 relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl transition-all group-hover:bg-brand-accent/10" />
                  
                  <div className="relative z-10">
                    <h2 className="section-header mb-8">Side-Hustle Credit Profile</h2>
                    <div className="flex flex-col md:flex-row items-center gap-16">
                      {/* Technical Gauge */}
                      <div className="relative w-56 h-56 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="112"
                            cy="112"
                            r="100"
                            fill="transparent"
                            stroke="#F3F4F6"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                          <circle
                            cx="112"
                            cy="112"
                            r="90"
                            fill="transparent"
                            stroke="#F3F4F6"
                            strokeWidth="16"
                          />
                          <circle
                            cx="112"
                            cy="112"
                            r="90"
                            fill="transparent"
                            stroke={score.riskLevel === 'Low' ? '#10B981' : score.riskLevel === 'Medium' ? '#F59E0B' : '#EF4444'}
                            strokeWidth="16"
                            strokeDasharray={565.48}
                            strokeDashoffset={565.48 * (1 - (score.creditworthinessIndex - 300) / 550)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-6xl font-black text-brand-primary data-value">{score.creditworthinessIndex}</span>
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.3em] mt-1">Index Score</span>
                        </div>
                        {/* Ticks */}
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="absolute w-0.5 h-2 bg-gray-200"
                            style={{ 
                              transform: `rotate(${i * 30}deg) translateY(-104px)` 
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex-1 space-y-6">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              score.riskLevel === 'Low' ? "bg-green-50 text-green-700 border-green-100" : 
                              score.riskLevel === 'Medium' ? "bg-yellow-50 text-yellow-700 border-yellow-100" : "bg-red-50 text-red-700 border-red-100"
                            )}>
                              {score.riskLevel} Risk Profile
                            </span>
                            <span className="bg-brand-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              Growth: {score.growthScore}/100
                            </span>
                          </div>
                          <h3 className="text-3xl font-bold text-brand-primary leading-tight">
                            Business velocity is <span className="text-brand-accent italic font-serif">accelerating</span>.
                          </h3>
                          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                            Your digital footprint shows 95% consistency over the last 60 days. This qualifies you for premium SME financing.
                          </p>
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => setActiveTab('products')}
                            className="bg-brand-accent hover:bg-brand-accent/90 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-accent/20 hover:scale-105 active:scale-95"
                          >
                            View Loan Offers
                          </button>
                          <button className="border border-brand-border hover:bg-gray-50 bg-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                            Export PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Collateral Widget */}
                <div className="glass-card p-10 flex flex-col group">
                  <h2 className="section-header mb-8">Social Collateral</h2>
                  <div className="space-y-8 flex-1">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-primary">{data.chamaHistory.groupName}</p>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Active Member</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Consistency</span>
                        <span className="data-value text-brand-primary">{Math.round(data.chamaHistory.contributionConsistency * 100)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.chamaHistory.contributionConsistency * 100}%` }}
                          className="h-full bg-blue-600 rounded-full shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Savings</p>
                        <p className="text-xl font-bold text-brand-primary data-value">KES {data.chamaHistory.totalSavings.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Repayment</p>
                        <p className="text-xl font-bold text-green-600 data-value">{Math.round(data.chamaHistory.loanRepaymentPerformance * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { 
                    label: 'Cash Flow Volatility', 
                    value: `${Math.round(score.features.cashFlowVolatility * 100)}%`, 
                    icon: Zap, 
                    color: 'text-purple-600', 
                    bg: 'bg-purple-50',
                    desc: 'Stability metric'
                  },
                  { 
                    label: 'Digital Footprint', 
                    value: `${Math.round(score.features.digitalFootprintConsistency * 100)}%`, 
                    icon: CreditCard, 
                    color: 'text-blue-600', 
                    bg: 'bg-blue-50',
                    desc: 'M-Pesa frequency'
                  },
                  { 
                    label: 'Business Velocity', 
                    value: `${score.features.businessVelocity.toFixed(1)}x`, 
                    icon: TrendingUp, 
                    color: 'text-orange-600', 
                    bg: 'bg-orange-50',
                    desc: 'Sales growth rate'
                  },
                  { 
                    label: 'Social Capital', 
                    value: `${Math.round(score.features.socialCapital * 100)}%`, 
                    icon: Users, 
                    color: 'text-green-600', 
                    bg: 'bg-green-50',
                    desc: 'Group reliability'
                  },
                ].map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card p-8 group hover:border-brand-accent/30 transition-all"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3", feature.bg)}>
                      <feature.icon className={cn("w-6 h-6", feature.color)} />
                    </div>
                    <p className="section-header mb-2">{feature.label}</p>
                    <p className="text-3xl font-bold text-brand-primary data-value mb-2">{feature.value}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts & Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-10">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h2 className="text-xl font-bold text-brand-primary">Business Velocity Trend</h2>
                      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-1">60-Day Inbound Analysis</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold text-green-600 data-value">+12.5%</span>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F3F4F6" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }}
                          tickFormatter={(str) => str.split('-').slice(1).join('/')}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }}
                          tickFormatter={(val) => `K${val/1000}k`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontFamily: 'Inter' }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorAmount)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-10">
                  <h2 className="section-header mb-8">AI Intent Analysis</h2>
                  <div className="space-y-6">
                    {data.smsLogs.filter(l => l.category !== 'OTHER').slice(0, 5).map((log, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex gap-5 group hover:bg-white hover:shadow-md transition-all"
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                          log.category === 'STOCK_PURCHASE' ? "bg-purple-100" : 
                          log.category === 'CUSTOMER_ORDER' ? "bg-orange-100" : "bg-blue-100"
                        )}>
                          <MessageSquare className={cn(
                            "w-5 h-5",
                            log.category === 'STOCK_PURCHASE' ? "text-purple-600" : 
                            log.category === 'CUSTOMER_ORDER' ? "text-orange-600" : "text-blue-600"
                          )} />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">{log.intent || log.category?.replace('_', ' ')}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed italic">"{log.message}"</p>
                        </div>
                      </motion.div>
                    ))}
                    <button className="w-full text-center text-[10px] font-bold text-brand-accent hover:underline uppercase tracking-[0.2em] pt-4">
                      View Full Extraction Log
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card overflow-hidden"
            >
              <div className="p-10 border-b border-brand-border bg-gray-50/50">
                <h2 className="text-2xl font-bold text-brand-primary">M-Pesa Ledger</h2>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-2">Verified Transaction History</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-brand-border">
                      <th className="px-10 py-5 section-header">Timestamp</th>
                      <th className="px-10 py-5 section-header">Classification</th>
                      <th className="px-10 py-5 section-header">Entity / Description</th>
                      <th className="px-10 py-5 section-header">Reference</th>
                      <th className="px-10 py-5 section-header text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {data.transactions.slice(0, 25).map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-10 py-5 text-xs font-mono text-gray-400">{txn.date}</td>
                        <td className="px-10 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            txn.type === 'BUSINESS_INBOUND' ? "bg-green-50 text-green-700 border-green-100" :
                            txn.type === 'LIPA_NA_MPESA' ? "bg-purple-50 text-purple-700 border-purple-100" :
                            txn.type === 'CHAMA_CONTRIBUTION' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-gray-50 text-gray-500 border-gray-100"
                          )}>
                            {txn.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-10 py-5 text-sm font-bold text-brand-primary">{txn.description}</td>
                        <td className="px-10 py-5 text-xs font-mono text-gray-400 group-hover:text-brand-primary transition-colors">{txn.reference}</td>
                        <td className={cn(
                          "px-10 py-5 text-sm font-bold text-right data-value",
                          txn.type === 'BUSINESS_INBOUND' ? "text-green-600" : "text-brand-primary"
                        )}>
                          {txn.type === 'BUSINESS_INBOUND' ? '+' : '-'} KES {txn.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="bg-brand-primary rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl shadow-black/20">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-accent/10 rounded-full blur-[100px]" />
                <div className="relative z-10 max-w-3xl">
                  <h2 className="text-4xl font-bold mb-6">Matched Financial Products</h2>
                  <p className="text-gray-400 text-xl leading-relaxed">
                    Your alternative data profile has been verified. Based on your index of <span className="text-brand-accent font-mono">{score.creditworthinessIndex}</span>, 
                    you are eligible for the following institutional products.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {FINANCIAL_PRODUCTS.map((product) => {
                  const isEligible = score.creditworthinessIndex >= product.minScore;
                  return (
                    <motion.div 
                      whileHover={isEligible ? { y: -10 } : {}}
                      key={product.id} 
                      className={cn(
                        "glass-card p-10 flex flex-col transition-all relative overflow-hidden",
                        isEligible ? "hover:border-brand-accent/50" : "opacity-60 grayscale"
                      )}
                    >
                      {!isEligible && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                          <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-red-100 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Score Required: {product.minScore}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-8">
                        <div className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          product.type === 'MFI' ? "bg-purple-50 text-purple-700 border-purple-100" :
                          product.type === 'SACCO' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-gray-50 text-gray-700 border-gray-100"
                        )}>
                          {product.type}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-brand-primary mb-1">{product.name}</h3>
                      <p className="text-sm font-serif italic text-gray-400 mb-8">{product.institution}</p>
                      
                      <div className="space-y-6 mb-10 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max Facility</span>
                          <span className="text-lg font-bold text-brand-primary data-value">KES {product.maxLoanAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interest Rate</span>
                          <span className="text-lg font-bold text-brand-accent data-value">{product.interestRate}</span>
                        </div>
                        <div className="pt-6 border-t border-gray-100">
                          <p className="section-header mb-4">Verification Requirements</p>
                          <ul className="space-y-3">
                            {product.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-3 text-xs text-gray-600 leading-relaxed">
                                <CheckCircle2 className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button 
                        disabled={!isEligible}
                        className={cn(
                          "w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all",
                          isEligible 
                            ? "bg-brand-primary text-white hover:bg-black shadow-xl shadow-black/10" 
                            : "bg-gray-100 text-gray-400"
                        )}
                      >
                        {isEligible ? "Initiate Application" : "Locked"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-brand-border py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="bg-brand-primary p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-brand-accent" />
            </div>
            <span className="text-xl font-bold text-brand-primary tracking-tight">CreditScout AI</span>
          </div>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed font-serif italic">
            "Bridging the gap between informal success and formal finance through precision alternative data analysis."
          </p>
          <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-center gap-8 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            <span>System Status: Operational</span>
            <span>Data Source: Simulated M-Pesa API</span>
            <span>AI Model: Gemini 3 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
