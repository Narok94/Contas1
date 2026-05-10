export type AccountType = 'income' | 'expense';

export interface InstallmentInfo {
  current: number;
  total: number;
}

export interface Account {
  id: string;
  title: string;
  amount: number;
  type: AccountType;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurringStatus?: Record<string, boolean>; // month -> isPaid mapping
  deletedAtMonth?: string; // Month (YYYY-MM) from which the account is deleted onwards
  installments: InstallmentInfo | null;
  createdAt: string;
  month: string; // Formato YYYY-MM
}

export const CATEGORIES = {
  expense: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Assinaturas',
    'Outros',
  ],
  income: [
    'Salário',
    'Freelance',
    'Investimento',
    'Presente',
    'Outros',
  ],
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  'Transporte': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  'Moradia': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  'Lazer': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20',
  'Saúde': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  'Educação': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
  'Assinaturas': 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
  'Salário': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  'Freelance': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
  'Investimento': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  'Outros': 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
};
