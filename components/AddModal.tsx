import React, { useState } from 'react';
import { X, Plus, Check, Wallet, Star, Percent, CreditCard } from 'lucide-react';
import { TransactionType, CATEGORIES, CARD_COLORS } from '../types';
import { getCurrentDateISO } from '../utils';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  defaultType: TransactionType | 'new_card'; // Added 'new_card'
}

const INCOME_OPTIONS = [
  { label: 'Salário', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { label: 'Extra', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  { label: 'Comissão', icon: Percent, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
];

export const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onSave, defaultType }) => {
  const [type, setType] = useState<TransactionType | 'new_card'>(defaultType);
  
  // Transaction State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateISO());
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isCustomDesc, setIsCustomDesc] = useState(false);

  // Card State
  const [cardName, setCardName] = useState('');
  const [cardDueDay, setCardDueDay] = useState('10');
  const [cardColor, setCardColor] = useState(CARD_COLORS[0].value);

  React.useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      
      // Reset Transaction
      setDescription('');
      setIsCustomDesc(false);
      setAmount('');
      setDate(getCurrentDateISO());
      setCategory(CATEGORIES[0]);

      // Reset Card
      setCardName('');
      setCardDueDay('10');
      setCardColor(CARD_COLORS[0].value);
    }
  }, [isOpen, defaultType]);

  React.useEffect(() => {
    if (type === 'income') {
        setDescription('');
        setIsCustomDesc(false);
    } else if (type === 'variable' || type === 'fixed') {
        setDescription('');
        setIsCustomDesc(true);
    }
  }, [type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'new_card') {
      if (!cardName) return;
      onSave({
        type: 'new_card',
        name: cardName,
        dueDay: parseInt(cardDueDay),
        color: cardColor
      });
    } else {
      if (!description || !amount) return;
      onSave({
        type,
        description,
        amount: parseFloat(amount.replace(',', '.')),
        date,
        category: type === 'variable' ? category : undefined,
        isPaid: false,
      });
    }
    onClose();
  };

  const handlePresetClick = (val: string) => {
    setDescription(val);
    setIsCustomDesc(false);
  };

  // Render content for Adding a New Card
  if (type === 'new_card') {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Novo Cartão</h2>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome do Cartão</label>
              <input
                type="text"
                autoFocus
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-xl focus:outline-none font-medium text-slate-700 placeholder:text-slate-400"
                placeholder="Ex: Nubank, Visa..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dia do Vencimento</label>
              <select
                value={cardDueDay}
                onChange={(e) => setCardDueDay(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-xl focus:outline-none text-slate-700 font-medium appearance-none"
              >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cor do Cartão</label>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {CARD_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCardColor(c.value)}
                    className={`w-12 h-12 rounded-full flex-shrink-0 ${c.value} flex items-center justify-center transition-all ${cardColor === c.value ? 'ring-4 ring-offset-2 ring-slate-200 scale-110' : 'opacity-70 hover:opacity-100'}`}
                  >
                    {cardColor === c.value && <Check size={20} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-6 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all hover:bg-slate-800"
            >
              Salvar Cartão
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Standard Transaction Modal
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Novo Lançamento</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setType('variable')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${type === 'variable' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('fixed')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${type === 'fixed' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
            >
              Fixo
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
            >
              Ganho
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Valor</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium group-focus-within:text-slate-600 transition-colors">R$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl focus:outline-none text-2xl font-bold text-slate-800 transition-all placeholder:text-slate-300"
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {type === 'income' ? 'Fonte' : 'Descrição'}
            </label>

            {type === 'income' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  {INCOME_OPTIONS.map((opt) => {
                    const isSelected = description === opt.label && !isCustomDesc;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handlePresetClick(opt.label)}
                        className={`
                          flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all duration-200 aspect-square
                          ${isSelected
                            ? `${opt.bg} ${opt.border} ring-1 ring-offset-1 ${opt.color.replace('text-', 'ring-')}` 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}
                        `}
                      >
                        <opt.icon size={24} className={`mb-1 ${isSelected ? opt.color : 'text-slate-400'}`} strokeWidth={2.5} />
                        <span className={`text-[10px] font-bold ${isSelected ? opt.color : 'text-slate-500'}`}>{opt.label}</span>
                      </button>
                    );
                  })}
                  
                  <button
                    type="button"
                    onClick={() => { setIsCustomDesc(true); setDescription(''); }}
                    className={`
                      flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-dashed transition-all duration-200 aspect-square
                      ${isCustomDesc 
                        ? 'bg-slate-100 border-slate-300 text-slate-800' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}
                    `}
                  >
                    <Plus size={24} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold">Outro</span>
                  </button>
                </div>

                {isCustomDesc && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <input
                        type="text"
                        autoFocus
                        required={isCustomDesc}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none font-medium text-slate-700"
                        placeholder="Digite a fonte de renda..."
                      />
                   </div>
                )}
                
                {!isCustomDesc && description && !INCOME_OPTIONS.find(o => o.label === description) && (
                    <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in">
                        <span className="font-medium text-slate-700">{description}</span>
                        <button onClick={() => setIsCustomDesc(true)} className="text-xs font-bold text-blue-600 hover:underline">Editar</button>
                    </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-xl focus:outline-none font-medium text-slate-700 placeholder:text-slate-400 transition-colors"
                placeholder={type === 'fixed' ? 'Ex: Aluguel' : 'Ex: Padaria'}
              />
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-xl focus:outline-none text-slate-600 font-medium"
              />
            </div>
            
            {type === 'variable' && (
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria</label>
                <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-xl focus:outline-none text-slate-600 font-medium appearance-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-6 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all hover:bg-slate-800"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
};