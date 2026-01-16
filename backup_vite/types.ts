
export enum InvoiceStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  gstin: string;
  email: string;
  phone: string;
  address?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Factory {
  id: string;
  name: string;
  unitType?: string;
  gstin: string;
  location: string; // Used for "Full Address"
  phone?: string;
  pincode?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  logo?: string; // base64
  signature?: string; // base64
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  hsnCode: string;
  price: number;
  gstRate: number; // e.g., 18 for 18%
  imageUrl?: string;
  isInclusive?: boolean;
  category?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  gstRate: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  branchName?: string;
  items: InvoiceItem[];
  subTotal: number;
  taxTotal: number;
  discount?: number;
  grandTotal: number;
  status: InvoiceStatus;
}

export interface BillingStats {
  totalSales: number;
  pendingAmount: number;
  invoiceCount: number;
  growthPercentage: number;
}
