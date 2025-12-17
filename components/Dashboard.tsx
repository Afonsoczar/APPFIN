import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FinancialSummary, Transaction } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';

interface DashboardProps {
  summary: FinancialSummary;
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ summary }) => {
  const data = [
    { name: 'Fixo', value: summary.totalFixed, color: '#9333ea' }, // purple-600
    { name: 'Variável', value: summary.totalVariable, color: '#2563eb' }, // blue-600
    { name: 'Cartões', value: summary.totalCreditCard, color: '#0f172a' }, // slate-900
    { name: 'Disponível', value: Math.max(0, summary.remainingBudget), color: '#e2e8f0' }, // slate-200
  ];

  // Only show chart if there is income
  const hasIncome = summary.totalIncome > 0;
  const isNegative = summary.balance < 0;
  const totalExpenses = summary.totalFixed + summary.totalVariable + summary.totalCreditCard;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      {/* Main Balance Card */}
      <div className={`p-6 rounded-3xl shadow-lg ${isNegative ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-slate-900'} text-white`}>
        <div className="flex items-center gap-2 mb-2 opacity-80">
          <Wallet size={18} />
          <span className="text-sm font-medium">Saldo do Mês</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {formatCurrency(summary.balance)}
        </h1>
        <div className="flex gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs opacity-70 mb-1">Ganhos</p>
            <p className="font-semibold text-green-300 flex items-center gap-1">
              <TrendingUp size={14} /> {formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-1">Gastos Totais</p>
            <p className="font-semibold text-red-200 flex items-center gap-1">
              <TrendingDown size={14} /> {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Fixas</p>
          <p className="text-sm font-bold text-purple-600 truncate">{formatCurrency(summary.totalFixed)}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Variáveis</p>
          <p className="text-sm font-bold text-blue-600 truncate">{formatCurrency(summary.totalVariable)}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Cartões</p>
          <p className="text-sm font-bold text-slate-900 truncate">{formatCurrency(summary.totalCreditCard)}</p>
        </div>
      </div>

      {/* Chart Section */}
      {hasIncome && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Distribuição do Orçamento</h3>
          <div className="h-48 w-full relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                     // Only render cell if value > 0
                    entry.value > 0 ? <Cell key={`cell-${index}`} fill={entry.color} /> : null
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Restante</span>
              <span className={`text-lg font-bold ${summary.remainingBudget < 0 ? 'text-red-500' : 'text-slate-700'}`}>
                {formatCurrency(summary.remainingBudget)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
             {data.filter(d => d.value > 0).map(d => (
                 <div key={d.name} className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                     <span className="text-xs text-slate-500 font-medium">{d.name}</span>
                 </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};