import React from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onToggleStatus?: (id: string) => void;
  onDelete: (id: string) => void;
  type: 'fixed' | 'variable' | 'income';
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onToggleStatus, 
  onDelete,
  type 
}) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <p>Nenhum item cadastrado neste mês.</p>
      </div>
    );
  }

  // Group by date for variable expenses
  if (type === 'variable') {
    const grouped = transactions.reduce((acc, curr) => {
      const date = curr.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(curr);
      return acc;
    }, {} as Record<string, Transaction[]>);

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
      <div className="space-y-4 pb-24">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {formatDate(date)}
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {grouped[date].map((t, idx) => (
                <div key={t.id} className={`flex items-center justify-between p-4 ${idx !== grouped[date].length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{t.description}</p>
                    <p className="text-xs text-slate-500">{t.category || 'Geral'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">{formatCurrency(t.amount)}</span>
                    <button onClick={() => onDelete(t.id)} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List for Fixed and Income
  return (
    <div className="space-y-3 pb-24">
      {transactions.map((t) => (
        <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {type === 'fixed' && onToggleStatus && (
              <button onClick={() => onToggleStatus(t.id)} className="focus:outline-none">
                {t.isPaid ? (
                  <CheckCircle2 className="text-green-500" size={24} />
                ) : (
                  <Circle className="text-slate-300" size={24} />
                )}
              </button>
            )}
            
            <div className="flex-1">
              <p className={`font-medium ${t.isPaid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {t.description}
              </p>
              <p className="text-xs text-slate-500">
                {type === 'fixed' ? `Vence dia ${formatDate(t.date)}` : `Recebido dia ${formatDate(t.date)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`font-semibold ${type === 'income' ? 'text-green-600' : 'text-slate-700'}`}>
              {formatCurrency(t.amount)}
            </span>
             <button onClick={() => onDelete(t.id)} className="text-slate-300 hover:text-red-500">
                <Trash2 size={16} />
              </button>
          </div>
        </div>
      ))}
    </div>
  );
};