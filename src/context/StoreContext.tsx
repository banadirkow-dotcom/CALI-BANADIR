import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Supplier,
  Sale,
  SaleItem,
  SaleReturn,
  Driver,
  DeliveryRecord,
  PaymentAccount,
  AccountTransfer,
  Expense,
  Income,
  Purchase,
  StoreSettings,
  User,
  CargoShipment,
  Order,
  OrderItem,
  AuditLog,
  SystemPortal,
} from '../types';

interface StoreContextType {
  // Data
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  orders: Order[];
  returns: SaleReturn[];
  drivers: Driver[];
  deliveries: DeliveryRecord[];
  accounts: PaymentAccount[];
  transfers: AccountTransfer[];
  accountTransfers: AccountTransfer[];
  cargoShipments: CargoShipment[];
  expenses: Expense[];
  incomes: Income[];
  purchases: Purchase[];
  settings: StoreSettings;
  currentUser: User;
  auditLogs: AuditLog[];

  // Portal State
  currentPortal: SystemPortal;
  isPortalAuthenticated: boolean;
  loginToPortal: (portal: SystemPortal, username: string, password: string) => boolean;
  logoutPortal: () => void;
  switchPortal: (portal: SystemPortal) => void;

  // Actions
  createSale: (sale: Omit<Sale, 'id' | 'invoiceNo'>) => Sale;
  createOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  convertOrderToSale: (orderId: string) => Sale | null;
  recordOrderPayment: (orderId: string, amount: number, paymentMethod?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  processReturn: (returnRecord: Omit<SaleReturn, 'id' | 'returnNo'>) => void;
  addProduct: (product: Omit<Product, 'id' | 'code' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, quantityChange: number, reason: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  receiveCustomerPayment: (customerId: string, amount: number, accountId: string, invoiceId?: string) => void;

  addDriver: (driver: Omit<Driver, 'id' | 'deliveriesCompleted' | 'cashHeld' | 'pendingDeliveries'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  driverCashHandover: (driverId: string, amount: number, targetAccountId: string) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryRecord['status'], driverId?: string) => void;

  addCargoShipment: (shipment: Omit<CargoShipment, 'id'>) => void;
  updateCargoShipment: (id: string, updates: Partial<CargoShipment>) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  deleteIncome: (id: string) => void;
  transferFunds: (transfer: Omit<AccountTransfer, 'id'>) => void;
  addPaymentAccount: (account: Omit<PaymentAccount, 'id'>) => void;
  addAccount: (account: Omit<PaymentAccount, 'id'>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => void;

  updateSettings: (updates: Partial<StoreSettings>) => void;
  setCurrentUser: (user: User) => void;
  addAuditLog: (action: string, target: string, details?: string) => void;
  factoryReset: (confirmPassword: string) => boolean;

  // Financial calculations
  getTodayStats: () => {
    todaySales: number;
    todayIncome: number;
    todayExpenses: number;
    todayProfit: number;
    todaySalesCount: number;
    todayTarget: number;
    targetProgressPct: number;
  };
  getPeriodStats: () => {
    totalSales: number;
    totalPaid: number;
    totalRemainingDebt: number;
    totalCostOfGoods: number;
    grossProfit: number;
    totalExpenses: number;
    totalIncome: number;
    totalOtherIncome: number;
    netProfit: number;
    totalCashInHand: number;
    totalStockValueCost: number;
    totalStockValueSelling: number;
  };

  resetToDefaultData: () => void;
  resetToDemoData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Benadir Store',
  storePhone: '+252 61 500 1234',
  storeAddress: 'Maka Al Mukarama St, Hodan District, Mogadishu',
  taxRate: 0,
  currencySymbol: '$',
  currencyCode: 'USD',
  dailyTarget: 50.00,
  monthlyTarget: 15000.00,
  receiptHeader: 'BENADIR STORE\nOnline POS & Commercial Engine\nTax ID: BND-884920',
  receiptFooter: 'Mahadsanid! Thank you for shopping with us.\nGoods once sold in good condition cannot be returned after 48h.',
  financialCycle: 'Cycle 1 (Sep 01 - Sep 30, 2026)',
};

const INITIAL_USER: User = {
  id: 'usr-1',
  name: 'aa',
  email: 'owner@benadirstore.com',
  role: 'Owner',
  status: 'active',
  phone: '+252 61 999 8888',
  lastLogin: '2026-09-15 05:10',
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PRD-1001',
    sku: 'BEV-COCA-330',
    barcode: '5449000000996',
    name: 'Coca-Cola 330ml Can',
    category: 'Beverages',
    brand: 'Coca-Cola',
    costPrice: 0.85,
    sellingPrice: 1.25,
    stock: 240,
    minStockLevel: 24,
    unit: 'can',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-2',
    code: 'PRD-1002',
    sku: 'BEV-SPRITE-330',
    barcode: '5449000014535',
    name: 'Sprite 330ml Can',
    category: 'Beverages',
    brand: 'The Coca-Cola Co.',
    costPrice: 0.80,
    sellingPrice: 1.20,
    stock: 180,
    minStockLevel: 20,
    unit: 'can',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-3',
    code: 'PRD-1003',
    sku: 'BEV-WATER-500',
    barcode: '6001001002003',
    name: 'Somali Mineral Water 500ml',
    category: 'Beverages',
    brand: 'Biyole',
    costPrice: 0.20,
    sellingPrice: 0.40,
    stock: 450,
    minStockLevel: 50,
    unit: 'bottle',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-4',
    code: 'PRD-1004',
    sku: 'GRO-RICE-BAS-25',
    barcode: '8901030012019',
    name: 'Basmati Rice Premium 25kg',
    category: 'Groceries',
    brand: 'Al-Ghazal',
    costPrice: 22.00,
    sellingPrice: 28.50,
    stock: 65,
    minStockLevel: 10,
    unit: 'bag',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-5',
    code: 'PRD-1005',
    sku: 'GRO-OIL-SUN-5L',
    barcode: '6281001004001',
    name: 'Pure Sunflower Cooking Oil 5L',
    category: 'Groceries',
    brand: 'Hayat',
    costPrice: 8.50,
    sellingPrice: 11.50,
    stock: 42,
    minStockLevel: 8,
    unit: 'bottle',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-6',
    code: 'PRD-1006',
    sku: 'GRO-MILK-POWDER-2.5',
    barcode: '7613032120011',
    name: 'Nido Fortified Milk Powder 2.5kg',
    category: 'Groceries',
    brand: 'Nestle',
    costPrice: 19.50,
    sellingPrice: 24.00,
    stock: 35,
    minStockLevel: 5,
    unit: 'tin',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-7',
    code: 'PRD-1007',
    sku: 'ELE-USBC-FAST-65W',
    barcode: '6971234567890',
    name: 'Fast GaN Charger 65W Dual Port',
    category: 'Electronics',
    brand: 'Anker',
    costPrice: 14.00,
    sellingPrice: 22.00,
    stock: 28,
    minStockLevel: 6,
    unit: 'pcs',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-02',
  },
  {
    id: 'prod-8',
    code: 'PRD-1008',
    sku: 'ELE-BT-EARBUDS-PRO',
    barcode: '6979876543210',
    name: 'Wireless Bluetooth Earbuds Pro',
    category: 'Electronics',
    brand: 'SoundCore',
    costPrice: 18.00,
    sellingPrice: 29.99,
    stock: 19,
    minStockLevel: 5,
    unit: 'pcs',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-02',
  },
  {
    id: 'prod-9',
    code: 'PRD-1009',
    sku: 'GRO-DATES-1KG',
    barcode: '6281005001234',
    name: 'Al-Baraka Premium Saudi Dates 1kg',
    category: 'Groceries',
    brand: 'Al-Baraka',
    costPrice: 3.80,
    sellingPrice: 6.00,
    stock: 75,
    minStockLevel: 15,
    unit: 'box',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-03',
  },
  {
    id: 'prod-10',
    code: 'PRD-1010',
    sku: 'GRO-SPAGHETTI-500G',
    barcode: '8001234567891',
    name: 'Somali Pasta Spaghetti 500g (Pack of 4)',
    category: 'Groceries',
    brand: 'Barilla',
    costPrice: 2.20,
    sellingPrice: 3.50,
    stock: 120,
    minStockLevel: 25,
    unit: 'pack',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281f62?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-03',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-walk-in',
    name: 'Walk-in (no customer)',
    phone: 'Walk-in',
    creditLimit: 0,
    balance: 0,
    totalPurchases: 4520.00,
    status: 'active',
    createdAt: '2026-09-01',
  },
  {
    id: 'cust-1',
    name: 'Ahmed Dahir Hassan',
    phone: '+252 61 511 2233',
    email: 'ahmed.dahir@gmail.com',
    address: 'Wadajir, Airport Road, Mogadishu',
    creditLimit: 1000.00,
    balance: 140.00,
    totalPurchases: 2840.00,
    status: 'active',
    createdAt: '2026-09-02',
  },
  {
    id: 'cust-2',
    name: 'Fatima Omar Warsame',
    phone: '+252 61 722 4455',
    email: 'fatima.warsame@outlook.com',
    address: 'Hodan, Taleex Junction, Mogadishu',
    creditLimit: 500.00,
    balance: 0,
    totalPurchases: 1350.00,
    status: 'active',
    createdAt: '2026-09-03',
  },
  {
    id: 'cust-3',
    name: 'Mohamed Abdi Gure',
    phone: '+252 61 833 6677',
    address: 'Hamar Weyne, Marwas Market, Mogadishu',
    creditLimit: 1500.00,
    balance: 420.00,
    totalPurchases: 3200.00,
    status: 'active',
    createdAt: '2026-09-04',
  },
  {
    id: 'cust-4',
    name: 'Khadija Shire Nur',
    phone: '+252 61 944 8899',
    address: 'Kaaran, Near Sea View, Mogadishu',
    creditLimit: 800.00,
    balance: 75.00,
    totalPurchases: 910.00,
    status: 'active',
    createdAt: '2026-09-05',
  },
];

const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Guled Nuur Ali',
    phone: '+252 61 333 1122',
    vehicleType: 'motorcycle',
    licensePlate: 'MOG-4821-B',
    active: true,
    deliveriesCompleted: 142,
    totalDeliveriesCompleted: 142,
    cashHeld: 64.50,
    totalCodCollected: 64.50,
    pendingDeliveries: 2,
  },
  {
    id: 'drv-2',
    name: 'Warsame Farah',
    phone: '+252 61 444 2233',
    vehicleType: 'van',
    licensePlate: 'MOG-7199-C',
    active: true,
    deliveriesCompleted: 88,
    totalDeliveriesCompleted: 88,
    cashHeld: 0,
    totalCodCollected: 0,
    pendingDeliveries: 1,
  },
  {
    id: 'drv-3',
    name: 'Hassan Omar Siyad',
    phone: '+252 61 555 3344',
    vehicleType: 'motorcycle',
    licensePlate: 'MOG-1032-A',
    active: true,
    deliveriesCompleted: 95,
    totalDeliveriesCompleted: 95,
    cashHeld: 25.00,
    totalCodCollected: 25.00,
    pendingDeliveries: 0,
  },
];

