import React, { useState, useEffect } from 'react';
import { Home, CalendarClock, CreditCard, Banknote, Plus, Settings, Trash2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { CreditCardView } from './components/CreditCardView';
import { AddModal } from './components/AddModal';
import { Transaction, TransactionType, FinancialSummary, Card } from './types';
import { generateId, getMonthName, getCurrentDateISO } from './utils';

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fixed' | 'variable' | 'cards' | 'income'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType | 'new_card'>('variable');
  const [showSettings, setShowSettings] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financas-transactions');
    const savedCards = localStorage.getItem('financas-cards');
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        console.error("Failed to load transactions", e);
      }
    }
    if (savedCards) {
      try {
        setCards(JSON.parse(savedCards));
      } catch (e) {
        console.error("Failed to load cards", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('financas-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financas-cards', JSON.stringify(cards));
  }, [cards]);

  // Actions
  const handleSaveData = (data: any) => {
    if (data.type === 'new_card') {
      const newCard: Card = {
        id: generateId(),
        name: data.name,
        dueDay: data.dueDay,
        color: data.color
      };
      setCards(prev => [...prev, newCard]);
    } else {
      const newTransaction = { ...data, id: generateId() };
      setTransactions(prev => [...prev, newTransaction]);
    }
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja apagar?')) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const deleteCard = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    // Also delete associated transactions for this card? Maybe keep them for history, 
    // but typically if card is deleted, we might want to cleanup. 
    // For safety, let's just keep transactions or filter them out.
    // Let's filter out future ones or just leave as is.
  };

  const toggleStatus = (id: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, isPaid: !t.isPaid } : t
    ));
  };

  const updateCardInvoice = (cardId: string, amount: number) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentDate = getCurrentDateISO();

    // Check if invoice already exists for this card this month
    const existing = transactions.find(t => {
      const d = new Date(t.date + 'T00:00:00');
      return t.type === 'credit_card' && t.cardId === cardId && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (existing) {
      // Update existing
      setTransactions(prev => prev.map(t => 
        t.id === existing.id ? { ...t, amount: amount } : t
      ));
    } else {
      // Create new
      const card = cards.find(c => c.id === cardId);
      const newTrans: Transaction = {
        id: generateId(),
        type: 'credit_card',
        description: `Fatura ${card?.name || 'Cartão'}`,
        amount: amount,
        date: currentDate, // Default to today, or could be card due date
        cardId: cardId,
        isPaid: false
      };
      setTransactions(prev => [...prev, newTrans]);
    }
  };

  const clearAllData = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os seus lançamentos e cartões. Deseja continuar?')) {
      setTransactions([]);
      setCards([]);
      localStorage.clear();
      setShowSettings(false);
      setActiveTab('dashboard');
    }
  };

  const openAddModal = (type?: TransactionType | 'new_card') => {
    setModalDefaultType(type || 'variable');
    setIsModalOpen(true);
  };

  // Derived State (Calculations)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const summary: FinancialSummary = {
    totalIncome: currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    totalFixed: currentMonthTransactions
      .filter(t => t.type === 'fixed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalVariable: currentMonthTransactions
      .filter(t => t.type === 'variable')
      .reduce((sum, t) => sum + t.amount, 0),
    totalCreditCard: currentMonthTransactions
      .filter(t => t.type === 'credit_card')
      .reduce((sum, t) => sum + t.amount, 0),
    balance: 0,
    remainingBudget: 0
  };

  const totalExpenses = summary.totalFixed + summary.totalVariable + summary.totalCreditCard;
  summary.balance = summary.totalIncome - totalExpenses;
  summary.remainingBudget = summary.totalIncome - totalExpenses;

  // Filtered lists for views
  const fixedList = currentMonthTransactions.filter(t => t.type === 'fixed').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const variableList = currentMonthTransactions.filter(t => t.type === 'variable').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const incomeList = currentMonthTransactions.filter(t => t.type === 'income').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard summary={summary} transactions={currentMonthTransactions} />;
      case 'cards':
        return (
           <CreditCardView 
              cards={cards} 
              transactions={currentMonthTransactions} 
              onAddCard={() => openAddModal('new_card')}
              onUpdateInvoice={updateCardInvoice}
              onTogglePaid={toggleStatus}
              onDeleteCard={deleteCard}
           />
        );
      case 'fixed':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Contas Fixas</h2>
                  <p className="text-slate-500 text-sm">Organize seus compromissos mensais</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Total</p>
                  <p className="text-lg font-bold text-purple-600">{summary.totalFixed.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                </div>
             </div>
            <TransactionList 
              transactions={fixedList} 
              type="fixed" 
              onToggleStatus={toggleStatus}
              onDelete={deleteTransaction}
            />
          </div>
        );
      case 'variable':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Gastos do Dia</h2>
                  <p className="text-slate-500 text-sm">Controle suas despesas diárias</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Total</p>
                  <p className="text-lg font-bold text-blue-600">{summary.totalVariable.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                </div>
             </div>
            <TransactionList 
              transactions={variableList} 
              type="variable" 
              onDelete={deleteTransaction}
            />
          </div>
        );
      case 'income':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Ganhos</h2>
                  <p className="text-slate-500 text-sm">Suas fontes de renda</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Total</p>
                  <p className="text-lg font-bold text-green-600">{summary.totalIncome.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                </div>
             </div>
            <TransactionList 
              transactions={incomeList} 
              type="income" 
              onDelete={deleteTransaction}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="px-6 pt-8 pb-2 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm z-20">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{getMonthName(new Date())}</p>
          <h1 className="text-xl font-bold text-slate-800">
            {activeTab === 'dashboard' ? 'Visão Geral' : 
             activeTab === 'cards' ? 'Cartões' :
             activeTab === 'fixed' ? 'Fixas' :
             activeTab === 'variable' ? 'Variáveis' : 'Ganhos'}
          </h1>
        </div>
        <div className="relative">
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
             <Settings size={24} />
          </button>
          {showSettings && (
             <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 z-50">
                <button 
                  onClick={clearAllData}
                  className="w-full flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
                >
                  <Trash2 size={16} />
                  Resetar Dados
                </button>
             </div>
          )}
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
        {renderContent()}
      </main>

      {/* Floating Action Button (Dynamic based on Tab) */}
      <button 
        onClick={() => openAddModal(activeTab === 'dashboard' ? 'variable' : activeTab === 'cards' ? 'new_card' : activeTab as TransactionType)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl shadow-slate-900/30 flex items-center justify-center active:scale-90 transition-transform z-40 hover:bg-slate-800"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-100 h-20 px-2 flex justify-between items-center z-50 pb-2">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
        >
          <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Resumo</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('cards')} 
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === 'cards' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
        >
          <CreditCard size={22} strokeWidth={activeTab === 'cards' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Cartões</span>
        </button>

        <button 
          onClick={() => setActiveTab('fixed')} 
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === 'fixed' ? 'text-purple-600' : 'text-slate-300 hover:text-slate-500'}`}
        >
          <CalendarClock size={22} strokeWidth={activeTab === 'fixed' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Fixas</span>
        </button>

        <button 
          onClick={() => setActiveTab('variable')} 
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === 'variable' ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}
        >
          <div className="relative">
            <CreditCard size={22} strokeWidth={activeTab === 'variable' ? 2.5 : 2} />
             {/* Simple visual trick to distinguish from Cards icon */}
             <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full border border-white"></div>
          </div>
          <span className="text-[10px] font-medium">Gastos</span>
        </button>

        <button 
          onClick={() => setActiveTab('income')} 
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === 'income' ? 'text-green-600' : 'text-slate-300 hover:text-slate-500'}`}
        >
          <Banknote size={22} strokeWidth={activeTab === 'income' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Ganhos</span>
        </button>
      </nav>

      {/* Modals */}
      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveData}
        defaultType={modalDefaultType}
      />
    </div>
  );
};

export default App;