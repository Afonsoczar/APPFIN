export type TransactionType = 'income' | 'fixed' | 'variable' | 'credit_card';

export interface Card {
  id: string;
  name: string;
  dueDay: number;
  color: string;
  limit?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO string YYYY-MM-DD
  category?: string; // For variable
  isPaid?: boolean; // For fixed and credit_card
  dueDate?: string; // For fixed
  cardId?: string; // Link to a card if type is credit_card
}

export interface FinancialSummary {
  totalIncome: number;
  totalFixed: number;
  totalVariable: number;
  totalCreditCard: number; // New field
  balance: number;
  remainingBudget: number;
}

export const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Saúde',
  'Casa',
  'Compras',
  'Outros'
];

export const CARD_COLORS = [
  { name: 'Roxo', value: 'bg-purple-600' },
  { name: 'Preto', value: 'bg-slate-900' },
  { name: 'Azul', value: 'bg-blue-600' },
  { name: 'Vermelho', value: 'bg-red-600' },
  { name: 'Laranja', value: 'bg-orange-500' },
  { name: 'Verde', value: 'bg-emerald-600' },
];