const INITIAL_CARGO: CargoShipment[] = [
  {
    id: 'crg-1',
    trackingNo: 'CRG-4001',
    date: '2026-09-14',
    customerId: 'cust-2',
    customerName: 'Amina Cali Warsame',
    customerPhone: '+252 61 777 4455',
    destinationCity: 'Hargeisa',
    destinationAddress: 'Suuqa Waaheen, Shop #44',
    cargoCompany: 'Star Cargo & Logistics',
    cargoPhone: '+252 61 700 8899',
    waybillNo: 'WB-84920',
    saleInvoiceNo: 'INV-10029',
    status: 'In Transit',
    codAmount: 110.00,
    shippingFee: 15.00,
    feePaidBy: 'Customer',
    packageCount: 2,
    weightKg: 8.5,
    notes: 'Fragile merchandise',
  },
  {
    id: 'crg-2',
    trackingNo: 'CRG-4002',
    date: '2026-09-15',
    customerId: 'cust-3',
    customerName: 'Hassan Omar Geedi',
    customerPhone: '+252 61 888 5566',
    destinationCity: 'Garowe',
    destinationAddress: 'Main Airport Road',
    cargoCompany: 'Som Cargo Express',
    cargoPhone: '+252 61 555 7711',
    waybillNo: 'WB-91023',
    status: 'Pending Handover',
    codAmount: 240.00,
    shippingFee: 20.00,
    feePaidBy: 'Customer',
    packageCount: 3,
    weightKg: 14.0,
  },
];

