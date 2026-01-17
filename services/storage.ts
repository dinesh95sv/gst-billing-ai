import AsyncStorage from '@react-native-async-storage/async-storage';
import { Invoice, Customer, Product, InvoiceStatus, Factory } from '../types';

const STORAGE_KEYS = {
  INVOICES: 'gst_billing_invoices',
  CUSTOMERS: 'gst_billing_customers',
  PRODUCTS: 'gst_billing_products',
  FACTORIES: 'gst_billing_factories'
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: '#INV-2023-442',
    date: '2023-10-24',
    customerId: 'c1',
    customerName: 'Global Exports Ltd.',
    branchName: 'Mumbai Central Unit',
    items: [
      { id: 'i1', productId: 'p1', productName: 'Precision Steel Components', quantity: 500, rate: 45.00, gstRate: 18, taxAmount: 4050, total: 26550 },
      { id: 'i2', productId: 'p2', productName: 'Aluminum Alloy Extrusion', quantity: 200, rate: 180.00, gstRate: 12, taxAmount: 4320, total: 40320 }
    ],
    subTotal: 58500,
    taxTotal: 8370,
    grandTotal: 66870,
    status: InvoiceStatus.PAID
  }
];

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Global Exports Ltd.',
    contactPerson: 'Rahul Sharma',
    gstin: '27AAACG4123F1ZX',
    email: 'contact@globalexports.com',
    phone: '+91 98765 43210',
    address: 'Plot 45, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
    isActive: true,
    shippingAddresses: []
  },
  {
    id: 'c2',
    name: 'Zenith Solutions Pvt Ltd',
    contactPerson: 'Anjali Gupta',
    gstin: '29BBBCB1111B2Z6',
    email: 'billing@zenith.in',
    phone: '+91 88888 77777',
    address: 'Suite 201, Tech Park, Whitefield, Bengaluru, Karnataka 560066',
    isActive: true,
    shippingAddresses: []
  }
];

const MOCK_FACTORIES: Factory[] = [
  {
    id: 'f1',
    name: 'Mumbai Central Unit',
    unitType: 'Primary Plant',
    gstin: '27AAACA0000A1Z5',
    location: 'Gala 12, Industrial Estate, Worli, Mumbai',
    phone: '+91 22 4500 9000',
    pincode: '400018',
    bankName: 'HDFC Bank',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    isActive: true
  },
  {
    id: 'f2',
    name: 'Pune Assembly Line',
    unitType: 'Assembly Hub',
    gstin: '27PPPA0000P1Z1',
    location: 'Sector 10, PCMC Industrial Area, Bhosari, Pune',
    phone: '+91 20 2567 8900',
    pincode: '411026',
    bankName: 'ICICI Bank',
    accountNumber: '000123456789',
    ifscCode: 'ICIC0000001',
    isActive: false
  }
];

export const StorageService = {
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INVOICES);
      if (!data) {
        // Initialize with default data if empty, but prefer empty unless forced
        // For demo purposes, we can seed it.
        await AsyncStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(MOCK_INVOICES));
        return MOCK_INVOICES;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error fetching invoices', error);
      return [];
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice | undefined> => {
    const invoices = await StorageService.getInvoices();
    return invoices.find(inv => inv.id === id);
  },

  saveInvoice: async (invoice: Invoice) => {
    const invoices = await StorageService.getInvoices();
    const existingIndex = invoices.findIndex(i => i.id === invoice.id);
    if (existingIndex > -1) {
      invoices[existingIndex] = invoice;
    } else {
      invoices.unshift(invoice);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  deleteInvoice: async (id: string) => {
    const invoices = await StorageService.getInvoices();
    const filtered = invoices.filter(inv => inv.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
  },

  getCustomers: async (): Promise<Customer[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(MOCK_CUSTOMERS));
        return MOCK_CUSTOMERS;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error fetching customers', error);
      return [];
    }
  },

  getCustomerById: async (id: string): Promise<Customer | undefined> => {
    const customers = await StorageService.getCustomers();
    return customers.find(c => c.id === id);
  },

  saveCustomer: async (customer: Customer) => {
    const customers = await StorageService.getCustomers();
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    if (existingIndex > -1) {
      customers[existingIndex] = customer;
    } else {
      customers.push(customer);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  deleteCustomer: async (id: string) => {
    const customers = await StorageService.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered));
  },

  getProducts: async (): Promise<Product[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error fetching products', error);
      return [];
    }
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    const products = await StorageService.getProducts();
    return products.find(p => p.id === id);
  },

  saveProduct: async (product: Product) => {
    const products = await StorageService.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex > -1) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: async (id: string) => {
    const products = await StorageService.getProducts();
    const filtered = products.filter(p => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  },

  getFactories: async (): Promise<Factory[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FACTORIES);
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEYS.FACTORIES, JSON.stringify(MOCK_FACTORIES));
        return MOCK_FACTORIES;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error fetching factories', error);
      return [];
    }
  },

  getFactoryById: async (id: string): Promise<Factory | undefined> => {
    const factories = await StorageService.getFactories();
    return factories.find(f => f.id === id);
  },

  saveFactory: async (factory: Factory) => {
    const factories = await StorageService.getFactories();
    const existingIndex = factories.findIndex(f => f.id === factory.id);
    if (existingIndex > -1) {
      factories[existingIndex] = factory;
    } else {
      factories.push(factory);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.FACTORIES, JSON.stringify(factories));
  },

  deleteFactory: async (id: string) => {
    const factories = await StorageService.getFactories();
    const filtered = factories.filter(f => f.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.FACTORIES, JSON.stringify(filtered));
  },

  exportAllData: async () => {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const allData: any = {};
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        allData[key] = value ? JSON.parse(value) : [];
      }
      return allData;
    } catch (error) {
      console.error('Error exporting data', error);
      throw error;
    }
  },

  importAllData: async (importedData: any) => {
    try {
      const keys = Object.values(STORAGE_KEYS);
      for (const key of keys) {
        if (!importedData[key]) continue;

        const existingRaw = await AsyncStorage.getItem(key);
        const existingData = existingRaw ? JSON.parse(existingRaw) : [];
        const newData = importedData[key];

        if (!Array.isArray(newData)) continue;

        // Merge logic: only add if ID doesn't exist
        const mergedData = [...existingData];
        const existingIds = new Set(existingData.map((item: any) => item.id));

        for (const item of newData) {
          if (!existingIds.has(item.id)) {
            mergedData.push(item);
            existingIds.add(item.id);
          }
        }

        await AsyncStorage.setItem(key, JSON.stringify(mergedData));
      }
    } catch (error) {
      console.error('Error importing data', error);
      throw error;
    }
  }
};
