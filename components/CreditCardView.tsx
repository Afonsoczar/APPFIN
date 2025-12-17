import React, { useState } from 'react';
import { Card, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Plus, CreditCard as CardIcon, Calendar, CheckCircle2, Circle } from 'lucide-react';

interface CreditCardViewProps {
  cards: Card[];
  transactions: Transaction[]; // Current month transactions
  onAddCard: () => void;
  onUpdateInvoice: (cardId: string, amount: number) => void;
  onTogglePaid: (transactionId: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export const CreditCardView: React.FC<CreditCardViewProps> = ({
  cards,
  transactions,
  onAddCard,
  onUpdateInvoice,
  onTogglePaid,
  onDeleteCard
}) => {
  // Local state to handle input changes before saving
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState('');

  const getCardTransaction = (cardId: string) => {
    return transactions.find(t => t.type === 'credit_card' && t.cardId === cardId);
  };

  const handleSaveInvoice = (cardId: string) => {
    if (!tempAmount) return;
    const amount = parseFloat(tempAmount.replace(',', '.'));
    onUpdateInvoice(cardId, amount);
    setEditingCardId(null);
    setTempAmount('');
  };

  const startEditing = (cardId: string, currentAmount?: number) => {
    setEditingCardId(cardId);
    setTempAmount(currentAmount ? currentAmount.toString() : '');
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in fade-in">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <CardIcon size={40} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum cartão</h3>
        <p className="text-slate-400 text-center max-w-xs mb-6">
          Cadastre seus cartões de crédito para controlar as faturas separadamente.
        </p>
        <button
          onClick={onAddCard}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          Adicionar Cartão
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meus Cartões</h2>
          <p className="text-slate-500 text-sm">Gerencie faturas e vencimentos</p>
        </div>
        <button
          onClick={onAddCard}
          className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid gap-4">
        {cards.map((card) => {
          const transaction = getCardTransaction(card.id);
          const hasInvoice = !!transaction;
          const isPaid = transaction?.isPaid;

          return (
            <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
              {/* Card Header (Visual Representation) */}
              <div className={`${card.color} p-4 text-white flex justify-between items-start`}>
                <div>
                  <p className="font-bold text-lg tracking-wide">{card.name}</p>
                  <div className="flex items-center gap-1 mt-1 opacity-80 text-xs font-medium">
                    <Calendar size={12} />
                    <span>Vence dia {card.dueDay}</span>
                  </div>
                </div>
                <button 
                  onClick={() => confirm('Excluir este cartão e suas faturas?') && onDeleteCard(card.id)}
                  className="text-white/50 hover:text-white"
                >
                  <span className="sr-only">Excluir</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>

              {/* Invoice Section */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Fatura Atual</span>
                  {hasInvoice && (
                    <button 
                      onClick={() => onTogglePaid(transaction!.id)}
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${isPaid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 size={12} /> PAGA
                        </>
                      ) : (
                        <>
                          <Circle size={12} /> EM ABERTO
                        </>
                      )}
                    </button>
                  )}
                </div>

                {editingCardId === card.id ? (
                  <div className="flex gap-2 items-center animate-in fade-in">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        autoFocus
                        value={tempAmount}
                        onChange={(e) => setTempAmount(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 font-bold text-slate-800"
                        placeholder="0,00"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveInvoice(card.id)}
                      />
                    </div>
                    <button 
                      onClick={() => handleSaveInvoice(card.id)}
                      className="px-3 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-end" onClick={() => startEditing(card.id, transaction?.amount)}>
                    {hasInvoice ? (
                      <div>
                        <span className={`text-2xl font-bold ${isPaid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm italic">Toque para informar valor</span>
                    )}
                    
                    <button className="text-xs font-bold text-blue-600 hover:underline">
                      {hasInvoice ? 'Alterar valor' : 'Definir fatura'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};