const INITIAL_ACCOUNTS: PaymentAccount[] = [
  {
    id: 'acc-cash',
    name: 'Main Cash Drawer',
    type: 'Cash',
    balance: 357.00,
    currency: 'USD',
    isDefault: true,
  },
  {
    id: 'acc-evc',
    name: 'Hormuud EVC Plus (615001234)',
    type: 'Mobile Money',
    accountNumber: '*712*615001234#',
    balance: 1420.00,
    currency: 'USD',
  },
  {
    id: 'acc-premier',
    name: 'Premier Bank Commercial',
    type: 'Bank',
    accountNumber: 'PB-1049281',
    balance: 8500.00,
    currency: 'USD',
  },
  {
    id: 'acc-dahab',
    name: 'Dahabshiil Bank eDahab',
    type: 'Bank',
    accountNumber: 'DHB-883190',
    balance: 2600.00,
    currency: 'USD',
  },
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-10033',
    invoiceNo: 'INV-10033',
    date: '2026-09-15',
    time: '04:48 PM',
    customerId: 'cust-walk-in',
    customerName: 'Walk-in (no customer)',
    items: [
      {
        productId: 'prod-1',
        productName: 'Coca-Cola 330ml Can',
        quantity: 3,
        costPrice: 0.85,
        sellingPrice: 1.25,
        discount: 0,
        total: 3.75,
      },
      {
        productId: 'prod-2',
        productName: 'Sprite 330ml Can',
        quantity: 1,
        costPrice: 0.80,
        sellingPrice: 1.20,
        discount: 0,
        total: 1.20,
      },
    ],
    subtotal: 4.95,
    discount: 0.20,
    deliveryFee: 0,
    grandTotal: 4.75,
    costOfGoods: 3.35,
    grossProfit: 1.40,
    amountPaid: 4.75,
    remainingBalance: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'full_paid',
    fulfillmentType: 'Pickup',
    fulfillmentStatus: 'Fulfilled',
    status: 'Completed',
    cashierName: 'Admin',
  },
  {
    id: 'sale-10032',
    invoiceNo: 'INV-10032',
    date: '2026-09-15',
    time: '03:12 PM',
    customerId: 'cust-1',
    customerName: 'Ahmed Dahir Hassan',
    customerPhone: '+252 61 511 2233',
    items: [
      {
        productId: 'prod-4',
        productName: 'Basmati Rice Premium 25kg',
        quantity: 1,
        costPrice: 22.00,
        sellingPrice: 28.50,
        discount: 0,
        total: 28.50,
      },
      {
        productId: 'prod-5',
        productName: 'Pure Sunflower Cooking Oil 5L',
        quantity: 1,
        costPrice: 8.50,
        sellingPrice: 11.50,
        discount: 0,
        total: 11.50,
      },
    ],
    subtotal: 40.00,
    discount: 0,
    deliveryFee: 2.00,
    grandTotal: 42.00,
    costOfGoods: 30.50,
    grossProfit: 9.50,
    amountPaid: 42.00,
    remainingBalance: 0,
    paymentMethod: 'EVC Plus',
    paymentStatus: 'full_paid',
    fulfillmentType: 'Delivery',
    fulfillmentStatus: 'In Transit',
    driverId: 'drv-1',
    driverName: 'Guled Nuur Ali',
    status: 'Completed',
    cashierName: 'Admin',
  },
  {
    id: 'sale-10031',
    invoiceNo: 'INV-10031',
    date: '2026-09-14',
    time: '11:20 AM',
    customerId: 'cust-3',
    customerName: 'Mohamed Abdi Gure',
    customerPhone: '+252 61 833 6677',
    items: [
      {
        productId: 'prod-7',
        productName: 'Fast GaN Charger 65W Dual Port',
        quantity: 2,
        costPrice: 14.00,
        sellingPrice: 22.00,
        discount: 0,
        total: 44.00,
      },
    ],
    subtotal: 44.00,
    discount: 2.00,
    deliveryFee: 0,
    grandTotal: 42.00,
    costOfGoods: 28.00,
    grossProfit: 14.00,
    amountPaid: 20.00,
    remainingBalance: 22.00,
    paymentMethod: 'Credit',
    paymentStatus: 'partial_payment',
    fulfillmentType: 'Pickup',
    fulfillmentStatus: 'Fulfilled',
    status: 'Completed',
    cashierName: 'Admin',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Store Electricity Generator Diesel',
    category: 'Utilities',
    amount: 85.00,
    date: '2026-09-14',
    paidFromAccountId: 'acc-cash',
    paidFromAccountName: 'Main Cash Drawer',
    recordedBy: 'Admin',
  },
  {
    id: 'exp-2',
    title: 'Packaging Bags & Receipt Rolls',
    category: 'Supplies',
    amount: 32.00,
    date: '2026-09-12',
    paidFromAccountId: 'acc-cash',
    paidFromAccountName: 'Main Cash Drawer',
    recordedBy: 'Admin',
  },
];

