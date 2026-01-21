
export interface Member {
  id: string;
  name: string;
  icNumber: string;
  memberNumber: string;
  phone: string;
  joinDate: string;
}

export interface PaymentRecord {
  memberId: string;
  year: number;
  month: number; // 0-11
  amount: number;
  paidDate: string;
  status: 'PAID' | 'UNPAID';
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  relatedMemberId?: string;
  relatedMonth?: number; // 0-11
  relatedPaymentId?: string; // Format: memberId-month-year
}

export interface AppState {
  members: Member[];
  payments: PaymentRecord[];
  transactions: Transaction[];
}
