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
  'Alimentação': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Transporte': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Moradia': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Lazer': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Saúde': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Educação': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Assinaturas': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Salário': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Freelance': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Investimento': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Outros': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};