const INITIAL_INCOMES: Income[] = [
  {
    id: 'inc-1',
    title: 'Commercial Cargo Handling Commission',
    category: 'Commission',
    amount: 12.00,
    date: '2026-09-14',
    depositedToAccountId: 'acc-evc',
    depositedToAccountName: 'Hormuud EVC Plus (615001234)',
    recordedBy: 'Admin',
  },
];

const INITIAL_DELIVERIES: DeliveryRecord[] = [
  {
    id: 'del-1',
    saleId: 'sale-10032',
    invoiceNo: 'INV-10032',
    customerName: 'Ahmed Dahir Hassan',
    customerPhone: '+252 61 511 2233',
    deliveryAddress: 'Wadajir, Airport Road, Mogadishu',
    driverId: 'drv-1',
    driverName: 'Guled Nuur Ali',
    assignedAt: '2026-09-15 03:15 PM',
    status: 'In Transit',
    deliveryFee: 2.00,
    cashToCollect: 0,
    cashCollected: 0,
    isCashHandedOver: false,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-10027',
    orderNo: 'O00027',
    date: '2026-09-15',
    time: '04:30 PM',
    customerId: 'cust-1',
    customerName: 'Ahmed Dahir Hassan',
    customerPhone: '+252 61 511 2233',
    items: [
      {
        productId: 'prod-4',
        productName: 'Basmati Rice Premium 25kg',
        quantity: 1,
        costPrice: 22.00,
        sellingPrice: 28.50,
        total: 28.50,
      },
      {
        productId: 'prod-3',
        productName: 'Mineral Water 500ml (Carton of 24)',
        quantity: 1,
        costPrice: 3.80,
        sellingPrice: 5.50,
        total: 5.50,
      },
    ],
    subtotal: 34.00,
    discount: 1.00,
    deliveryFee: 2.00,
    cargoFee: 0,
    total: 35.00,
    paidAmount: 20.00,
    advanceAmount: 20.00,
    fulfillmentType: 'Delivery',
    deliveryAddress: 'Wadajir, Airport Road, Mogadishu',
    driverId: 'drv-1',
    driverName: 'Guled Nuur Ali',
    status: 'out_for_delivery',
    notes: 'Please deliver before Maghrib prayer',
    createdAt: '2026-09-15T13:30:00Z',
  },
  {
    id: 'order-10026',
    orderNo: 'O00026',
    date: '2026-09-15',
    time: '02:15 PM',
    customerId: 'cust-2',
    customerName: 'Faduma Warsame Elmi',
    customerPhone: '+252 61 722 4455',
    items: [
      {
        productId: 'prod-6',
        productName: 'Nido Fortified Milk Powder 2.5kg',
        quantity: 2,
        costPrice: 19.50,
        sellingPrice: 24.00,
        total: 48.00,
      },
    ],
    subtotal: 48.00,
    discount: 3.00,
    deliveryFee: 2.00,
    cargoFee: 0,
    total: 47.00,
    paidAmount: 10.00,
    advanceAmount: 10.00,
    fulfillmentType: 'Delivery',
    deliveryAddress: 'Hodan, Taleex Street, Mogadishu',
    status: 'ready',
    notes: 'Call before arriving',
    createdAt: '2026-09-15T11:15:00Z',
  },
  {
    id: 'order-10025',
    orderNo: 'O00025',
    date: '2026-09-14',
    time: '05:40 PM',
    customerId: 'cust-3',
    customerName: 'Mohamed Abdi Gure',
    customerPhone: '+252 61 833 6677',
    items: [
      {
        productId: 'prod-7',
        productName: 'Fast GaN Charger 65W Dual Port',
        quantity: 1,
        costPrice: 14.00,
        sellingPrice: 22.00,
        total: 22.00,
      },
    ],
    subtotal: 22.00,
    discount: 0,
    deliveryFee: 0,
    cargoFee: 15.00,
    total: 37.00,
    paidAmount: 37.00,
    advanceAmount: 37.00,
    fulfillmentType: 'Cargo',
    cargoCompany: 'Bakaara Express Cargo',
    status: 'confirmed',
    notes: 'Send to Baidoa Office',
    createdAt: '2026-09-14T14:40:00Z',
  },
  {
    id: 'order-10024',
    orderNo: 'O00024',
    date: '2026-09-14',
    time: '10:00 AM',
    customerId: 'cust-4',
    customerName: 'Khadija Osman Barre',
    customerPhone: '+252 61 944 8899',
    items: [
      {
        productId: 'prod-1',
        productName: 'Coca-Cola 330ml Can',
        quantity: 12,
        costPrice: 0.85,
        sellingPrice: 1.25,
        total: 15.00,
      },
    ],
    subtotal: 15.00,
    discount: 0,
    deliveryFee: 0,
    cargoFee: 0,
    total: 15.00,
    paidAmount: 15.00,
    advanceAmount: 15.00,
    fulfillmentType: 'Pickup',
    status: 'converted',
    convertedSaleId: 'sale-10033',
    notes: 'Walk-in collection',
    createdAt: '2026-09-14T07:00:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-15 04:30 PM',
    actor: 'Admin',
    portal: 'banadir',
    action: 'CREATE_ORDER',
    target: 'O00027',
    details: 'Created delivery order for Ahmed Dahir Hassan ($35.00)',
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-15 03:15 PM',
    actor: 'Admin',
    portal: 'banadir',
    action: 'ASSIGN_DELIVERY',
    target: 'DEL-1',
    details: 'Assigned delivery for INV-10032 to Guled Nuur Ali',
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-15 01:00 PM',
    actor: 'Admin',
    portal: 'super_admin',
    action: 'SYSTEM_HEALTH_CHECK',
    target: 'DATABASE',
    details: 'All financial ledgers and product catalogs verified',
  },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('benadir_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('benadir_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers] = useState<Supplier[]>([
    { id: 'sup-1', name: 'Al-Khaleej Wholesale Ltd', phone: '+252 61 222 9900', balance: 450.00 },
    { id: 'sup-2', name: 'Global Tech Distribution FZE', phone: '+252 61 333 4455', balance: 1200.00 },
  ]);

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('benadir_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [returns, setReturns] = useState<SaleReturn[]>(() => {
    const saved = localStorage.getItem('benadir_returns');
    return saved ? JSON.parse(saved) : [];
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('benadir_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(() => {
    const saved = localStorage.getItem('benadir_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [accounts, setAccounts] = useState<PaymentAccount[]>(() => {
    const saved = localStorage.getItem('benadir_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [transfers, setTransfers] = useState<AccountTransfer[]>(() => {
    const saved = localStorage.getItem('benadir_transfers');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('benadir_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('benadir_incomes');
    return saved ? JSON.parse(saved) : INITIAL_INCOMES;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('benadir_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [cargoShipments, setCargoShipments] = useState<CargoShipment[]>(() => {
    const saved = localStorage.getItem('benadir_cargo');
    return saved ? JSON.parse(saved) : INITIAL_CARGO;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('benadir_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('benadir_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentPortal, setCurrentPortal] = useState<SystemPortal>(() => {
    return (localStorage.getItem('benadir_active_portal') as SystemPortal) || 'banadir';
  });

  const [isPortalAuthenticated, setIsPortalAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('benadir_portal_auth') === 'true';
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('benadir_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('benadir_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('benadir_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('benadir_cargo', JSON.stringify(cargoShipments));
  }, [cargoShipments]);
  useEffect(() => {
    localStorage.setItem('benadir_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('benadir_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('benadir_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('benadir_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem('benadir_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('benadir_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('benadir_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('benadir_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('benadir_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('benadir_settings', JSON.stringify(settings));
  }, [settings]);

  // Audit Logging
  const addAuditLog = (action: string, target: string, details?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      actor: currentUser.name || 'Admin',
      portal: currentPortal,
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // Portal Authentication
  const loginToPortal = (portal: SystemPortal, username: string, pass: string): boolean => {
    const u = username.trim().toLowerCase();
    const p = pass.trim();

    let authorized = false;
    if (portal === 'super_admin' && (u === 'admin' || u === 'superadmin') && p === '123456') {
      authorized = true;
      setCurrentUser({
        id: 'usr-admin',
        name: 'Super Admin (Control Plane)',
        email: 'superadmin@banadir.so',
        role: 'Admin',
        status: 'active',
        phone: '+252 61 500 0001',
      });
    } else if (portal === 'delivery' && (u === 'delivery' || u === 'driver') && p === '12345') {
      authorized = true;
      setCurrentUser({
        id: 'usr-driver',
        name: 'Guled Nuur Ali (Driver)',
        email: 'delivery@banadir.so',
        role: 'Driver',
        status: 'active',
        phone: '+252 61 555 1122',
      });
    } else if (portal === 'banadir' && (u === 'banadir' || u === 'admin' || u === 'cashier') && p === '1234') {
      authorized = true;
      setCurrentUser({
        id: 'usr-banadir',
        name: 'Ahmed Dahir (Manager)',
        email: 'manager@banadir.so',
        role: 'Admin',
        status: 'active',
        phone: '+252 61 500 1234',
      });
    }

    if (authorized) {
      setCurrentPortal(portal);
      setIsPortalAuthenticated(true);
      localStorage.setItem('benadir_portal_auth', 'true');
      localStorage.setItem('benadir_active_portal', portal);
      addAuditLog('PORTAL_LOGIN_SUCCESS', portal.toUpperCase(), `User ${username} authenticated`);
      return true;
    } else {
      addAuditLog('PORTAL_LOGIN_FAILED', portal.toUpperCase(), `Failed attempt for user ${username}`);
      return false;
    }
  };

  const logoutPortal = () => {
    addAuditLog('PORTAL_LOGOUT', currentPortal.toUpperCase(), 'Session terminated');
    setIsPortalAuthenticated(false);
    localStorage.removeItem('benadir_portal_auth');
  };

  const switchPortal = (portal: SystemPortal) => {
    addAuditLog('PORTAL_SWITCH', portal.toUpperCase(), `Navigated to ${portal}`);
    setCurrentPortal(portal);
    localStorage.setItem('benadir_active_portal', portal);
  };

  // Actions
  const createSale = (saleData: Omit<Sale, 'id' | 'invoiceNo'>): Sale => {
    const nextNumber = sales.length + 10034;
    const invoiceNo = `INV-${nextNumber}`;
    const id = `sale-${nextNumber}`;

    const newSale: Sale = {
      ...saleData,
      id,
      invoiceNo,
    };

    // 1. Deduct stock from products
    setProducts((prev) =>
      prev.map((p) => {
        const item = newSale.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      })
    );

    // 2. Add customer debt if remaining balance > 0
    if (newSale.remainingBalance > 0 && newSale.customerId !== 'cust-walk-in') {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            return {
              ...c,
              balance: c.balance + newSale.remainingBalance,
              totalPurchases: c.totalPurchases + newSale.grandTotal,
            };
          }
          return c;
        })
      );
    } else if (newSale.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            return { ...c, totalPurchases: c.totalPurchases + newSale.grandTotal };
          }
          return c;
        })
      );
    }

    // 3. Deposit paid amount into payment account
    if (newSale.amountPaid > 0) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (
            (newSale.paymentMethod === 'Cash' && acc.id === 'acc-cash') ||
            (newSale.paymentMethod === 'EVC Plus' && acc.id === 'acc-evc') ||
            (newSale.paymentMethod === 'Premier Bank' && acc.id === 'acc-premier') ||
            (newSale.paymentMethod === 'Dahabshiil' && acc.id === 'acc-dahab')
          ) {
            return { ...acc, balance: acc.balance + newSale.amountPaid };
          }
          return acc;
        })
      );
    }

    // 4. If delivery or cargo, create delivery record
    if (newSale.fulfillmentType === 'Delivery' || newSale.fulfillmentType === 'Cargo') {
      const newDel: DeliveryRecord = {
        id: `del-${Date.now()}`,
        saleId: id,
        invoiceNo,
        customerName: newSale.customerName,
        customerPhone: newSale.customerPhone || '',
        deliveryAddress: newSale.notes || 'Mogadishu Central',
        driverId: newSale.driverId,
        driverName: newSale.driverName,
        assignedAt: `${newSale.date} ${newSale.time}`,
        status: newSale.driverId ? 'Assigned' : 'Pending',
        deliveryFee: newSale.deliveryFee,
        cashToCollect: newSale.remainingBalance,
        cashCollected: 0,
        isCashHandedOver: false,
      };
      setDeliveries((prev) => [newDel, ...prev]);

      // If driver assigned and has to collect cash, record on driver
      if (newSale.driverId) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === newSale.driverId ? { ...d, pendingDeliveries: d.pendingDeliveries + 1 } : d))
        );
      }
    }

    // Save sale
    setSales((prev) => [newSale, ...prev]);
    addAuditLog('CREATE_SALE', invoiceNo, `Sale completed for ${newSale.customerName} - Grand Total: $${newSale.grandTotal.toFixed(2)}`);
    return newSale;
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNo' | 'createdAt'>): Order => {
    const nextNum = orders.length + 28;
    const orderNo = `O${String(nextNum).padStart(5, '0')}`;
    const id = `order-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id,
      orderNo,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    addAuditLog('CREATE_ORDER', orderNo, `Created order for ${newOrder.customerName} - Total $${newOrder.total.toFixed(2)} (${newOrder.fulfillmentType})`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          addAuditLog('UPDATE_ORDER_STATUS', ord.orderNo, `Status changed from ${ord.status} to ${status}`);
          return { ...ord, status };
        }
        return ord;
      })
    );
  };

  const convertOrderToSale = (orderId: string): Sale | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === 'converted') return null;

    // Verify stock availability
    for (const item of order.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.stock < item.quantity) {
        alert(`Insufficient stock for ${prod.name}. In stock: ${prod.stock}, Requested: ${item.quantity}`);
        return null;
      }
    }

    const newSale = createSale({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        discount: 0,
        total: item.total,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      deliveryFee: order.deliveryFee,
      grandTotal: order.total,
      costOfGoods: order.items.reduce((s, i) => s + i.costPrice * i.quantity, 0),
      grossProfit:
        order.subtotal -
        order.discount -
        order.items.reduce((s, i) => s + i.costPrice * i.quantity, 0),
      amountPaid: order.paidAmount,
      remainingBalance: Math.max(0, order.total - order.paidAmount),
      paymentMethod: 'EVC Plus',
      paymentStatus:
        order.paidAmount >= order.total
          ? 'full_paid'
          : order.paidAmount > 0
          ? 'partial_payment'
          : 'full_debt',
      fulfillmentType: order.fulfillmentType,
      driverId: order.driverId,
      driverName: order.driverName,
      cargoCompany: order.cargoCompany,
      fulfillmentStatus: order.fulfillmentType === 'Pickup' ? 'Fulfilled' : 'In Transit',
      status: 'Completed',
      cashierName: currentUser.name || 'Banadir System',
      notes: `Converted from Order ${order.orderNo}.${order.deliveryAddress ? ` Address: ${order.deliveryAddress}.` : ''} ${order.notes || ''}`.trim(),
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'converted', convertedSaleId: newSale.id } : o
      )
    );
    addAuditLog('CONVERT_ORDER_TO_SALE', order.orderNo, `Converted into sale invoice ${newSale.invoiceNo}`);
    return newSale;
  };

  const recordOrderPayment = (orderId: string, amount: number, paymentMethod = 'EVC Plus') => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newPaid = Math.min(ord.total, ord.paidAmount + amount);
          const remaining = Math.max(0, ord.total - newPaid);
          const newStatus = ord.status === 'pending' ? 'confirmed' : ord.status;
          addAuditLog(
            'ORDER_PAYMENT',
            ord.orderNo,
            `Paid $${amount.toFixed(2)} via ${paymentMethod}. Remaining: $${remaining.toFixed(2)}`
          );
          return { ...ord, paidAmount: newPaid, status: newStatus };
        }
        return ord;
      })
    );
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          addAuditLog(
            'CANCEL_ORDER',
            ord.orderNo,
            `Order cancelled. Reason: ${reason || 'Customer request'}`
          );
          return {
            ...ord,
            status: 'cancelled',
            notes: `${ord.notes ? ord.notes + ' | ' : ''}Cancelled: ${reason || 'Customer request'}`,
          };
        }
        return ord;
      })
    );
  };

  const factoryReset = (confirmPassword: string): boolean => {
    if (confirmPassword !== '123456' && confirmPassword !== '1234') {
      return false;
    }
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSales(INITIAL_SALES);
    setOrders(INITIAL_ORDERS);
    setReturns([]);
    setDrivers(INITIAL_DRIVERS);
    setDeliveries(INITIAL_DELIVERIES);
    setAccounts(INITIAL_ACCOUNTS);
    setTransfers([]);
    setExpenses(INITIAL_EXPENSES);
    setIncomes(INITIAL_INCOMES);
    setCargoShipments(INITIAL_CARGO);
    setPurchases([]);
    setSettings(INITIAL_SETTINGS);
    addAuditLog('FACTORY_RESET', 'SYSTEM', 'Platform data reset to factory defaults');
    return true;
  };

  const processReturn = (returnData: Omit<SaleReturn, 'id' | 'returnNo'>) => {
    const returnNo = `RET-${Date.now().toString().slice(-5)}`;
    const newReturn: SaleReturn = {
      ...returnData,
      id: `ret-${Date.now()}`,
      returnNo,
    };

    // Restock items
    setProducts((prev) =>
      prev.map((p) => {
        const item = newReturn.items.find((i) => i.productId === p.id && i.restock);
        if (item) {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      })
    );

    // Deduct refund from cash account
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === 'acc-cash' ? { ...acc, balance: acc.balance - newReturn.totalRefund } : acc))
    );

    setReturns((prev) => [newReturn, ...prev]);
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'code' | 'createdAt'>): Product => {
    const code = `PRD-${1000 + products.length + 1}`;
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      code,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (productId: string, quantityChange: number, _reason: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + quantityChange) } : p))
    );
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'totalPurchases' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      totalPurchases: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const receiveCustomerPayment = (customerId: string, amount: number, accountId: string, _invoiceId?: string) => {
    // 1. Reduce customer debt balance
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, balance: Math.max(0, c.balance - amount) } : c))
    );

    // 2. Deposit into payment account
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, balance: acc.balance + amount } : acc))
    );

    // 3. Update customer sales remaining balance
    let remainingAmountToApply = amount;
    setSales((prev) =>
      prev.map((s) => {
        if (s.customerId === customerId && s.remainingBalance > 0 && remainingAmountToApply > 0) {
          const deduction = Math.min(s.remainingBalance, remainingAmountToApply);
          remainingAmountToApply -= deduction;
          const newRemaining = s.remainingBalance - deduction;
          return {
            ...s,
            amountPaid: s.amountPaid + deduction,
            remainingBalance: newRemaining,
            paymentStatus: newRemaining === 0 ? 'full_paid' : 'partial_payment',
          };
        }
        return s;
      })
    );
  };

  const addDriver = (driverData: Omit<Driver, 'id' | 'deliveriesCompleted' | 'cashHeld' | 'pendingDeliveries'>): Driver => {
    const newDriver: Driver = {
      ...driverData,
      id: `drv-${Date.now()}`,
      deliveriesCompleted: 0,
      cashHeld: 0,
      pendingDeliveries: 0,
    };
    setDrivers((prev) => [...prev, newDriver]);
    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const driverCashHandover = (driverId: string, amount: number, targetAccountId: string) => {
    // Deduct cash from driver
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, cashHeld: Math.max(0, d.cashHeld - amount) } : d))
    );

    // Deposit to target account
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === targetAccountId ? { ...acc, balance: acc.balance + amount } : acc))
    );
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryRecord['status'], driverId?: string) => {
    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id === deliveryId) {
          const selectedDriver = driverId ? drivers.find((d) => d.id === driverId) : undefined;
          return {
            ...del,
            status,
            driverId: driverId || del.driverId,
            driverName: selectedDriver ? selectedDriver.name : del.driverName,
            cashCollected: status === 'Delivered' ? del.cashToCollect : del.cashCollected,
          };
        }
        return del;
      })
    );

    if (status === 'Delivered') {
      const del = deliveries.find((d) => d.id === deliveryId);
      if (del && del.driverId && del.cashToCollect > 0) {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === del.driverId
              ? {
                  ...d,
                  cashHeld: d.cashHeld + del.cashToCollect,
                  deliveriesCompleted: d.deliveriesCompleted + 1,
                  pendingDeliveries: Math.max(0, d.pendingDeliveries - 1),
                }
              : d
          )
        );
      }
    }
  };

  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);

    // Deduct from paying account
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === newExp.paidFromAccountId ? { ...acc, balance: acc.balance - newExp.amount } : acc))
    );
  };

  const addIncome = (incData: Omit<Income, 'id'>) => {
    const newInc: Income = {
      ...incData,
      id: `inc-${Date.now()}`,
    };
    setIncomes((prev) => [newInc, ...prev]);

    // Deposit to account
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === newInc.depositedToAccountId ? { ...acc, balance: acc.balance + newInc.amount } : acc
      )
    );
  };

  const transferFunds = (transferData: Omit<AccountTransfer, 'id'>) => {
    const newTransfer: AccountTransfer = {
      ...transferData,
      id: `xfer-${Date.now()}`,
    };
    setTransfers((prev) => [newTransfer, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === transferData.fromAccountId) {
          return { ...acc, balance: acc.balance - transferData.amount };
        }
        if (acc.id === transferData.toAccountId) {
          return { ...acc, balance: acc.balance + transferData.amount };
        }
        return acc;
      })
    );
  };

  const addPaymentAccount = (accData: Omit<PaymentAccount, 'id'>) => {
    const newAcc: PaymentAccount = {
      ...accData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const addCargoShipment = (shipment: Omit<CargoShipment, 'id'>) => {
    const newShipment: CargoShipment = {
      ...shipment,
      id: `crg-${Date.now()}`,
    };
    setCargoShipments((prev) => [newShipment, ...prev]);
  };

  const updateCargoShipment = (id: string, updates: Partial<CargoShipment>) => {
    setCargoShipments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const addPurchase = (purchase: Omit<Purchase, 'id'>) => {
    const newPO: Purchase = {
      ...purchase,
      id: `po-${Date.now()}`,
    };
    setPurchases((prev) => [newPO, ...prev]);

    // Restock products
    purchase.items.forEach((item) => {
      adjustStock(item.productId, item.quantity, `Purchase restock PO #${purchase.purchaseNo}`);
    });

    // Deduct from account if paid
    if (purchase.accountId && purchase.paidAmount > 0) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === purchase.accountId
            ? { ...acc, balance: acc.balance - purchase.paidAmount }
            : acc
        )
      );
    }
  };

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Financial Calculations
  const getTodayStats = () => {
    const todayStr = '2026-09-15'; // current session date
    const todaySalesList = sales.filter((s) => s.date === todayStr && s.status !== 'Cancelled');
    const todaySales = todaySalesList.reduce((sum, s) => sum + s.grandTotal, 0);
    const todayProfit = todaySalesList.reduce((sum, s) => sum + s.grossProfit, 0);
    const todayExpenses = expenses.filter((e) => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
    const todayIncome = incomes.filter((i) => i.date === todayStr).reduce((sum, i) => sum + i.amount, 0);

    const todayTarget = settings.dailyTarget || 50.00;
    const targetProgressPct = Math.min(100, Math.round((todaySales / todayTarget) * 100));

    return {
      todaySales,
      todayIncome,
      todayExpenses,
      todayProfit,
      todaySalesCount: todaySalesList.length,
      todayTarget,
      targetProgressPct,
    };
  };

  const getPeriodStats = () => {
    const validSales = sales.filter((s) => s.status !== 'Cancelled');
    const totalSales = validSales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalPaid = validSales.reduce((sum, s) => sum + s.amountPaid, 0);
    const totalRemainingDebt = customers.reduce((sum, c) => sum + c.balance, 0);
    const totalCostOfGoods = validSales.reduce((sum, s) => sum + s.costOfGoods, 0);
    const grossProfit = validSales.reduce((sum, s) => sum + s.grossProfit, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalOtherIncome = totalIncome;
    const netProfit = grossProfit + totalIncome - totalExpenses;

    const totalCashInHand = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const totalStockValueCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
    const totalStockValueSelling = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);

    return {
      totalSales,
      totalPaid,
      totalRemainingDebt,
      totalCostOfGoods,
      grossProfit,
      totalExpenses,
      totalIncome,
      totalOtherIncome,
      netProfit,
      totalCashInHand,
      totalStockValueCost,
      totalStockValueSelling,
    };
  };

  const resetToDefaultData = () => {
    localStorage.removeItem('benadir_products');
    localStorage.removeItem('benadir_customers');
    localStorage.removeItem('benadir_sales');
    localStorage.removeItem('benadir_returns');
    localStorage.removeItem('benadir_drivers');
    localStorage.removeItem('benadir_deliveries');
    localStorage.removeItem('benadir_accounts');
    localStorage.removeItem('benadir_expenses');
    localStorage.removeItem('benadir_incomes');
    localStorage.removeItem('benadir_settings');
    localStorage.removeItem('benadir_cargo');

    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSales(INITIAL_SALES);
    setReturns([]);
    setDrivers(INITIAL_DRIVERS);
    setDeliveries(INITIAL_DELIVERIES);
    setAccounts(INITIAL_ACCOUNTS);
    setTransfers([]);
    setExpenses(INITIAL_EXPENSES);
    setIncomes(INITIAL_INCOMES);
    setPurchases([]);
    setCargoShipments(INITIAL_CARGO);
    setSettings(INITIAL_SETTINGS);
  };

  const exportDatabaseJson = () => {
    return JSON.stringify(
      {
        products,
        customers,
        sales,
        returns,
        drivers,
        deliveries,
        accounts,
        transfers,
        expenses,
        incomes,
        cargoShipments,
        settings,
      },
      null,
      2
    );
  };

  const importDatabaseJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.products) setProducts(data.products);
      if (data.customers) setCustomers(data.customers);
      if (data.sales) setSales(data.sales);
      if (data.accounts) setAccounts(data.accounts);
      if (data.settings) setSettings(data.settings);
      if (data.cargoShipments) setCargoShipments(data.cargoShipments);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        customers,
        suppliers,
        sales,
        orders,
        returns,
        drivers,
        deliveries,
        accounts,
        transfers,
        accountTransfers: transfers,
        cargoShipments,
        expenses,
        incomes,
        purchases,
        settings,
        currentUser,
        auditLogs,
        currentPortal,
        isPortalAuthenticated,
        loginToPortal,
        logoutPortal,
        switchPortal,
        createSale,
        createOrder,
        updateOrderStatus,
        convertOrderToSale,
        recordOrderPayment,
        cancelOrder,
        processReturn,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        updateCustomer,
        receiveCustomerPayment,
        addDriver,
        updateDriver,
        driverCashHandover,
        updateDeliveryStatus,
        addCargoShipment,
        updateCargoShipment,
        addExpense,
        deleteExpense,
        addIncome,
        deleteIncome,
        transferFunds,
        addPaymentAccount,
        addAccount: addPaymentAccount,
        addPurchase,
        updateSettings,
        setCurrentUser,
        addAuditLog,
        factoryReset,
        getTodayStats,
        getPeriodStats,
        resetToDefaultData,
        resetToDemoData: resetToDefaultData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
