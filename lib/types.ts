export interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  currency: string;
  category: string;
  subcategory?: string | null;
  merchant?: string | null;
  location?: string | null;
  note?: string | null;
  date: string;
  accountId: string;
  account: Account;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: "cash" | "bank" | "ewallet";
  currency: string;
  balance: number;
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  category?: string | null;
  accountId?: string | null;
  account?: Account | null;
}

export interface AIParseResult {
  type: "income" | "expense" | "transfer";
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  merchant?: string;
  location?: string;
  date: string;
  note?: string;
  confidence: number;
  clarificationNeeded?: string;
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === "IDR") return formatIDR(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
