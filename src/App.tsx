import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  Circle, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  List, 
  Download,
  Calendar,
  Layers,
  MoreVertical,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
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
  PieChart as ChartIcon,
  HelpCircle,
  ShieldCheck,
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

const SAMPLE_ACCOUNTS: Account[] = [
  { id: '1', title: 'Salário Mensal', amount: 5500, type: 'income', category: 'Salário', isPaid: true, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '2', title: 'Aluguel Casa', amount: 1800, type: 'expense', category: 'Moradia', isPaid: true, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '3', title: 'Supermercado Mensal', amount: 950.40, type: 'expense', category: 'Alimentação', isPaid: true, isRecurring: false, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '4', title: 'Internet Fibra', amount: 120, type: 'expense', category: 'Assinaturas', isPaid: false, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '5', title: 'Parcela Notebook', amount: 450, type: 'expense', category: 'Outros', isPaid: false, isRecurring: false, installments: { current: 4, total: 12 }, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '6', title: 'Freelance Design', amount: 1200, type: 'income', category: 'Freelance', isPaid: false, isRecurring: false, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '7', title: 'Condomínio', amount: 450, type: 'expense', category: 'Moradia', isPaid: true, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '8', title: 'Energia Elétrica', amount: 280.50, type: 'expense', category: 'Moradia', isPaid: false, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '9', title: 'Netflix & Spotify', amount: 85.90, type: 'expense', category: 'Assinaturas', isPaid: true, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '10', title: 'Academia', amount: 110, type: 'expense', category: 'Saúde', isPaid: true, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '11', title: 'Curso de Inglês', amount: 350, type: 'expense', category: 'Educação', isPaid: false, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '12', title: 'Uber / Transporte', amount: 420, type: 'expense', category: 'Transporte', isPaid: true, isRecurring: false, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '13', title: 'Rendimento CDB', amount: 125.30, type: 'income', category: 'Investimento', isPaid: true, isRecurring: true, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '14', title: 'Seguro Carro', amount: 210, type: 'expense', category: 'Transporte', isPaid: true, isRecurring: false, installments: { current: 8, total: 10 }, createdAt: new Date().toISOString(), month: currentMonthStr },
  { id: '15', title: 'Restaurante Fim de Semana', amount: 180, type: 'expense', category: 'Lazer', isPaid: false, isRecurring: false, installments: null, createdAt: new Date().toISOString(), month: currentMonthStr },
];

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
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 p-4 min-w-[180px] flex-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 transition-all hover:shadow-md"
  >
    <div className={cn("p-2.5 rounded-xl shrink-0", color)}>
      {React.cloneElement(icon as React.ReactElement, { size: 18 })}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">{title}</p>
      <p className="text-base font-black text-gray-900 dark:text-white truncate">{formatCurrency(value)}</p>
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migration: ensure all accounts have a month field
        const migrated = parsed.map((a: any) => ({
          ...a,
          month: a.month || format(new Date(a.createdAt || new Date()), 'yyyy-MM')
        }));
        setAccounts(migrated);
      } else {
        setAccounts(SAMPLE_ACCOUNTS);
      }
    } else {
      setAccounts(SAMPLE_ACCOUNTS);
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
        if (Array.isArray(json)) {
          setAccounts(json);
          alert('Backup importado com sucesso!');
          setIsSettingsOpen(false);
        } else {
          alert('Formato de backup inválido.');
        }
      } catch (err) {
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
  };

  const handleExport = () => {
    exportToCSV(accounts, `finanças-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const nextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
  const prevMonth = () => setSelectedDate(subMonths(selectedDate, 1));

  // Calculations for SELECTED month
  const filteredAccounts = accounts.filter(a => a.month === currentMonthYear);

  const totalExpenses = filteredAccounts
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPaid = filteredAccounts
    .filter(a => a.type === 'expense' && a.isPaid)
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPending = totalExpenses - totalPaid;

  const totalIncome = filteredAccounts
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans pb-20 transition-colors duration-300">
      {/* Header / Summary Section */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                <CreditCard size={18} />
              </div>
              <h1 className="text-lg font-black tracking-tighter text-gray-900 dark:text-white">Tatu Finanças</h1>
            </div>
          </div>
          
          {/* Month Selector + Settings Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
              <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-xl transition-all text-gray-400 dark:text-gray-500 hover:text-indigo-600 active:scale-95">
                <ChevronLeft size={20} />
              </button>
              <div className="flex flex-col items-center">
                <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />
                  {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                </h2>
              </div>
              <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-xl transition-all text-gray-400 dark:text-gray-500 hover:text-indigo-600 active:scale-95">
                <ChevronRight size={20} />
              </button>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3.5 bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all shadow-sm active:scale-95"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Top: Summary Cards Row */}
          <div className="flex flex-nowrap overflow-x-auto pb-2 gap-4 no-scrollbar lg:justify-between">
            <StatCard 
              title="Total de Contas" 
              value={totalExpenses} 
              icon={<TrendingDown />} 
              color="bg-red-50 text-red-600"
            />
            <StatCard 
              title="Já Pago" 
              value={totalPaid} 
              icon={<CheckCircle />} 
              color="bg-emerald-50 text-emerald-600"
            />
            <StatCard 
              title="Falta Pagar" 
              value={totalPending} 
              icon={<Calendar />} 
              color="bg-amber-50 text-amber-600"
            />
            <StatCard 
              title="Saldo" 
              value={balance} 
              icon={<TrendingUp />} 
              color="bg-blue-50 text-blue-600"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32"
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    key={account.id}
                    className={cn(
                      "group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border transition-all flex flex-col h-full min-h-[180px]",
                      account.isPaid 
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10 opacity-90 shadow-inner" 
                        : "border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                        CATEGORY_COLORS[account.category] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      )}>
                        {getCategoryIcon(account.category)}
                        {account.category}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(account)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent shadow-sm"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteAccount(account.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className={cn(
                        "font-bold mb-2 leading-snug line-clamp-2",
                        account.isPaid ? "text-emerald-900 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                      )}>{account.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className={cn(
                          "text-xl font-black tracking-tight",
                          account.type === 'income' ? "text-emerald-600" : (account.isPaid ? "text-emerald-700 dark:text-emerald-500" : "text-gray-900 dark:text-white")
                        )}>
                          {account.type === 'income' ? '+': '-'} {formatCurrency(account.amount)}
                        </span>
                      </div>

                      {/* Installment Progress Bar */}
                      {account.installments && (
                        <div className="mt-4 space-y-2">
                          <div className={cn(
                            "flex justify-between text-lg font-black uppercase tracking-widest",
                            account.isPaid ? "text-emerald-600 dark:text-emerald-500" : "text-indigo-600 dark:text-indigo-400"
                          )}>
                            <span>Parcelas</span>
                            <span>{account.installments.current} / {account.installments.total}</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-50 dark:border-gray-600 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(account.installments.current / account.installments.total) * 100}%` }}
                              className={cn(
                                "h-full rounded-full transition-all relative overflow-hidden",
                                account.isPaid ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                              )} 
                            >
                              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 pt-6 mt-4 border-t",
                      account.isPaid ? "border-emerald-100 dark:border-emerald-800/50" : "border-gray-50 dark:border-gray-700"
                    )}>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => togglePaid(account.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black transition-all",
                          account.isPaid 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none" 
                            : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-600 hover:text-white"
                        )}
                      >
                        {account.isPaid ? (
                          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                            <CheckCircle size={14} />
                            <span>PAGO</span>
                          </motion.div>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Circle size={14} />
                            <span>PAGAR</span>
                          </span>
                        )}
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
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-6 flex items-center gap-2 tracking-widest">
                    <TrendingUp size={14} />
                    Fluxo de Caixa Mensal
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#f0f0f0"} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} stroke={isDarkMode ? "#9ca3af" : "#4b5563"} />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tickFormatter={(val) => `R$${val}`} stroke={isDarkMode ? "#9ca3af" : "#4b5563"} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                            color: isDarkMode ? '#fff' : '#000'
                          }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                          {cashFlowData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Categories Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-6 flex items-center gap-2 tracking-widest">
                    <PieChartIcon size={14} />
                    Gastos por Categoria
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                '#6366f1', // Indigo
                                '#10b981', // Emerald
                                '#f59e0b', // Amber
                                '#ef4444', // Red
                                '#ec4899', // Pink
                                '#8b5cf6', // Violet
                                '#06b6d4', // Cyan
                                '#4b5563'  // Gray
                              ][index % 8]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                            color: isDarkMode ? '#f3f4f6' : '#111827'
                          }}
                          itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Balance Summary */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-6 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Saúde Financeira</h4>
                        <p className="text-xl font-black text-gray-900 dark:text-white">Comprometimento de Renda</p>
                      </div>
                      <span className={cn(
                        "text-2xl font-black",
                        (totalExpenses/totalIncome) > 0.8 ? "text-red-500" : "text-indigo-600 dark:text-indigo-400"
                      )}>{totalIncome > 0 ? Math.round((totalExpenses/totalIncome) * 100) : 0}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, totalIncome > 0 ? (totalExpenses/totalIncome) * 100 : 0)}%` }}
                        className={cn(
                          "h-full rounded-full transition-all",
                          (totalExpenses/totalIncome) > 0.8 ? "bg-red-500" : "bg-indigo-600 dark:bg-indigo-500"
                        )}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Recomendamos manter seus gastos fixos abaixo de 70% da renda mensal para manter uma reserva de emergência saudável.</p>
                  </div>
                  <div className="md:w-72 text-center p-10 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
                    <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">Saldo Atual</p>
                    <p className="text-4xl font-black text-indigo-900 dark:text-indigo-300 tracking-tighter">{formatCurrency(balance)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Optimized Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none">
        <nav className="flex items-center gap-1 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 p-2 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] pointer-events-auto ring-1 ring-black/5 flex-nowrap shrink-0">
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3",
              activeTab === 'list' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-white"
            )}
          >
            <List size={18} />
            <span className="uppercase tracking-widest hidden sm:inline">Contas</span>
          </button>

          <div className="px-1">
            <button 
              onClick={() => openModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 flex items-center justify-center rounded-[1.25rem] font-black transition-all shadow-xl shadow-indigo-300 dark:shadow-none active:scale-90 group relative"
            >
              <Plus size={28} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('stats')}
            className={cn(
              "px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3",
              activeTab === 'stats' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-white"
            )}
          >
            <PieChartIcon size={18} />
            <span className="uppercase tracking-widest hidden sm:inline">Gráficos</span>
          </button>

          <div className="w-px h-8 bg-gray-100 dark:bg-gray-700 mx-1 hidden sm:block" />

          <button 
            onClick={handleExport}
            className="w-12 h-12 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-all"
            title="Exportar CSV"
          >
            <Download size={20} />
          </button>
        </nav>
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
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none text-white">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Ajustes</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Personalize sua experiência</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white rounded-2xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">Tema {isDarkMode ? 'Claro' : 'Escuro'}</span>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    isDarkMode ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-500"
                  )}>
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                      isDarkMode ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                </button>

                <div className="relative">
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImportJSON}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl transition-all">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                      <Upload size={20} />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">Importar Backup JSON</span>
                  </div>
                </div>

                <button 
                  onClick={handleExport}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl transition-all"
                >
                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                    <Download size={20} />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Exportar CSV</span>
                </button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em]">Tatu Finanças v2.0.0 • 2026</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingAccount ? 'Editar Conta' : 'Nova Conta'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-400 dark:text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4 text-gray-900 dark:text-gray-100">
                  <button 
                    type="button"
                    onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                      type === 'expense' ? "bg-white dark:bg-gray-800 text-red-600 shadow-sm" : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    Despesa
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                      type === 'income' ? "bg-white dark:bg-gray-800 text-emerald-600 shadow-sm" : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    Receita
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Título</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Aluguel, Mercado, Salário..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Valor (R$)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Categoria</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium appearance-none"
                    >
                      {CATEGORIES[type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-10 h-5 rounded-full transition-all",
                        isRecurring ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                      )} />
                      <div className={cn(
                        "absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-all",
                        isRecurring ? "translate-x-5" : ""
                      )} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Conta Recorrente</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={hasInstallments}
                        onChange={(e) => setHasInstallments(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-10 h-5 rounded-full transition-all",
                        hasInstallments ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                      )} />
                      <div className={cn(
                        "absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-all",
                        hasInstallments ? "translate-x-5" : ""
                      )} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Parcelado</span>
                  </label>
                </div>

                {hasInstallments && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Parcela Atual</label>
                      <input 
                        type="number" 
                        value={currentInstallment}
                        onChange={(e) => setCurrentInstallment(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Total Parcelas</label>
                      <input 
                        type="number" 
                        value={totalInstallments}
                        onChange={(e) => setTotalInstallments(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none font-medium"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
                >
                  <Plus size={20} />
                  {editingAccount ? 'Salvar Alterações' : 'Criar Conta'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
