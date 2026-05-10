import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  // Localized headers mapping
  const headerMap: Record<string, string> = {
    'title': 'Título',
    'amount': 'Valor',
    'type': 'Tipo',
    'category': 'Categoria',
    'isPaid': 'Pago',
    'isRecurring': 'Recorrente',
    'month': 'Mês',
    'createdAt': 'Data de Criação'
  };

  const keys = ['title', 'amount', 'type', 'category', 'isPaid', 'isRecurring', 'month', 'createdAt'];
  const headers = keys.map(k => headerMap[k] || k).join(',');
  
  const rows = data.map(obj => 
    keys.map(key => {
      let val = obj[key];
      if (key === 'isPaid' || key === 'isRecurring') val = val ? 'Sim' : 'Não';
      if (key === 'type') val = val === 'income' ? 'Receita' : 'Despesa';
      return typeof val === 'string' ? `"${val}"` : val;
    }).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
