import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  Circle, 
  TrendingUp, 
  TrendingDown, 
  PieChart as ChartIcon, 
  List, 
  Download,
  Calendar,
  Layers,
  MoreVertical,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Settings,
  Sun,
  Moon,
  Upload,
  ShoppingBag,
  Car,
  Home,
  Coffee,
  Heart,
  Book,
  Smartphone,
  Briefcase,
  DollarSign,
  HelpCircle,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, addMonths, subMonths, startOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Account, AccountType, CATEGORIES, CATEGORY_COLORS } from './types';
import { cn, formatCurrency, exportToCSV } from './lib/utils';

// --- Components ---

const currentMonthStr = format(new Date(), 'yyyy-MM');

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Alimentação': return <Coffee size={14} />;
    case 'Transporte': return <Car size={14} />;
    case 'Moradia': return <Home size={14} />;
    case 'Lazer': return <ShoppingBag size={14} />;
    case 'Saúde': return <Heart size={14} />;
    case 'Educação': return <Book size={14} />;
    case 'Assinaturas': return <Smartphone size={14} />;
    case 'Salário': return <DollarSign size={14} />;
    case 'Freelance': return <Briefcase size={14} />;
    case 'Investimento': return <TrendingUp size={14} />;
    default: return <HelpCircle size={14} />;
  }
};

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="bg-white dark:bg-slate-800/50 p-3 sm:p-5 min-w-[140px] flex-1 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-3 sm:gap-4 transition-all hover:shadow-xl hover:bg-white dark:hover:bg-slate-800"
  >
    <div className={cn("p-2.5 sm:p-3 rounded-2xl shrink-0 shadow-sm", color)}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-0.5">{title}</p>
      <p className="text-sm sm:text-lg font-black text-slate-900 dark:text-white leading-none">{formatCurrency(value)}</p>
    </div>
  </motion.div>
);

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  const currentMonthYear = format(selectedDate, 'yyyy-MM');

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<AccountType>('expense');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasInstallments, setHasInstallments] = useState(false);
  const [currentInstallment, setCurrentInstallment] = useState('1');
  const [totalInstallments, setTotalInstallments] = useState('12');

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('tatufinancas_accounts');
    const savedTheme = localStorage.getItem('tatufinancas_theme');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Migration: ensure all accounts have a month field
        const migrated = parsed.map((a: any) => ({
          ...a,
          month: a.month || format(new Date(a.createdAt || new Date()), 'yyyy-MM')
        }));
        setAccounts(migrated);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('tatufinancas_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tatufinancas_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tatufinancas_theme', 'light');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        let importedAccounts: Account[] = [];

        // Support for old schema (Object with accounts/incomes)
        if (!Array.isArray(json) && typeof json === 'object') {
          const oldAccounts = json.accounts || [];
          const oldIncomes = json.incomes || [];

          // Map expenses
          const mappedExpenses = oldAccounts.map((a: any) => ({
            id: a.id || crypto.randomUUID(),
            title: a.name || a.title || 'Sem título',
            amount: parseFloat(a.value || a.amount || 0),
            type: 'expense' as const,
            category: a.category || 'Outros',
            isPaid: a.status === 'PAID' || !!a.isPaid,
            isRecurring: !!a.isRecurrent || !!a.isRecurring,
            month: a.paymentDate ? format(new Date(a.paymentDate), 'yyyy-MM') : format(new Date(), 'yyyy-MM'),
            installments: a.isInstallment ? { 
              current: a.currentInstallment || 1, 
              total: a.totalInstallments || 1 
            } : null,
            createdAt: a.paymentDate || new Date().toISOString(),
          }));

          // Map incomes
          const mappedIncomes = oldIncomes.map((i: any) => ({
            id: i.id || crypto.randomUUID(),
            title: i.name || 'Receita',
            amount: parseFloat(i.value || 0),
            type: 'income' as const,
            category: 'Salário',
            isPaid: true,
            isRecurring: !!i.isRecurrent,
            month: i.date ? format(new Date(i.date), 'yyyy-MM') : format(new Date(), 'yyyy-MM'),
            installments: null,
            createdAt: i.date || new Date().toISOString(),
          }));

          importedAccounts = [...mappedExpenses, ...mappedIncomes];
        } 
        // Support for new schema (Array of accounts)
        else if (Array.isArray(json)) {
          importedAccounts = json.map(a => ({
            ...a,
            month: a.month || format(new Date(a.createdAt || new Date()), 'yyyy-MM')
          }));
        }

        if (importedAccounts.length > 0) {
          setAccounts(importedAccounts);
          alert('Backup importado com sucesso!');
          setIsSettingsOpen(false);
        } else {
          alert('Formato de backup inválido ou vazio.');
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Erro ao processar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount: Account = {
      id: editingAccount?.id || crypto.randomUUID(),
      title,
      amount: parseFloat(amount),
      type,
      category,
      isPaid: editingAccount?.isPaid || false,
      isRecurring,
      month: currentMonthYear,
      installments: hasInstallments ? { 
        current: parseInt(currentInstallment), 
        total: parseInt(totalInstallments) 
      } : null,
      createdAt: editingAccount?.createdAt || new Date().toISOString(),
    };

    if (editingAccount) {
      setAccounts(accounts.map(a => a.id === editingAccount.id ? newAccount : a));
    } else {
      setAccounts([newAccount, ...accounts]);
    }

    closeModal();
  };

  const openModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setTitle(account.title);
      setAmount(account.amount.toString());
      setType(account.type);
      setCategory(account.category);
      setIsRecurring(account.isRecurring);
      setHasInstallments(!!account.installments);
      if (account.installments) {
        setCurrentInstallment(account.installments.current.toString());
        setTotalInstallments(account.installments.total.toString());
      }
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingAccount(null);
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory(CATEGORIES.expense[0]);
    setIsRecurring(false);
    setHasInstallments(false);
    setCurrentInstallment('1');
    setTotalInstallments('12');
  };

  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  const togglePaid = (id: string) => {
    setAccounts(accounts.map(a => 
      a.id === id ? { ...a, isPaid: !a.isPaid } : a
    ));
    
    // Auto-scroll logic or sort will handle position
  };

  const handleExport = () => {
    exportToCSV(accounts, `finanças-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const nextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
  const prevMonth = () => setSelectedDate(subMonths(selectedDate, 1));

  // Calculations for SELECTED month
  const monthAccounts = accounts.filter(a => a.month === currentMonthYear);
  
  // Now main list only shows expenses as requested
  const filteredAccounts = monthAccounts.filter(a => {
    const isExpense = a.type === 'expense';
    const matchesCategory = filterCategory ? a.category === filterCategory : true;
    return isExpense && matchesCategory;
  });

  const totalExpenses = monthAccounts
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPaid = monthAccounts
    .filter(a => a.type === 'expense' && a.isPaid)
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPending = totalExpenses - totalPaid;

  const totalIncome = monthAccounts
    .filter(a => a.type === 'income')
    .reduce((sum, a) => sum + a.amount, 0);

  const balance = totalIncome - totalPaid;

  // Sorting: Unpaid first, then Paid
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (a.isPaid === b.isPaid) return 0;
    return a.isPaid ? 1 : -1;
  });

  // Chart Data
  const categoryData = Object.entries(
    filteredAccounts
      .filter(a => a.type === 'expense')
      .reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + a.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const cashFlowData = [
    { name: 'Receita', value: totalIncome, fill: '#10b981' },
    { name: 'Despesa', value: totalExpenses, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-32 transition-colors duration-300">
      {/* Header / Summary Section */}
      <AnimatePresence>
        {!isHeaderHidden && (
          <motion.header 
            initial={{ height: 'auto', opacity: 1 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            className="bg-slate-900 dark:bg-black border-b border-white/5 p-4 sm:p-6 shadow-2xl sticky top-0 z-40"
          >
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-rose-500/5 pointer-events-none" />
            
            <div className="max-w-screen-2xl mx-auto space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                    <CreditCard size={22} />
                  </div>
                  <h1 className="text-xl font-black tracking-tighter text-white">Tatu Finanças</h1>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsHeaderHidden(true)}
                    className="p-3 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl border border-white/10 transition-all shadow-sm active:scale-95"
                    title="Esconder Resumo"
                  >
                    <EyeOff size={20} />
                  </button>
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-3 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl border border-white/10 transition-all shadow-sm active:scale-95"
                  >
                    <Settings size={22} />
                  </button>
                </div>
              </div>
          
          <div className="flex items-center justify-between gap-4">
            {/* Minimal Navigation & Filters Cluster */}
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              {/* Month Selector */}
              <div className="flex items-center gap-1 border-r border-white/10 pr-1 mr-1">
                <button onClick={prevMonth} className="p-1.5 text-white/40 hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.2em] min-w-[80px] text-center">
                  {format(selectedDate, 'MMM yy', { locale: ptBR })}
                </span>
                <button onClick={nextMonth} className="p-1.5 text-white/40 hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Category Filter Menu */}
              <div className="relative group">
                <button 
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filterCategory ? "bg-indigo-600 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Filter size={14} />
                  <span className="hidden sm:inline">{filterCategory || 'Filtrar'}</span>
                  <ChevronDown size={12} className={cn("transition-transform", filterCategory ? "rotate-180" : "")} />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                  <button 
                    onClick={() => setFilterCategory(null)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1",
                      filterCategory === null ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    Todas Categorias
                  </button>
                  {Object.keys(CATEGORY_COLORS).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                        filterCategory === cat ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {getCategoryIcon(cat)}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View Switcher (Desktop Only) */}
            <nav className="hidden sm:flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => setActiveTab('list')}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest",
                  activeTab === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white"
                )}
              >
                <List size={14} />
                <span>Contas</span>
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest",
                  activeTab === 'stats' ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white"
                )}
              >
                <ChartIcon size={14} />
                <span>Gráficos</span>
              </button>
            </nav>
          </div>

          {/* Top: Summary Cards Row (Dark Themed) */}
          <div className="flex flex-nowrap overflow-x-auto pb-1 gap-3 no-scrollbar lg:grid lg:grid-cols-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[140px] flex-1">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Receitas</p>
              <p className="text-lg font-black text-emerald-400">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[140px] flex-1">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Despesas</p>
              <p className="text-lg font-black text-rose-400">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[140px] flex-1">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Pendente</p>
              <p className="text-lg font-black text-amber-400">{formatCurrency(totalPending)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[140px] flex-1">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Saldo</p>
              <p className="text-lg font-black text-white">{formatCurrency(balance)}</p>
            </div>
            </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Show header toggle when hidden */}
      {isHeaderHidden && (
        <div className="sticky top-4 left-0 right-0 z-40 pointer-events-none px-4">
          <div className="max-w-screen-2xl mx-auto flex justify-end">
            <button 
              onClick={() => setIsHeaderHidden(false)}
              className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl border border-white/10 pointer-events-auto transition-all active:scale-95 hover:bg-indigo-600"
              title="Mostrar Resumo"
            >
              <Eye size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation (Subtle) */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <nav className="flex items-center bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2",
              activeTab === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white"
            )}
          >
            <List size={16} />
            <span>CONTAS</span>
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2",
              activeTab === 'stats' ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white"
            )}
          >
            <ChartIcon size={16} />
            <span>GRÁFICOS</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 mt-4 sm:mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-32"
            >
              {sortedAccounts.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-20 text-center flex flex-col items-center justify-center">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full text-indigo-600 dark:text-indigo-400 mb-6 animate-bounce">
                    <ShieldCheck size={48} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Seu tatu está descansando!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs font-medium">Nada para monitorar em {format(selectedDate, 'MMMM', { locale: ptBR })}. Buraco vazio é sinal de economia!</p>
                  <button 
                    onClick={() => openModal()}
                    className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    Começar a Cavar
                  </button>
                </div>
              ) : (
                sortedAccounts.map(account => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      layout: { type: "spring", stiffness: 350, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    key={account.id}
                    className={cn(
                      "group bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-[1.75rem] shadow-sm border transition-all flex flex-col h-full min-h-[150px] relative overflow-hidden",
                      account.isPaid 
                        ? "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70 grayscale-[0.3] shadow-inner" 
                        : account.type === 'income' 
                          ? "border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-100/20"
                          : "border-slate-100 dark:border-slate-700 hover:border-indigo-400 hover:shadow-xl active:scale-[0.98]"
                    )}
                  >
                    {/* Semantic side bar */}
                    <div className={cn(
                      "absolute top-0 left-0 w-1.5 h-full transition-colors duration-500",
                      account.isPaid ? "bg-slate-300 dark:bg-slate-700" : (account.type === 'income' ? "bg-emerald-500" : "bg-indigo-600")
                    )} />

                    <div className="flex justify-between items-start mb-3 sm:mb-4 px-1">
                      <span className={cn(
                        "px-3 py-1 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border shadow-xs transition-colors",
                        CATEGORY_COLORS[account.category] || "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border-transparent"
                      )}>
                        {getCategoryIcon(account.category)}
                        {account.category}
                      </span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => openModal(account)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600 shadow-xs"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteAccount(account.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600 shadow-xs"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 px-1">
                      <h3 className={cn(
                        "text-sm font-bold mb-1 sm:mb-2 leading-tight sm:leading-snug line-clamp-1 sm:line-clamp-2 transition-colors",
                        account.isPaid ? "text-slate-500 dark:text-slate-500" : "text-slate-900 dark:text-white"
                      )}>{account.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className={cn(
                          "text-lg sm:text-xl font-black tracking-tighter transition-colors",
                          account.type === 'income' ? "text-emerald-600" : (account.isPaid ? "text-slate-500" : "text-slate-900 dark:text-white")
                        )}>
                          {account.type === 'income' ? '+': '-'} {formatCurrency(account.amount)}
                        </span>
                      </div>

                      {/* Installment Progress Bar */}
                      {account.installments && (
                        <div className="mt-4 sm:mt-5 space-y-2">
                          <div className={cn(
                            "flex justify-between text-[10px] font-bold uppercase tracking-widest transition-colors",
                            account.isPaid ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
                          )}>
                            <span className="flex items-center gap-1.5 h-4">
                              <Layers size={12} className="opacity-60" /> Parcela
                            </span>
                            <span className="font-black text-slate-900 dark:text-slate-200">
                              {account.installments.current} / {account.installments.total}
                            </span>
                          </div>
                          <div className="w-full h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-50 dark:border-white/5 shadow-inner relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(account.installments.current / account.installments.total) * 100}%` }}
                              className={cn(
                                "h-full rounded-full transition-all relative overflow-hidden",
                                account.isPaid 
                                  ? "bg-slate-400 dark:bg-slate-600" 
                                  : (account.type === 'income' ? "bg-emerald-500" : "bg-indigo-600")
                              )} 
                            >
                              {!account.isPaid && <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />}
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 pt-4 sm:pt-6 mt-3 sm:mt-4 border-t transition-colors",
                      account.isPaid ? "border-slate-100 dark:border-slate-700/50" : "border-slate-50 dark:border-slate-700"
                    )}>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => togglePaid(account.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-2xl text-[10px] sm:text-[11px] font-black transition-all shadow-sm",
                          account.isPaid 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" 
                            : (account.type === 'income' 
                                ? "bg-emerald-600 text-white shadow-emerald-100 dark:shadow-none hover:bg-emerald-700" 
                                : "bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none hover:bg-indigo-700")
                        )}
                      >
                        <AnimatePresence mode="wait">
                          {account.isPaid ? (
                            <motion.div 
                              key="paid"
                              initial={{ scale: 0.8, opacity: 0 }} 
                              animate={{ scale: 1, opacity: 1 }} 
                              className="flex items-center gap-2 capitalize"
                            >
                              <CheckCircle size={14} />
                              <span>Pago</span>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="unpaid"
                              initial={{ scale: 0.8, opacity: 0 }} 
                              animate={{ scale: 1, opacity: 1 }} 
                              className="flex items-center gap-2 uppercase tracking-widest"
                            >
                              {account.type === 'income' ? <Plus size={14} /> : <Circle size={14} />}
                              <span>{account.type === 'income' ? 'Recebido' : 'Pagar'}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                      <div className="flex gap-2">
                        {account.isRecurring && <Layers size={14} className={account.isPaid ? "text-emerald-400" : "text-indigo-400"} title="Recorrente" />}
                        {!account.installments && !account.isRecurring && <Calendar size={14} className="text-gray-200" />}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pb-32"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash Flow Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none" />
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-6 flex items-center gap-2.5 tracking-[0.2em]">
                    <TrendingUp size={16} className="text-emerald-500" />
                    Fluxo de Caixa
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tickFormatter={(val) => `R$${val}`} stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                          contentStyle={{ 
                            borderRadius: '24px', 
                            border: 'none', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                            backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                            color: isDarkMode ? '#fff' : '#000'
                          }}
                        />
                        <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={48}>
                          {cashFlowData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Categories Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-3xl pointer-events-none" />
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-6 flex items-center gap-2.5 tracking-[0.2em]">
                    <ChartIcon size={16} className="text-indigo-500" />
                    Por Categoria
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={6}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                '#6366f1', // Indigo
                                '#10b981', // Emerald
                                '#f59e0b', // Amber
                                '#f43f5e', // Rose
                                '#ec4899', // Pink
                                '#8b5cf6', // Violet
                                '#06b6d4', // Cyan
                                '#64748b'  // Slate
                              ][index % 8]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '24px', 
                            border: 'none', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                            backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                            color: isDarkMode ? '#f8fafc' : '#0f172a'
                          }}
                          itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Balance Summary Card */}
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 opacity-50" />
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
                  <div className="flex-1 space-y-8 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-2">Monitor de Saúde</h4>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Comprometimento</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-3xl sm:text-4xl font-black transition-colors leading-none",
                          (totalExpenses/totalIncome) > 0.8 ? "text-rose-500" : "text-indigo-600 dark:text-indigo-400"
                        )}>{totalIncome > 0 ? Math.round((totalExpenses/totalIncome) * 100) : 0}%</span>
                      </div>
                    </div>
                    
                    <div className="relative pt-2">
                      <div className="w-full h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-50 dark:border-white/5 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, totalIncome > 0 ? (totalExpenses/totalIncome) * 100 : 0)}%` }}
                          className={cn(
                            "h-full rounded-full transition-all relative overflow-hidden",
                            (totalExpenses/totalIncome) > 0.8 ? "bg-rose-500" : "bg-indigo-600 dark:bg-indigo-500"
                          )}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '100% 100%' }} />
                        </motion.div>
                      </div>
                      <div className="flex justify-between mt-3 px-1">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ideal (&lt;50%)</span>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Alerta (70%)</span>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Crítico (90%)</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl px-1">
                      Para uma vida financeira sustentável, procure manter seus gastos fixos e variáveis abaixo de 70% da sua renda mensal. Isso permite construir uma reserva para imprevistos e investimentos.
                    </p>
                  </div>
                  
                  <div className="w-full lg:w-80 text-center p-8 sm:p-12 bg-slate-50/50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-inner flex flex-col justify-center">
                    <p className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-3">Disponível Agora</p>
                    <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 leading-none">{formatCurrency(balance)}</p>
                    <p className="text-xs text-slate-400 font-bold mt-4">Referente a {format(selectedDate, 'MMM yyyy', { locale: ptBR })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); openModal(); }}
          className="bg-indigo-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Plus size={32} className="transition-transform duration-300 relative z-10 group-hover:rotate-90" />
        </motion.button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-white/5"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3 px-1">
                  <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none text-white">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Ajustes</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Personalize sua experiência</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white rounded-2xl transition-colors border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Visual</h3>
                  <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Tema {isDarkMode ? 'Claro' : 'Escuro'}</span>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      isDarkMode ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                    )}>
                      <div className={cn(
                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                        isDarkMode ? "translate-x-6" : "translate-x-0"
                      )} />
                    </div>
                  </button>
                </div>

                {/* Manage Incomes (Receitas) */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Entradas (Receitas)</h3>
                    <button 
                      onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); openModal(); setIsSettingsOpen(false); }}
                      className="p-1 px-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Plus size={14} />
                      Novo
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {monthAccounts.filter(a => a.type === 'income').length > 0 ? (
                      monthAccounts.filter(a => a.type === 'income').map(income => (
                        <div key={income.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-white/5 group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                              <TrendingUp size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{income.title}</p>
                              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{income.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-emerald-500">{formatCurrency(income.amount)}</span>
                            <button 
                              onClick={() => { setEditingAccount(income); setIsModalOpen(true); setIsSettingsOpen(false); }}
                              className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors"
                            >
                              <Settings size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                        <p className="text-xs text-slate-400 font-medium">Nenhuma receita este mês.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Dados</h3>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={handleImportJSON}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                        <Upload size={20} />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Importar Backup</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleExport}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs"
                  >
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                      <Download size={20} />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">Exportar CSV</span>
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.')) {
                        setAccounts([]);
                        localStorage.removeItem('tatufinancas_accounts');
                        alert('Dados removidos com sucesso!');
                        setIsSettingsOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-rose-500/5 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20 shadow-xs group"
                  >
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                      <Trash2 size={20} />
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 transition-colors">Zerar Todos os Dados</span>
                  </button>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.25em]">Tatu Finanças v2.0.0 • 2026</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="glass dark:dark-glass w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20 dark:border-white/5"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl text-white shadow-lg",
                    type === 'income' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
                  )}>
                    {type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{editingAccount ? 'Editar Registro' : 'Novo Registro'}</h2>
                </div>
                <button onClick={closeModal} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 dark:text-slate-500 shadow-sm border border-transparent hover:border-slate-200">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl mb-4">
                  <button 
                    type="button"
                    onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
                    className={cn(
                      "flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest",
                      type === 'expense' ? "bg-white dark:bg-slate-800 text-rose-600 shadow-sm border border-rose-100 dark:border-rose-900/30" : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    Despesa
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
                    className={cn(
                      "flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest",
                      type === 'income' ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-900/30" : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    Receita
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Descrição</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Aluguel, Supermercado..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white/50 dark:bg-slate-900/30 text-slate-900 dark:text-white outline-none transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Valor (R$)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white/50 dark:bg-slate-900/30 text-slate-900 dark:text-white outline-none transition-all font-black placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Categoria</label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white/50 dark:bg-slate-900/30 text-slate-900 dark:text-white outline-none transition-all font-bold appearance-none cursor-pointer"
                      >
                        {CATEGORIES[type].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  <label className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-white/5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-indigo-500">
                        <Layers size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight">Registro Recorrente</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-11 h-6 rounded-full transition-all",
                        isRecurring ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                      )} />
                      <div className={cn(
                        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm",
                        isRecurring ? "translate-x-5" : ""
                      )} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-white/5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-amber-500">
                        <Calendar size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight">Pagamento Parcelado</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={hasInstallments}
                        onChange={(e) => setHasInstallments(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-11 h-6 rounded-full transition-all",
                        hasInstallments ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                      )} />
                      <div className={cn(
                        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm",
                        hasInstallments ? "translate-x-5" : ""
                      )} />
                    </div>
                  </label>
                </div>

                {hasInstallments && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-4 pt-2 overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Parcela Atual</label>
                      <input 
                        type="number" 
                        value={currentInstallment}
                        onChange={(e) => setCurrentInstallment(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 bg-white/50 dark:bg-slate-900/30 text-slate-900 dark:text-white outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Total</label>
                      <input 
                        type="number" 
                        value={totalInstallments}
                        onChange={(e) => setTotalInstallments(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 bg-white/50 dark:bg-slate-900/30 text-slate-900 dark:text-white outline-none font-bold"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 py-4 rounded-[1.5rem] font-bold transition-all border border-slate-100 dark:border-white/5"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[1.5rem] font-black transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {editingAccount ? <CheckCircle size={18} /> : <Plus size={18} />}
                    {editingAccount ? 'Salvar Mudanças' : 'Criar Registro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
