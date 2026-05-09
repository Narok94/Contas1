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
  'Alimentação': 'bg-orange-100 text-orange-700',
  'Transporte': 'bg-blue-100 text-blue-700',
  'Moradia': 'bg-purple-100 text-purple-700',
  'Lazer': 'bg-pink-100 text-pink-700',
  'Saúde': 'bg-red-100 text-red-700',
  'Educação': 'bg-indigo-100 text-indigo-700',
  'Assinaturas': 'bg-cyan-100 text-cyan-700',
  'Salário': 'bg-emerald-100 text-emerald-700',
  'Freelance': 'bg-teal-100 text-teal-700',
  'Investimento': 'bg-amber-100 text-amber-700',
  'Outros': 'bg-gray-100 text-gray-700',
};
