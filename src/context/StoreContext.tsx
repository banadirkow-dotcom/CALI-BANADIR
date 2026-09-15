import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  ProductCategory,
  ProductBrand,
  ProductUnit,
  CostLayer,
  PriceHistoryRecord,
  ProductHistoryEvent,
  InventoryMovement,
  Customer,
  Supplier,
  SupplierPayment,
  SupplierStatementEntry,
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
  OrderEvent,
  OrderPaymentStatus,
  AuditLog,
  SystemPortal,
} from '../types';

interface StoreContextType {
  // Data
  products: Product[];
  categories: ProductCategory[];
  brands: ProductBrand[];
  units: ProductUnit[];
  inventoryMovements: InventoryMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  supplierPayments: SupplierPayment[];
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
  updateOrder: (orderId: string, updates: Partial<Order>, note?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  convertOrderToSale: (orderId: string) => Sale | null;
  recordOrderPayment: (orderId: string, amount: number, paymentMethod?: string, paymentProvider?: string, referenceNo?: string) => void;
  verifyOrderPayment: (orderId: string, referenceNo?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  getOrderByPortalToken: (token: string) => Order | null;
  generateCustomerPortalUrl: (order: Order) => string;
  processReturn: (returnRecord: Omit<SaleReturn, 'id' | 'returnNo'>) => void;
  addProduct: (product: Omit<Product, 'id' | 'code' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>, reason?: string) => void;
  deleteProduct: (id: string) => { success: boolean; message: string; archived?: boolean };
  adjustStock: (productId: string, quantityChange: number, reason: string, type?: 'adjustment' | 'damage' | 'loss') => void;
  addStockToProduct: (
    productId: string,
    quantity: number,
    costPrice: number,
    newSellingPrice?: number,
    options?: { supplierName?: string; referenceNo?: string; notes?: string; accountId?: string }
  ) => void;
  archiveProduct: (id: string) => void;
  reactivateProduct: (id: string) => void;
  checkDuplicateProduct: (name: string, sku?: string, barcode?: string, brand?: string) => Product | null;

  // Catalog Taxonomy
  addCategory: (name: string, description?: string) => ProductCategory;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => void;
  deleteCategory: (id: string) => void;
  addBrand: (name: string, description?: string) => ProductBrand;
  updateBrand: (id: string, updates: Partial<ProductBrand>) => void;
  deleteBrand: (id: string) => void;
  addUnit: (name: string, symbol: string) => ProductUnit;

  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  checkDuplicateCustomer: (name: string, phone?: string) => Customer | null;
  receiveCustomerPayment: (customerId: string, amount: number, accountId: string, invoiceId?: string) => void;

  addDriver: (driver: Omit<Driver, 'id' | 'deliveriesCompleted' | 'cashHeld' | 'pendingDeliveries'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  driverCashHandover: (driverId: string, amount: number, targetAccountId: string) => void;
  handoverDriverCash: (driverId: string, targetAccountId: string, amount?: number) => void;
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

  // Supplier & Purchase Management
  addSupplier: (supplier: Omit<Supplier, 'id' | 'balance' | 'totalPurchases' | 'totalPaid' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => { success: boolean; message: string; archived?: boolean };
  archiveSupplier: (id: string) => void;
  checkDuplicateSupplier: (name: string, phone?: string, company?: string) => Supplier | null;
  recordSupplierPayment: (payment: Omit<SupplierPayment, 'id' | 'createdAt'>) => SupplierPayment;
  getSupplierStatement: (supplierId: string) => SupplierStatementEntry[];
  createPurchase: (purchase: Omit<Purchase, 'id' | 'purchaseNo' | 'createdAt'>) => Purchase;
  cancelPurchase: (purchaseId: string, reason?: string) => { success: boolean; message: string };
  addPurchase: (purchase: Omit<Purchase, 'id'> | Omit<Purchase, 'id' | 'purchaseNo' | 'createdAt'>) => void;

  updateSettings: (updates: Partial<StoreSettings>) => void;
  setCurrentUser: (user: User) => void;
  addAuditLog: (action: string, target: string, details?: string) => void;
  factoryReset: (confirmPassword?: string, overrideRole?: string) => boolean;

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

const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: 'cat-1', name: 'Groceries', description: 'Daily staple foods, grains, spices, oils', isActive: true },
  { id: 'cat-2', name: 'Beverages', description: 'Water, sodas, juices, canned drinks', isActive: true },
  { id: 'cat-3', name: 'Electronics', description: 'Chargers, accessories, audio, cables', isActive: true },
  { id: 'cat-4', name: 'Household', description: 'Cleaning supplies, kitchenware, detergents', isActive: true },
  { id: 'cat-5', name: 'Personal Care', description: 'Soaps, hygiene, cosmetics, shampoos', isActive: true },
  { id: 'cat-6', name: 'Accessories', description: 'Mobile cases, adaptors, gadgets', isActive: true },
  { id: 'cat-7', name: 'Hardware', description: 'Tools, electrical, maintenance items', isActive: true },
  { id: 'cat-8', name: 'Clothing', description: 'Apparel, fabrics, uniforms', isActive: true },
  { id: 'cat-9', name: 'Other', description: 'General miscellaneous items', isActive: true },
];

const DEFAULT_BRANDS: ProductBrand[] = [
  { id: 'brd-1', name: 'General', description: 'Unbranded or standard commodities', isActive: true },
  { id: 'brd-2', name: 'Samsung', description: 'Original electronics and accessories', isActive: true },
  { id: 'brd-3', name: 'Apple', description: 'Premium tech and accessories', isActive: true },
  { id: 'brd-4', name: 'Anker', description: 'Power banks, chargers, audio', isActive: true },
  { id: 'brd-5', name: 'Al-Baraka', description: 'Foodstuff and wholesale dates', isActive: true },
  { id: 'brd-6', name: 'Coca-Cola', description: 'Carbonated soft drinks', isActive: true },
  { id: 'brd-7', name: 'Biyole', description: 'Mineral bottled water', isActive: true },
];

const DEFAULT_UNITS: ProductUnit[] = [
  { id: 'unt-1', name: 'Pieces', symbol: 'PCS' },
  { id: 'unt-2', name: 'Kilogram', symbol: 'KG' },
  { id: 'unt-3', name: 'Gram', symbol: 'GRAM' },
  { id: 'unt-4', name: 'Liter', symbol: 'LITER' },
  { id: 'unt-5', name: 'Meter', symbol: 'METER' },
  { id: 'unt-6', name: 'Box', symbol: 'BOX' },
  { id: 'unt-7', name: 'Pack', symbol: 'PACK' },
  { id: 'unt-8', name: 'Pair', symbol: 'PAIR' },
  { id: 'unt-9', name: 'Set', symbol: 'SET' },
  { id: 'unt-10', name: 'Dozen', symbol: 'DOZEN' },
  { id: 'unt-11', name: 'Can', symbol: 'CAN' },
  { id: 'unt-12', name: 'Bottle', symbol: 'BOTTLE' },
  { id: 'unt-13', name: 'Bag', symbol: 'BAG' },
  { id: 'unt-14', name: 'Carton', symbol: 'CARTON' },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'P00001',
    sku: 'BEV-COCA-330',
    barcode: '5449000000996',
    name: 'Coca-Cola 330ml Can',
    category: 'Beverages',
    brand: 'Coca-Cola',
    costPrice: 0.85,
    sellingPrice: 1.25,
    stock: 240,
    minStockLevel: 24,
    unit: 'CAN',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-2',
    code: 'P00002',
    sku: 'BEV-SPRITE-330',
    barcode: '5449000014535',
    name: 'Sprite 330ml Can',
    category: 'Beverages',
    brand: 'Coca-Cola',
    costPrice: 0.80,
    sellingPrice: 1.20,
    stock: 180,
    minStockLevel: 20,
    unit: 'CAN',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-3',
    code: 'P00003',
    sku: 'BEV-WATER-500',
    barcode: '6001001002003',
    name: 'Somali Mineral Water 500ml',
    category: 'Beverages',
    brand: 'Biyole',
    costPrice: 0.20,
    sellingPrice: 0.40,
    stock: 450,
    minStockLevel: 50,
    unit: 'BOTTLE',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-4',
    code: 'P00004',
    sku: 'GRO-RICE-BAS-25',
    barcode: '8901030012019',
    name: 'Basmati Rice Premium 25kg',
    category: 'Groceries',
    brand: 'Al-Baraka',
    costPrice: 22.00,
    sellingPrice: 28.50,
    stock: 65,
    minStockLevel: 10,
    unit: 'BAG',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-5',
    code: 'P00005',
    sku: 'GRO-OIL-SUN-5L',
    barcode: '6281001004001',
    name: 'Pure Sunflower Cooking Oil 5L',
    category: 'Groceries',
    brand: 'General',
    costPrice: 8.50,
    sellingPrice: 11.50,
    stock: 42,
    minStockLevel: 8,
    unit: 'BOTTLE',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-6',
    code: 'P00006',
    sku: 'GRO-MILK-POWDER-2.5',
    barcode: '7613032120011',
    name: 'Nido Fortified Milk Powder 2.5kg',
    category: 'Groceries',
    brand: 'General',
    costPrice: 19.50,
    sellingPrice: 24.00,
    stock: 35,
    minStockLevel: 5,
    unit: 'CAN',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-01',
  },
  {
    id: 'prod-7',
    code: 'P00007',
    sku: 'ELE-USBC-FAST-65W',
    barcode: '6971234567890',
    name: 'Fast GaN Charger 65W Dual Port',
    category: 'Electronics',
    brand: 'Anker',
    costPrice: 14.00,
    sellingPrice: 22.00,
    stock: 28,
    minStockLevel: 6,
    unit: 'PCS',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-02',
  },
  {
    id: 'prod-8',
    code: 'P00008',
    sku: 'ELE-BT-EARBUDS-PRO',
    barcode: '6979876543210',
    name: 'Wireless Bluetooth Earbuds Pro',
    category: 'Electronics',
    brand: 'Samsung',
    costPrice: 18.00,
    sellingPrice: 29.99,
    stock: 19,
    minStockLevel: 5,
    unit: 'PCS',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-02',
  },
  {
    id: 'prod-9',
    code: 'P00009',
    sku: 'GRO-DATES-1KG',
    barcode: '6281005001234',
    name: 'Al-Baraka Premium Saudi Dates 1kg',
    category: 'Groceries',
    brand: 'Al-Baraka',
    costPrice: 3.80,
    sellingPrice: 6.00,
    stock: 75,
    minStockLevel: 15,
    unit: 'BOX',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=150&auto=format&fit=crop&q=60',
    createdAt: '2026-09-03',
  },
  {
    id: 'prod-10',
    code: 'P00010',
    sku: 'GRO-SPAGHETTI-500G',
    barcode: '8001234567891',
    name: 'Somali Pasta Spaghetti 500g (Pack of 4)',
    category: 'Groceries',
    brand: 'General',
    costPrice: 2.20,
    sellingPrice: 3.50,
    stock: 120,
    minStockLevel: 25,
    unit: 'PACK',
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

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Al-Khaleej Wholesale Ltd',
    company: 'Al-Khaleej Trading Group',
    contactPerson: 'Sheikh Abdirahman',
    phone: '+252 61 222 9900',
    email: 'sales@alkhaleej.so',
    address: 'Bakaara Market, Wholesale Block 4, Mogadishu',
    notes: 'Primary dry foodstuff & beverages distributor',
    balance: 450.00,
    totalPurchases: 2850.00,
    totalPaid: 2400.00,
    status: 'active',
    createdAt: '2026-09-01',
  },
  {
    id: 'sup-2',
    name: 'Global Tech Distribution FZE',
    company: 'Global Tech East Africa',
    contactPerson: 'Eng. Khalid Warsame',
    phone: '+252 61 333 4455',
    email: 'orders@globaltech.ae',
    address: 'KM4 Commercial Tower, 2nd Floor, Mogadishu',
    notes: 'Official importer of mobile accessories and chargers',
    balance: 1200.00,
    totalPurchases: 4600.00,
    totalPaid: 3400.00,
    status: 'active',
    createdAt: '2026-09-02',
  },
  {
    id: 'sup-3',
    name: 'Baraka Grains & Spices Co.',
    company: 'Al-Baraka Import / Export',
    contactPerson: 'Haji Nuur',
    phone: '+252 61 777 1122',
    email: 'info@barakagrains.so',
    address: 'Hamar Weyne Sea Port Area, Mogadishu',
    notes: 'Bulk rice, sugar, oil, dates supplier',
    balance: 0,
    totalPurchases: 3200.00,
    totalPaid: 3200.00,
    status: 'active',
    createdAt: '2026-09-03',
  },
];

const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'pu-1',
    purchaseNo: 'PU00001',
    date: '2026-09-10',
    time: '09:30 AM',
    supplierId: 'sup-1',
    supplierName: 'Al-Khaleej Wholesale Ltd',
    supplierPhone: '+252 61 222 9900',
    items: [
      {
        productId: 'prod-1',
        productName: 'Coca-Cola 330ml Can',
        sku: 'BEV-COKE-330',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=60',
        quantity: 100,
        unit: 'CAN',
        costPrice: 0.80,
        sellingPrice: 1.25,
        discount: 0,
        total: 80.00,
      },
      {
        productId: 'prod-2',
        productName: 'Sprite 330ml Can',
        sku: 'BEV-SPRITE-330',
        imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=150&auto=format&fit=crop&q=60',
        quantity: 60,
        unit: 'CAN',
        costPrice: 0.80,
        sellingPrice: 1.25,
        discount: 0,
        total: 48.00,
      },
    ],
    subtotal: 128.00,
    discount: 0,
    totalAmount: 128.00,
    paidAmount: 128.00,
    supplierBalance: 0,
    paymentStatus: 'full_paid',
    paymentMethod: 'Premier Bank Commercial',
    accountId: 'acc-premier',
    accountName: 'Premier Bank Commercial',
    status: 'Received',
    notes: 'Restock batch #491 - Fully settled from Premier Bank',
    actor: 'Admin',
    createdAt: '2026-09-10T09:30:00Z',
  },
  {
    id: 'pu-2',
    purchaseNo: 'PU00002',
    date: '2026-09-12',
    time: '02:15 PM',
    supplierId: 'sup-2',
    supplierName: 'Global Tech Distribution FZE',
    supplierPhone: '+252 61 333 4455',
    items: [
      {
        productId: 'prod-7',
        productName: 'Fast GaN Charger 65W Dual Port',
        sku: 'ELE-CHG-GAN-65W',
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=150&auto=format&fit=crop&q=60',
        quantity: 50,
        unit: 'PCS',
        costPrice: 13.50,
        sellingPrice: 22.00,
        discount: 0,
        total: 675.00,
      },
    ],
    subtotal: 675.00,
    discount: 25.00,
    totalAmount: 650.00,
    paidAmount: 200.00,
    supplierBalance: 450.00,
    paymentStatus: 'partial_payment',
    paymentMethod: 'Hormuud EVC Plus (615001234)',
    accountId: 'acc-evc',
    accountName: 'Hormuud EVC Plus (615001234)',
    status: 'Received',
    notes: 'Down payment of $200 via EVC Plus. Remaining $450 payable on 30-day supplier credit terms.',
    actor: 'Admin',
    createdAt: '2026-09-12T14:15:00Z',
  },
];

const INITIAL_SUPPLIER_PAYMENTS: SupplierPayment[] = [
  {
    id: 'sp-1',
    paymentNo: 'PAY-SP-1001',
    supplierId: 'sup-2',
    supplierName: 'Global Tech Distribution FZE',
    purchaseId: 'pu-2',
    purchaseNo: 'PU00002',
    date: '2026-09-12',
    time: '02:15 PM',
    amount: 200.00,
    paymentMethod: 'Hormuud EVC Plus',
    accountId: 'acc-evc',
    accountName: 'Hormuud EVC Plus (615001234)',
    referenceNo: 'TXN-EVC-884910',
    notes: 'Initial payment for PO PU00002',
    actor: 'Admin',
    createdAt: '2026-09-12T14:15:00Z',
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
        sku: 'GRN-RICE-25KG',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=60',
        quantity: 1,
        costPrice: 22.00,
        sellingPrice: 28.50,
        discount: 0,
        total: 28.50,
      },
      {
        productId: 'prod-3',
        productName: 'Somali Mineral Water 500ml',
        sku: 'BEV-WATER-500',
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=60',
        quantity: 1,
        costPrice: 3.80,
        sellingPrice: 5.50,
        discount: 0,
        total: 5.50,
      },
    ],
    subtotal: 34.00,
    discount: 1.00,
    deliveryFee: 2.00,
    deliveryFeePayer: 'Customer',
    cargoFee: 0,
    total: 35.00,
    paidAmount: 20.00,
    advanceAmount: 20.00,
    paymentType: 'partial_payment',
    paymentMethod: 'EVC Plus',
    paymentProvider: 'Hormuud Telecom',
    paymentStatus: 'verified',
    paymentVerificationReference: 'EVC-9948201',
    paymentVerifiedAt: '2026-09-15T13:35:00Z',
    paymentVerifiedBy: 'Banadir Admin',
    allocation: {
      deliveryFee: 2.00,
      deliveryCovered: 2.00,
      remainingDelivery: 0,
      productCovered: 18.00,
      remainingProduct: 15.00,
      feePayer: 'Customer',
    },
    fulfillmentType: 'Delivery',
    deliveryDistrict: 'Wadajir',
    deliveryAddress: 'Wadajir, Airport Road, Mogadishu',
    driverId: 'drv-1',
    driverName: 'Guled Nuur Ali',
    driverPhone: '+252 61 700 8899',
    driverVehicle: 'Motorcycle (Plate: MOG-4412)',
    deliveryCompany: 'Banadir Express Fleet',
    status: 'out_for_delivery',
    portalToken: 'cpt_89f3b1e7c2a4d5e6f7a8b9c0',
    notes: 'Please deliver before Maghrib prayer',
    events: [
      {
        id: 'evt-10027-3',
        orderId: 'order-10027',
        action: 'OUT_FOR_DELIVERY',
        title: 'Out For Delivery',
        description: 'Assigned to driver Guled Nuur Ali (+252 61 700 8899)',
        actor: 'Admin',
        timestamp: '2026-09-15T14:15:00Z',
      },
      {
        id: 'evt-10027-2',
        orderId: 'order-10027',
        action: 'PAYMENT_VERIFIED',
        title: 'Advance Payment Verified',
        description: 'Advance payment of $20.00 verified via EVC Plus [Ref: EVC-9948201]',
        actor: 'Banadir Admin',
        timestamp: '2026-09-15T13:35:00Z',
      },
      {
        id: 'evt-10027-1',
        orderId: 'order-10027',
        action: 'ORDER_CREATED',
        title: 'Order Created',
        description: 'Pre-sale order O00027 created. Total: $35.00, Advance: $20.00',
        actor: 'Admin',
        timestamp: '2026-09-15T13:30:00Z',
      },
    ],
    createdAt: '2026-09-15T13:30:00Z',
    updatedAt: '2026-09-15T14:15:00Z',
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
        sku: 'DRY-NIDO-2500',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop&q=60',
        quantity: 2,
        costPrice: 19.50,
        sellingPrice: 24.00,
        discount: 0,
        total: 48.00,
      },
    ],
    subtotal: 48.00,
    discount: 3.00,
    deliveryFee: 2.00,
    deliveryFeePayer: 'Customer',
    cargoFee: 0,
    total: 47.00,
    paidAmount: 10.00,
    advanceAmount: 10.00,
    paymentType: 'partial_payment',
    paymentMethod: 'E-Dahab',
    paymentProvider: 'Dahabshiil',
    paymentStatus: 'pending',
    allocation: {
      deliveryFee: 2.00,
      deliveryCovered: 2.00,
      remainingDelivery: 0,
      productCovered: 8.00,
      remainingProduct: 37.00,
      feePayer: 'Customer',
    },
    fulfillmentType: 'Delivery',
    deliveryDistrict: 'Hodan',
    deliveryAddress: 'Hodan, Taleex Street, Mogadishu',
    status: 'ready',
    portalToken: 'cpt_62a4d5e6f7a8b9c089f3b1e7',
    notes: 'Call before arriving',
    events: [
      {
        id: 'evt-10026-2',
        orderId: 'order-10026',
        action: 'ORDER_READY',
        title: 'Order Ready',
        description: 'Packaged and waiting in dispatch zone',
        actor: 'Warehouse Staff',
        timestamp: '2026-09-15T12:00:00Z',
      },
      {
        id: 'evt-10026-1',
        orderId: 'order-10026',
        action: 'ORDER_CREATED',
        title: 'Order Created',
        description: 'Pre-sale order O00026 created. Total: $47.00, Advance: $10.00',
        actor: 'Admin',
        timestamp: '2026-09-15T11:15:00Z',
      },
    ],
    createdAt: '2026-09-15T11:15:00Z',
    updatedAt: '2026-09-15T12:00:00Z',
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
        sku: 'TECH-CHG-65W',
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=150&auto=format&fit=crop&q=60',
        quantity: 1,
        costPrice: 14.00,
        sellingPrice: 22.00,
        discount: 0,
        total: 22.00,
      },
    ],
    subtotal: 22.00,
    discount: 0,
    deliveryFee: 0,
    cargoFee: 15.00,
    deliveryFeePayer: 'Customer',
    total: 37.00,
    paidAmount: 37.00,
    advanceAmount: 37.00,
    paymentType: 'full_payment',
    paymentMethod: 'Jeeb',
    paymentProvider: 'Jeeb Mobile',
    paymentStatus: 'verified',
    paymentVerificationReference: 'JB-778103',
    paymentVerifiedAt: '2026-09-14T14:45:00Z',
    paymentVerifiedBy: 'Admin',
    allocation: {
      deliveryFee: 15.00,
      deliveryCovered: 15.00,
      remainingDelivery: 0,
      productCovered: 22.00,
      remainingProduct: 0,
      feePayer: 'Customer',
    },
    fulfillmentType: 'Cargo',
    cargoCompany: 'Bakaara Express Cargo',
    cargoRegion: 'Bay',
    cargoDestination: 'Baidoa Main Branch',
    status: 'confirmed',
    portalToken: 'cpt_4d5e6f7a8b9c089f3b1e7c2a',
    notes: 'Send to Baidoa Office',
    events: [
      {
        id: 'evt-10025-1',
        orderId: 'order-10025',
        action: 'ORDER_CREATED',
        title: 'Order Created',
        description: 'Cargo order O00025 created with full advance payment of $37.00',
        actor: 'Admin',
        timestamp: '2026-09-14T14:40:00Z',
      },
    ],
    createdAt: '2026-09-14T14:40:00Z',
    updatedAt: '2026-09-14T14:45:00Z',
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
        sku: 'BEV-COCA-330',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=60',
        quantity: 12,
        costPrice: 0.85,
        sellingPrice: 1.25,
        discount: 0,
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
    paymentType: 'full_payment',
    paymentMethod: 'Cash',
    paymentStatus: 'verified',
    allocation: {
      deliveryFee: 0,
      deliveryCovered: 0,
      remainingDelivery: 0,
      productCovered: 15.00,
      remainingProduct: 0,
      feePayer: 'Customer',
    },
    fulfillmentType: 'Pickup',
    status: 'converted',
    convertedSaleId: 'sale-10033',
    portalToken: 'cpt_5e6f7a8b9c089f3b1e7c2a4d',
    notes: 'Walk-in collection',
    events: [
      {
        id: 'evt-10024-2',
        orderId: 'order-10024',
        action: 'CONVERTED_TO_SALE',
        title: 'Converted to Sale',
        description: 'Converted into sale invoice INV-10033 upon pickup',
        actor: 'Cashier 1',
        timestamp: '2026-09-14T10:15:00Z',
      },
      {
        id: 'evt-10024-1',
        orderId: 'order-10024',
        action: 'ORDER_CREATED',
        title: 'Order Created',
        description: 'Pre-sale order O00024 created for pickup',
        actor: 'Cashier 1',
        timestamp: '2026-09-14T10:00:00Z',
      },
    ],
    createdAt: '2026-09-14T07:00:00Z',
    updatedAt: '2026-09-14T10:15:00Z',
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
    const isResetDone = localStorage.getItem('benadir_factory_reset_done') === 'true';
    const saved = localStorage.getItem('benadir_products');
    if (saved) return JSON.parse(saved);
    if (isResetDone) return [];
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const saved = localStorage.getItem('benadir_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [brands, setBrands] = useState<ProductBrand[]>(() => {
    const saved = localStorage.getItem('benadir_brands');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
  });

  const [units, setUnits] = useState<ProductUnit[]>(() => {
    const saved = localStorage.getItem('benadir_units');
    return saved ? JSON.parse(saved) : DEFAULT_UNITS;
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('benadir_inventory_movements');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('benadir_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('benadir_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => {
    const saved = localStorage.getItem('benadir_supplier_payments');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIER_PAYMENTS;
  });

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
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
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
    localStorage.setItem('benadir_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('benadir_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('benadir_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('benadir_inventory_movements', JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

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

  useEffect(() => {
    localStorage.setItem('benadir_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('benadir_supplier_payments', JSON.stringify(supplierPayments));
  }, [supplierPayments]);

  useEffect(() => {
    localStorage.setItem('benadir_purchases', JSON.stringify(purchases));
  }, [purchases]);

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

    // Record inventory movements for sold items
    const saleMovements: InventoryMovement[] = newSale.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const stockAfter = Math.max(0, (prod ? prod.stock : 0) - item.quantity);
      return {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: newSale.date,
        productId: item.productId,
        productName: item.productName,
        type: 'sale',
        quantityChange: -item.quantity,
        stockAfter,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        unit: prod?.unit,
        referenceNo: invoiceNo,
        reason: `Sold on invoice ${invoiceNo} (${newSale.customerName})`,
        actor: currentUser.name || 'Cashier',
      };
    });
    setInventoryMovements((prev) => [...saleMovements, ...prev]);

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
    // 1. Authoritative sequential, collision-safe Order ID (e.g. O00028)
    let maxNum = 0;
    orders.forEach((o) => {
      const match = o.orderNo?.match(/^O(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNum) maxNum = val;
      }
    });
    const nextNum = maxNum + 1;
    const orderNo = `O${String(nextNum).padStart(5, '0')}`;
    const id = `order-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // 2. Cryptographic non-guessable portal token
    const tokenArr = new Uint8Array(16);
    crypto.getRandomValues(tokenArr);
    const portalToken = 'cpt_' + Array.from(tokenArr).map((b) => b.toString(16).padStart(2, '0')).join('');

    // 3. Advance / Hormaris Allocation calculation
    const deliveryFeePayer = orderData.deliveryFeePayer || 'Customer';
    const feeOwedByCustomer = deliveryFeePayer === 'Customer'
      ? (orderData.fulfillmentType === 'Delivery' ? (orderData.deliveryFee || 0) : (orderData.cargoFee || 0))
      : 0;
    const advance = orderData.paidAmount || orderData.advanceAmount || 0;
    const deliveryCovered = Math.min(feeOwedByCustomer, advance);
    const remainingDelivery = Math.max(0, feeOwedByCustomer - deliveryCovered);
    const leftoverForProduct = Math.max(0, advance - deliveryCovered);
    const subtotalAfterDiscount = Math.max(0, (orderData.subtotal || 0) - (orderData.discount || 0));
    const productCovered = Math.min(subtotalAfterDiscount, leftoverForProduct);
    const remainingProduct = Math.max(0, subtotalAfterDiscount - productCovered);

    const initialEvent: OrderEvent = {
      id: `evt-${Date.now()}-1`,
      orderId: id,
      action: 'ORDER_CREATED',
      title: 'Order Created',
      description: `Pre-sale order ${orderNo} registered for ${orderData.customerName}. Subtotal: $${(orderData.subtotal || 0).toFixed(2)}, Advance: $${advance.toFixed(2)} (${orderData.fulfillmentType})`,
      actor: currentUser.name || 'Admin',
      timestamp: now,
    };

    const newOrder: Order = {
      ...orderData,
      id,
      orderNo,
      portalToken,
      deliveryFeePayer,
      paymentStatus: orderData.paymentStatus || (advance >= orderData.total ? 'verified' : advance > 0 ? 'partially_paid' : 'unpaid'),
      allocation: {
        deliveryFee: feeOwedByCustomer,
        deliveryCovered,
        remainingDelivery,
        productCovered,
        remainingProduct,
        feePayer: deliveryFeePayer,
      },
      events: [initialEvent],
      createdAt: now,
      updatedAt: now,
    };

    setOrders((prev) => [newOrder, ...prev]);
    addAuditLog(
      'CREATE_ORDER',
      orderNo,
      `Created order for ${newOrder.customerName} - Total: $${newOrder.total.toFixed(2)}, Advance: $${advance.toFixed(2)} (${newOrder.fulfillmentType})`
    );

    return newOrder;
  };

  const updateOrder = (orderId: string, updates: Partial<Order>, note?: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newEvent: OrderEvent = {
            id: `evt-${Date.now()}`,
            orderId: ord.id,
            action: 'ORDER_UPDATED',
            title: 'Order Updated',
            description: note || 'Order details modified',
            actor: currentUser.name || 'Admin',
            timestamp: now,
            note,
          };
          return {
            ...ord,
            ...updates,
            events: [newEvent, ...(ord.events || [])],
            updatedAt: now,
          };
        }
        return ord;
      })
    );
    addAuditLog('UPDATE_ORDER', orderId, note || 'Updated order details');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newEvent: OrderEvent = {
            id: `evt-${Date.now()}`,
            orderId: ord.id,
            action: 'STATUS_CHANGED',
            title: 'Status Updated',
            description: `Status transitioned from ${ord.status} to ${status}`,
            actor: currentUser.name || 'Staff',
            oldValue: ord.status,
            newValue: status,
            timestamp: now,
          };
          addAuditLog('UPDATE_ORDER_STATUS', ord.orderNo, `Status changed from ${ord.status} to ${status}`);
          return {
            ...ord,
            status,
            events: [newEvent, ...(ord.events || [])],
            updatedAt: now,
          };
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
      paymentMethod: (order.paymentMethod as any) || 'EVC Plus',
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

    const now = new Date().toISOString();
    const convertedEvent: OrderEvent = {
      id: `evt-${Date.now()}`,
      orderId: order.id,
      action: 'CONVERTED_TO_SALE',
      title: 'Converted to Sale',
      description: `Officially converted to sales invoice ${newSale.invoiceNo}`,
      actor: currentUser.name || 'Staff',
      timestamp: now,
      note: `Invoice: ${newSale.invoiceNo}`,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'converted',
              convertedSaleId: newSale.id,
              events: [convertedEvent, ...(o.events || [])],
              updatedAt: now,
            }
          : o
      )
    );
    addAuditLog('CONVERT_ORDER_TO_SALE', order.orderNo, `Converted into sale invoice ${newSale.invoiceNo}`);
    return newSale;
  };

  const recordOrderPayment = (
    orderId: string,
    amount: number,
    paymentMethod = 'EVC Plus',
    paymentProvider?: string,
    referenceNo?: string
  ) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newPaid = Math.min(ord.total, ord.paidAmount + amount);
          const remaining = Math.max(0, ord.total - newPaid);
          const newStatus = ord.status === 'pending' ? 'confirmed' : ord.status;
          const newPaymentStatus: OrderPaymentStatus = newPaid >= ord.total ? 'verified' : 'partially_paid';

          // Recalculate advance allocation
          const feeOwed = (ord.deliveryFeePayer || 'Customer') === 'Customer'
            ? (ord.fulfillmentType === 'Delivery' ? ord.deliveryFee : ord.cargoFee)
            : 0;
          const deliveryCovered = Math.min(feeOwed, newPaid);
          const remainingDelivery = Math.max(0, feeOwed - deliveryCovered);
          const leftoverForProduct = Math.max(0, newPaid - deliveryCovered);
          const subtotalAfterDiscount = Math.max(0, ord.subtotal - ord.discount);
          const productCovered = Math.min(subtotalAfterDiscount, leftoverForProduct);
          const remainingProduct = Math.max(0, subtotalAfterDiscount - productCovered);

          const payEvent: OrderEvent = {
            id: `evt-${Date.now()}`,
            orderId: ord.id,
            action: 'PAYMENT_RECEIVED',
            title: 'Payment Received',
            description: `Received $${amount.toFixed(2)} via ${paymentMethod}${paymentProvider ? ` (${paymentProvider})` : ''}${referenceNo ? ` Ref: ${referenceNo}` : ''}. Remaining: $${remaining.toFixed(2)}`,
            actor: currentUser.name || 'Staff',
            timestamp: now,
            note: referenceNo,
          };

          addAuditLog(
            'ORDER_PAYMENT',
            ord.orderNo,
            `Paid $${amount.toFixed(2)} via ${paymentMethod}. Remaining: $${remaining.toFixed(2)}`
          );

          return {
            ...ord,
            paidAmount: newPaid,
            status: newStatus,
            paymentMethod,
            paymentProvider: paymentProvider || ord.paymentProvider,
            paymentStatus: newPaymentStatus,
            allocation: {
              deliveryFee: feeOwed,
              deliveryCovered,
              remainingDelivery,
              productCovered,
              remainingProduct,
              feePayer: ord.deliveryFeePayer || 'Customer',
            },
            events: [payEvent, ...(ord.events || [])],
            updatedAt: now,
          };
        }
        return ord;
      })
    );
  };

  const verifyOrderPayment = (orderId: string, referenceNo?: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const verifyEvent: OrderEvent = {
            id: `evt-${Date.now()}`,
            orderId: ord.id,
            action: 'PAYMENT_VERIFIED',
            title: 'Payment Verified',
            description: `Payment of $${ord.paidAmount.toFixed(2)} verified by ${currentUser.name || 'Staff'}${referenceNo ? ` [Ref: ${referenceNo}]` : ''}`,
            actor: currentUser.name || 'Staff',
            timestamp: now,
            note: referenceNo,
          };
          addAuditLog('VERIFY_ORDER_PAYMENT', ord.orderNo, `Payment of $${ord.paidAmount.toFixed(2)} verified`);
          return {
            ...ord,
            paymentStatus: 'verified',
            paymentVerifiedAt: now,
            paymentVerifiedBy: currentUser.name || 'Staff',
            paymentVerificationReference: referenceNo || ord.paymentVerificationReference,
            events: [verifyEvent, ...(ord.events || [])],
            updatedAt: now,
          };
        }
        return ord;
      })
    );
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const cancelEvent: OrderEvent = {
            id: `evt-${Date.now()}`,
            orderId: ord.id,
            action: 'ORDER_CANCELLED',
            title: 'Order Cancelled',
            description: `Order cancelled. Reason: ${reason || 'Customer request'}`,
            actor: currentUser.name || 'Staff',
            timestamp: now,
            note: reason,
          };
          addAuditLog(
            'CANCEL_ORDER',
            ord.orderNo,
            `Order cancelled. Reason: ${reason || 'Customer request'}`
          );
          return {
            ...ord,
            status: 'cancelled',
            notes: `${ord.notes ? ord.notes + ' | ' : ''}Cancelled: ${reason || 'Customer request'}`,
            events: [cancelEvent, ...(ord.events || [])],
            updatedAt: now,
          };
        }
        return ord;
      })
    );
  };

  const getOrderByPortalToken = (token: string): Order | null => {
    if (!token) return null;
    return orders.find((o) => o.portalToken === token || o.id === token) || null;
  };

  const generateCustomerPortalUrl = (order: Order): string => {
    const token = order.portalToken || order.id;
    return `${window.location.origin}?portal_token=${encodeURIComponent(token)}`;
  };

  const factoryReset = (confirmCode: string = 'RESET', overrideRole?: string): boolean => {
    const role = overrideRole || currentUser.role;
    if (role !== 'Owner') {
      return false;
    }
    if (confirmCode.trim() !== 'RESET') {
      return false;
    }

    // 1. Wipe all business / sample / test data
    setProducts([]);
    setInventoryMovements([]);
    setSales([]);
    setOrders([]);
    setReturns([]);
    setDeliveries([]);
    setPurchases([]);
    setSuppliers([]);
    setSupplierPayments([]);
    setCargoShipments([]);
    setExpenses([]);
    setIncomes([]);
    setTransfers([]);

    // 2. Clear localStorage keys
    localStorage.setItem('benadir_factory_reset_done', 'true');
    localStorage.setItem('benadir_products', JSON.stringify([]));
    localStorage.setItem('benadir_inventory_movements', JSON.stringify([]));
    localStorage.setItem('benadir_sales', JSON.stringify([]));
    localStorage.setItem('benadir_orders', JSON.stringify([]));
    localStorage.setItem('benadir_returns', JSON.stringify([]));
    localStorage.setItem('benadir_deliveries', JSON.stringify([]));
    localStorage.setItem('benadir_cargo', JSON.stringify([]));
    localStorage.setItem('benadir_purchases', JSON.stringify([]));
    localStorage.setItem('benadir_suppliers', JSON.stringify([]));
    localStorage.setItem('benadir_supplier_payments', JSON.stringify([]));
    localStorage.setItem('benadir_expenses', JSON.stringify([]));
    localStorage.setItem('benadir_incomes', JSON.stringify([]));
    localStorage.setItem('benadir_transfers', JSON.stringify([]));

    // Reset accounts to 0 balance for clean commercial start
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        balance: 0,
      }))
    );

    addAuditLog(
      'FACTORY_RESET',
      'SYSTEM',
      'FACTORY RESET COMPLETE - Business/sample/test data has been cleared.'
    );

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

    // Record inventory movements for returned items
    const returnMovements: InventoryMovement[] = newReturn.items
      .filter((item) => item.restock)
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const stockAfter = (prod ? prod.stock : 0) + item.quantity;
        return {
          id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          date: new Date().toISOString().split('T')[0],
          productId: item.productId,
          productName: item.productName,
          type: 'return_in',
          quantityChange: item.quantity,
          stockAfter,
          sellingPrice: prod?.sellingPrice || (item.quantity > 0 ? item.refundAmount / item.quantity : 0),
          unit: prod?.unit,
          referenceNo: returnNo,
          reason: `Customer Return Restock ${returnNo}`,
          actor: currentUser.name || 'Cashier',
        };
      });
    if (returnMovements.length > 0) {
      setInventoryMovements((prev) => [...returnMovements, ...prev]);
    }

    // Deduct refund from cash account
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === 'acc-cash' ? { ...acc, balance: acc.balance - newReturn.totalRefund } : acc))
    );

    setReturns((prev) => [newReturn, ...prev]);
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'code' | 'createdAt'>): Product => {
    // Generate canonical code P00001, P00002...
    let maxSeq = 0;
    products.forEach((p) => {
      const match = p.code?.match(/^P(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    });
    const nextSeq = maxSeq + 1;
    const code = `P${String(nextSeq).padStart(5, '0')}`;
    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0];
    const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const initialCostLayers: CostLayer[] =
      prodData.stock > 0
        ? [
            {
              id: `layer-${Date.now()}-1`,
              date: dateOnly,
              quantity: prodData.stock,
              remainingQuantity: prodData.stock,
              costPrice: prodData.costPrice,
              sellingPrice: prodData.sellingPrice,
              source: 'initial',
              notes: 'Initial inventory registration',
            },
          ]
        : [];

    const initialPriceHistory: PriceHistoryRecord[] = [
      {
        id: `ph-${Date.now()}-1`,
        date: dateOnly,
        oldCost: 0,
        newCost: prodData.costPrice,
        oldSelling: 0,
        newSelling: prodData.sellingPrice,
        actor: currentUser.name || 'Admin',
        reason: 'Initial pricing registration',
      },
    ];

    const initialHistory: ProductHistoryEvent[] = [
      {
        id: `he-${Date.now()}-1`,
        timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        actor: currentUser.name || 'Admin',
        action: 'PRODUCT_CREATED',
        details: `Created product ${prodData.name} (${code}) with ${prodData.stock} ${prodData.unit || 'PCS'} initial stock at $${prodData.costPrice.toFixed(2)} cost / $${prodData.sellingPrice.toFixed(2)} sale`,
      },
    ];

    const newProduct: Product = {
      ...prodData,
      id,
      code,
      costLayers: initialCostLayers,
      priceHistory: initialPriceHistory,
      history: initialHistory,
      createdAt: dateOnly,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // If initial stock > 0, record opening inventory movement
    if (prodData.stock > 0) {
      const openingMovement: InventoryMovement = {
        id: `mov-${Date.now()}-init`,
        date: dateOnly,
        productId: id,
        productName: prodData.name,
        type: 'opening',
        quantityChange: prodData.stock,
        stockAfter: prodData.stock,
        costPrice: prodData.costPrice,
        sellingPrice: prodData.sellingPrice,
        unit: prodData.unit,
        referenceNo: code,
        reason: 'Opening stock count',
        actor: currentUser.name || 'Admin',
      };
      setInventoryMovements((prev) => [openingMovement, ...prev]);
    }

    addAuditLog('CREATE_PRODUCT', code, `Created ${prodData.name} (${code}) - Stock: ${prodData.stock}`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>, reason?: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;

        const now = new Date().toISOString();
        const dateOnly = now.split('T')[0];
        const historyEvents: ProductHistoryEvent[] = [...(prod.history || [])];
        const priceChanges: PriceHistoryRecord[] = [...(prod.priceHistory || [])];

        const costChanged = updates.costPrice !== undefined && updates.costPrice !== prod.costPrice;
        const sellingChanged = updates.sellingPrice !== undefined && updates.sellingPrice !== prod.sellingPrice;
        if (costChanged || sellingChanged) {
          priceChanges.unshift({
            id: `ph-${Date.now()}`,
            date: dateOnly,
            oldCost: prod.costPrice,
            newCost: updates.costPrice ?? prod.costPrice,
            oldSelling: prod.sellingPrice,
            newSelling: updates.sellingPrice ?? prod.sellingPrice,
            actor: currentUser.name || 'Admin',
            reason: reason || 'Product price update',
          });
        }

        const changesList: string[] = [];
        if (updates.name && updates.name !== prod.name) changesList.push(`Name: ${prod.name} -> ${updates.name}`);
        if (updates.category && updates.category !== prod.category) changesList.push(`Category: ${prod.category} -> ${updates.category}`);
        if (updates.brand && updates.brand !== prod.brand) changesList.push(`Brand: ${prod.brand || 'None'} -> ${updates.brand}`);
        if (updates.unit && updates.unit !== prod.unit) changesList.push(`Unit: ${prod.unit} -> ${updates.unit}`);
        if (updates.minStockLevel !== undefined && updates.minStockLevel !== prod.minStockLevel) {
          changesList.push(`Low stock alert: ${prod.minStockLevel} -> ${updates.minStockLevel}`);
        }
        if (updates.isActive !== undefined && updates.isActive !== prod.isActive) {
          changesList.push(`Status: ${updates.isActive ? 'Active' : 'Inactive'}`);
        }
        if (updates.imageUrl !== undefined && updates.imageUrl !== prod.imageUrl) {
          changesList.push('Image updated');
        }

        if (changesList.length > 0 || reason) {
          historyEvents.unshift({
            id: `he-${Date.now()}`,
            timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            actor: currentUser.name || 'Admin',
            action: 'PRODUCT_UPDATED',
            details: changesList.join(', ') || reason || 'Product attributes modified',
          });
        }

        return {
          ...prod,
          ...updates,
          priceHistory: priceChanges,
          history: historyEvents,
          updatedAt: now,
        };
      })
    );
    addAuditLog('UPDATE_PRODUCT', id, reason || 'Product attributes modified');
  };

  const addStockToProduct = (
    productId: string,
    quantity: number,
    costPrice: number,
    newSellingPrice?: number,
    options?: { supplierName?: string; referenceNo?: string; notes?: string; accountId?: string }
  ) => {
    const targetProd = products.find((p) => p.id === productId);
    if (!targetProd) return;

    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0];
    const oldStock = targetProd.stock;
    const newStock = oldStock + quantity;
    const oldCost = targetProd.costPrice;
    const oldSelling = targetProd.sellingPrice;
    const finalSellingPrice = newSellingPrice && newSellingPrice > 0 ? newSellingPrice : oldSelling;

    // Calculate weighted average cost price
    const totalValuation = oldStock * oldCost + quantity * costPrice;
    const weightedCost = newStock > 0 ? parseFloat((totalValuation / newStock).toFixed(2)) : costPrice;

    // New cost layer
    const newLayer: CostLayer = {
      id: `layer-${Date.now()}`,
      date: dateOnly,
      quantity,
      remainingQuantity: quantity,
      costPrice,
      sellingPrice: finalSellingPrice,
      source: 'purchase',
      referenceNo: options?.referenceNo,
      notes: options?.notes || `Restock batch +${quantity} ${targetProd.unit}`,
    };

    // Price history record if prices changed
    const priceChanges: PriceHistoryRecord[] = [...(targetProd.priceHistory || [])];
    if (costPrice !== oldCost || finalSellingPrice !== oldSelling) {
      priceChanges.unshift({
        id: `ph-${Date.now()}`,
        date: dateOnly,
        oldCost,
        newCost: costPrice,
        oldSelling,
        newSelling: finalSellingPrice,
        actor: currentUser.name || 'Admin',
        reason: options?.notes || `Batch restock: +${quantity} units at $${costPrice.toFixed(2)}`,
      });
    }

    // Product history event
    const historyEvents: ProductHistoryEvent[] = [...(targetProd.history || [])];
    historyEvents.unshift({
      id: `he-${Date.now()}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      actor: currentUser.name || 'Admin',
      action: 'ADD_STOCK',
      oldValue: `${oldStock} ${targetProd.unit} @ $${oldCost}`,
      newValue: `${newStock} ${targetProd.unit} (Weighted Avg $${weightedCost})`,
      details: `Added +${quantity} ${targetProd.unit} at $${costPrice.toFixed(2)} cost. New selling: $${finalSellingPrice.toFixed(2)}. Batch ref: ${options?.referenceNo || 'None'}`,
    });

    const updatedProduct: Product = {
      ...targetProd,
      stock: newStock,
      costPrice: weightedCost,
      sellingPrice: finalSellingPrice,
      costLayers: [newLayer, ...(targetProd.costLayers || [])],
      priceHistory: priceChanges,
      history: historyEvents,
      updatedAt: now,
    };

    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));

    // Record inventory movement
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: dateOnly,
      productId,
      productName: targetProd.name,
      type: 'purchase',
      quantityChange: quantity,
      stockAfter: newStock,
      costPrice,
      sellingPrice: finalSellingPrice,
      unit: targetProd.unit,
      referenceNo: options?.referenceNo || targetProd.code,
      reason: options?.notes || `Added batch stock: +${quantity} ${targetProd.unit}`,
      actor: currentUser.name || 'Admin',
    };
    setInventoryMovements((prev) => [movement, ...prev]);

    // Deduct from account if specified
    if (options?.accountId) {
      const totalCost = quantity * costPrice;
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === options.accountId ? { ...acc, balance: acc.balance - totalCost } : acc))
      );
    }

    addAuditLog(
      'RESTOCK_PRODUCT',
      targetProd.code,
      `Restocked ${quantity} ${targetProd.unit} to ${targetProd.name}. Cost: $${costPrice}, Stock now: ${newStock}`
    );
  };

  const adjustStock = (
    productId: string,
    quantityChange: number,
    reason: string,
    type: 'adjustment' | 'damage' | 'loss' = 'adjustment'
  ) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const newStock = Math.max(0, prod.stock + quantityChange);
        const now = new Date().toISOString();
        const dateOnly = now.split('T')[0];

        const historyEvents: ProductHistoryEvent[] = [...(prod.history || [])];
        historyEvents.unshift({
          id: `he-${Date.now()}`,
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          actor: currentUser.name || 'Admin',
          action: `STOCK_${type.toUpperCase()}`,
          oldValue: `${prod.stock} ${prod.unit}`,
          newValue: `${newStock} ${prod.unit}`,
          details: `Stock adjustment of ${quantityChange > 0 ? `+${quantityChange}` : quantityChange} ${prod.unit}. Reason: ${reason}`,
        });

        // Record movement
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}`,
          date: dateOnly,
          productId,
          productName: prod.name,
          type,
          quantityChange,
          stockAfter: newStock,
          costPrice: prod.costPrice,
          sellingPrice: prod.sellingPrice,
          unit: prod.unit,
          referenceNo: prod.code,
          reason,
          actor: currentUser.name || 'Admin',
        };
        setInventoryMovements((mPrev) => [movement, ...mPrev]);

        return {
          ...prod,
          stock: newStock,
          history: historyEvents,
          updatedAt: now,
        };
      })
    );
    addAuditLog('STOCK_ADJUSTMENT', productId, `Qty change: ${quantityChange}. Reason: ${reason}`);
  };

  const deleteProduct = (id: string): { success: boolean; message: string; archived?: boolean } => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return { success: false, message: 'Product not found.' };

    // Check if product is referenced in sales, orders, or returns
    const inSales = sales.some((s) => s.items?.some((i) => i.productId === id));
    const inOrders = orders.some((o) => o.items?.some((i) => i.productId === id));
    const inReturns = returns.some((r) => r.items?.some((i) => i.productId === id));
    const inPurchases = purchases.some((pu) => pu.items?.some((i) => i.productId === id));

    if (inSales || inOrders || inReturns || inPurchases) {
      updateProduct(id, { isActive: false, isArchived: true }, 'Archived due to existing transaction ledger records');
      addAuditLog('ARCHIVE_PRODUCT', prod.code, `Safely archived ${prod.name} (Has transaction history)`);
      return {
        success: true,
        archived: true,
        message: `Product "${prod.name}" has commercial transaction records. To preserve financial ledgers and audit trails, it has been safely ARCHIVED and deactivated instead of permanently deleted.`,
      };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setInventoryMovements((prev) => prev.filter((m) => m.productId !== id));
    addAuditLog('DELETE_PRODUCT', prod.code, `Permanently deleted ${prod.name}`);
    return {
      success: true,
      archived: false,
      message: `Product "${prod.name}" permanently deleted.`,
    };
  };

  const archiveProduct = (id: string) => {
    updateProduct(id, { isActive: false, isArchived: true }, 'Archived by user');
  };

  const reactivateProduct = (id: string) => {
    updateProduct(id, { isActive: true, isArchived: false }, 'Reactivated by user');
  };

  const checkDuplicateProduct = (name: string, sku?: string, barcode?: string, brand?: string): Product | null => {
    const cleanName = name.trim().toLowerCase();
    const cleanSku = sku?.trim().toLowerCase();
    const cleanBarcode = barcode?.trim();
    const cleanBrand = brand?.trim().toLowerCase();

    return (
      products.find((p) => {
        if (cleanBarcode && p.barcode && p.barcode.trim() === cleanBarcode) return true;
        if (cleanSku && p.sku && p.sku.trim().toLowerCase() === cleanSku) return true;
        if (p.name.trim().toLowerCase() === cleanName) return true;
        if (cleanBrand && p.brand && p.brand.trim().toLowerCase() === cleanBrand && p.name.trim().toLowerCase() === cleanName) return true;
        return false;
      }) || null
    );
  };

  // Taxonomy helpers
  const addCategory = (name: string, description?: string): ProductCategory => {
    const trimmed = name.trim();
    const existing = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const newCat: ProductCategory = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      description,
      isActive: true,
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('CREATE_CATEGORY', newCat.name, description || 'Added category');
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<ProductCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addBrand = (name: string, description?: string): ProductBrand => {
    const trimmed = name.trim();
    const existing = brands.find((b) => b.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const newBrand: ProductBrand = {
      id: `brd-${Date.now()}`,
      name: trimmed,
      description,
      isActive: true,
    };
    setBrands((prev) => [...prev, newBrand]);
    addAuditLog('CREATE_BRAND', newBrand.name, description || 'Added brand');
    return newBrand;
  };

  const updateBrand = (id: string, updates: Partial<ProductBrand>) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  const addUnit = (name: string, symbol: string): ProductUnit => {
    const trimmedSym = symbol.trim().toUpperCase();
    const trimmedName = name.trim();
    const existing = units.find(
      (u) => u.symbol.toUpperCase() === trimmedSym || u.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) return existing;
    const newUnit: ProductUnit = {
      id: `unt-${Date.now()}`,
      name: trimmedName,
      symbol: trimmedSym,
    };
    setUnits((prev) => [...prev, newUnit]);
    return newUnit;
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

  const checkDuplicateCustomer = (name: string, phone?: string): Customer | null => {
    const cleanName = name.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim().replace(/[\s\-\(\)]/g, '') : '';

    return (
      customers.find((c) => {
        if (cleanPhone && cleanPhone.length >= 6 && c.phone) {
          const cPhone = c.phone.trim().replace(/[\s\-\(\)]/g, '');
          if (cPhone === cleanPhone || cPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cPhone)) {
            return true;
          }
        }
        if (cleanName && c.name.trim().toLowerCase() === cleanName) {
          return true;
        }
        return false;
      }) || null
    );
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

  const handoverDriverCash = (driverId: string, targetAccountId: string, amount?: number) => {
    const driver = drivers.find((d) => d.id === driverId);
    const amountToHandover = amount !== undefined ? amount : (driver ? driver.cashHeld : 0);
    driverCashHandover(driverId, amountToHandover, targetAccountId);
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

  // Supplier Management
  const checkDuplicateSupplier = (name: string, phone?: string, company?: string): Supplier | null => {
    const cleanName = name.trim().toLowerCase();
    const cleanPhone = phone?.trim().replace(/[\s\-\(\)]/g, '');
    const cleanCompany = company?.trim().toLowerCase();

    return (
      suppliers.find((s) => {
        if (s.status === 'archived') return false;
        if (s.name.trim().toLowerCase() === cleanName) return true;
        if (cleanPhone && s.phone && s.phone.trim().replace(/[\s\-\(\)]/g, '') === cleanPhone) return true;
        if (cleanCompany && s.company && s.company.trim().toLowerCase() === cleanCompany) return true;
        return false;
      }) || null
    );
  };

  const addSupplier = (supData: Omit<Supplier, 'id' | 'balance' | 'totalPurchases' | 'totalPaid' | 'createdAt'>): Supplier => {
    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0];
    const id = `sup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newSupplier: Supplier = {
      ...supData,
      id,
      balance: 0,
      totalPurchases: 0,
      totalPaid: 0,
      status: supData.status || 'active',
      createdAt: dateOnly,
      updatedAt: now,
    };

    setSuppliers((prev) => [newSupplier, ...prev]);
    addAuditLog('CREATE_SUPPLIER', newSupplier.name, `Created supplier ${newSupplier.name} (${newSupplier.phone})`);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const now = new Date().toISOString();
    setSuppliers((prev) =>
      prev.map((sup) => (sup.id === id ? { ...sup, ...updates, updatedAt: now } : sup))
    );
    addAuditLog('UPDATE_SUPPLIER', id, 'Updated supplier attributes');
  };

  const deleteSupplier = (id: string): { success: boolean; message: string; archived?: boolean } => {
    const target = suppliers.find((s) => s.id === id);
    if (!target) return { success: false, message: 'Supplier not found.' };

    const hasPurchases = purchases.some((p) => p.supplierId === id);
    const hasPayments = supplierPayments.some((sp) => sp.supplierId === id);

    if (hasPurchases || hasPayments || target.balance > 0) {
      updateSupplier(id, { status: 'archived' });
      addAuditLog('ARCHIVE_SUPPLIER', target.name, 'Safely archived supplier due to transaction ledger records');
      return {
        success: true,
        archived: true,
        message: `Supplier "${target.name}" has purchase history or an outstanding balance ($${target.balance.toFixed(2)}). To preserve accounting records, the supplier has been safely ARCHIVED.`,
      };
    }

    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('DELETE_SUPPLIER', target.name, `Permanently deleted supplier ${target.name}`);
    return { success: true, archived: false, message: `Supplier "${target.name}" deleted.` };
  };

  const archiveSupplier = (id: string) => {
    updateSupplier(id, { status: 'archived' });
  };

  const recordSupplierPayment = (paymentData: Omit<SupplierPayment, 'id' | 'createdAt'>): SupplierPayment => {
    const now = new Date().toISOString();
    const id = `sp-${Date.now()}`;
    const newPayment: SupplierPayment = {
      ...paymentData,
      id,
      createdAt: now,
    };

    setSupplierPayments((prev) => [newPayment, ...prev]);

    // Deduct from paying account
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === paymentData.accountId ? { ...acc, balance: acc.balance - paymentData.amount } : acc
      )
    );

    // Reduce supplier balance
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === paymentData.supplierId) {
          return {
            ...sup,
            balance: Math.max(0, sup.balance - paymentData.amount),
            totalPaid: sup.totalPaid + paymentData.amount,
            updatedAt: now,
          };
        }
        return sup;
      })
    );

    addAuditLog(
      'RECORD_SUPPLIER_PAYMENT',
      newPayment.paymentNo,
      `Paid $${paymentData.amount.toFixed(2)} to ${paymentData.supplierName} from ${paymentData.accountName}`
    );

    return newPayment;
  };

  const getSupplierStatement = (supplierId: string): SupplierStatementEntry[] => {
    const supPurchases = purchases.filter((p) => p.supplierId === supplierId && p.status !== 'Cancelled');
    const supPayments = supplierPayments.filter((sp) => sp.supplierId === supplierId);

    const rawEntries: {
      id: string;
      date: string;
      type: 'purchase' | 'payment' | 'adjustment' | 'reversal';
      referenceNo: string;
      description: string;
      debit: number;
      credit: number;
      paymentMethod?: string;
      accountName?: string;
      actor: string;
      notes?: string;
    }[] = [];

    supPurchases.forEach((p) => {
      rawEntries.push({
        id: p.id,
        date: p.date,
        type: 'purchase',
        referenceNo: p.purchaseNo,
        description: `Purchase Order ${p.purchaseNo} (${p.items.reduce((s, it) => s + it.quantity, 0)} units)`,
        debit: p.totalAmount,
        credit: 0,
        paymentMethod: p.paymentMethod,
        accountName: p.accountName,
        actor: p.actor || 'Admin',
        notes: p.notes,
      });
    });

    supPayments.forEach((sp) => {
      rawEntries.push({
        id: sp.id,
        date: sp.date,
        type: 'payment',
        referenceNo: sp.paymentNo,
        description: `Supplier Payment ${sp.paymentNo}${sp.purchaseNo ? ` (Ref: ${sp.purchaseNo})` : ''}`,
        debit: 0,
        credit: sp.amount,
        paymentMethod: sp.paymentMethod,
        accountName: sp.accountName,
        actor: sp.actor || 'Admin',
        notes: sp.notes,
      });
    });

    // Chronological order
    rawEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = 0;
    return rawEntries.map((e) => {
      running = running + e.debit - e.credit;
      return {
        ...e,
        runningBalance: running,
      };
    });
  };

  // Purchase Engine - Database-authoritative sequential ID, atomic stock, cost layer, supplier & accounts integration
  const createPurchase = (purchaseData: Omit<Purchase, 'id' | 'purchaseNo' | 'createdAt'> & { purchaseNo?: string }): Purchase => {
    // 1. Generate sequential collision-safe Purchase ID: PU00001, PU00002...
    let purchaseNo = purchaseData.purchaseNo;
    if (!purchaseNo) {
      let maxNum = 0;
      purchases.forEach((p) => {
        const match = p.purchaseNo?.match(/^PU(\d+)$/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (n > maxNum) maxNum = n;
        }
      });
      purchaseNo = `PU${String(maxNum + 1).padStart(5, '0')}`;
    }

    const now = new Date().toISOString();
    const dateOnly = purchaseData.date || now.split('T')[0];
    const timeOnly = purchaseData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = `pu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const subtotal = purchaseData.subtotal ?? purchaseData.items.reduce((s, it) => s + it.total, 0);
    const discount = purchaseData.discount || 0;
    const totalAmount = purchaseData.totalAmount ?? (subtotal - discount);
    const paidAmount = purchaseData.paidAmount || 0;
    const supplierBalance = Math.max(0, totalAmount - paidAmount);

    let paymentStatus: Purchase['paymentStatus'] = purchaseData.paymentStatus;
    if (!paymentStatus) {
      if (paidAmount >= totalAmount && totalAmount > 0) {
        paymentStatus = 'full_paid';
      } else if (paidAmount > 0) {
        paymentStatus = 'partial_payment';
      } else {
        paymentStatus = 'credit';
      }
    }

    const newPurchase: Purchase = {
      ...purchaseData,
      id,
      purchaseNo,
      date: dateOnly,
      time: timeOnly,
      subtotal,
      discount,
      totalAmount,
      paidAmount,
      supplierBalance,
      paymentStatus,
      status: purchaseData.status || 'Received',
      actor: currentUser.name || 'Admin',
      createdAt: now,
      updatedAt: now,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // 2. Atomic restock & cost layers on each product if status is 'Received'
    if (newPurchase.status === 'Received') {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = newPurchase.items.find((it) => it.productId === prod.id);
          if (!item) return prod;

          const oldStock = prod.stock;
          const newStock = oldStock + item.quantity;
          const oldCost = prod.costPrice;
          const newCost = item.costPrice;
          const newSelling = item.sellingPrice && item.sellingPrice > 0 ? item.sellingPrice : prod.sellingPrice;

          // Weighted average cost formula: ((oldStock * oldCost) + (itemQty * itemCost)) / newStock
          const totalVal = oldStock * oldCost + item.quantity * newCost;
          const weightedCost = newStock > 0 ? parseFloat((totalVal / newStock).toFixed(2)) : newCost;

          const newLayer: CostLayer = {
            id: `layer-${Date.now()}-${item.productId}`,
            date: dateOnly,
            quantity: item.quantity,
            remainingQuantity: item.quantity,
            costPrice: newCost,
            sellingPrice: newSelling,
            source: 'purchase',
            referenceNo: purchaseNo,
            notes: `PO #${purchaseNo} - Supplier: ${newPurchase.supplierName}`,
          };

          const costLayers = [newLayer, ...(prod.costLayers || [])];

          const priceHistory = [...(prod.priceHistory || [])];
          if (newCost !== oldCost || newSelling !== prod.sellingPrice) {
            priceHistory.unshift({
              id: `ph-${Date.now()}-${item.productId}`,
              date: dateOnly,
              oldCost,
              newCost,
              oldSelling: prod.sellingPrice,
              newSelling,
              actor: currentUser.name || 'Admin',
              reason: `Purchase PO #${purchaseNo}`,
            });
          }

          const history = [...(prod.history || [])];
          history.unshift({
            id: `he-${Date.now()}-${item.productId}`,
            timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            actor: currentUser.name || 'Admin',
            action: 'PURCHASE_RECEIPT',
            oldValue: `${oldStock} ${prod.unit} @ $${oldCost.toFixed(2)}`,
            newValue: `${newStock} ${prod.unit} (Weighted Avg $${weightedCost.toFixed(2)})`,
            details: `Received +${item.quantity} ${prod.unit} at $${newCost.toFixed(2)} cost from ${newPurchase.supplierName}. PO: ${purchaseNo}`,
          });

          return {
            ...prod,
            stock: newStock,
            costPrice: weightedCost,
            sellingPrice: newSelling,
            costLayers,
            priceHistory,
            history,
            updatedAt: now,
          };
        })
      );

      // 3. Record canonical inventory movements
      const purchaseMovements: InventoryMovement[] = newPurchase.items.map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const stockAfter = (prod ? prod.stock : 0) + item.quantity;
        return {
          id: `mov-${Date.now()}-${item.productId}`,
          date: dateOnly,
          productId: item.productId,
          productName: item.productName,
          type: 'purchase',
          quantityChange: item.quantity,
          stockAfter,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice || prod?.sellingPrice || 0,
          unit: item.unit || prod?.unit || 'PCS',
          referenceNo: purchaseNo,
          reason: `Purchase Inflow PO #${purchaseNo} (${newPurchase.supplierName})`,
          actor: currentUser.name || 'Admin',
        };
      });
      setInventoryMovements((prev) => [...purchaseMovements, ...prev]);
    }

    // 4. Update supplier balance and totals
    if (newPurchase.supplierId) {
      setSuppliers((prev) =>
        prev.map((sup) => {
          if (sup.id === newPurchase.supplierId) {
            return {
              ...sup,
              balance: sup.balance + newPurchase.supplierBalance,
              totalPurchases: sup.totalPurchases + newPurchase.totalAmount,
              totalPaid: sup.totalPaid + newPurchase.paidAmount,
              updatedAt: now,
            };
          }
          return sup;
        })
      );
    }

    // 5. Deduct payment from payment account and create SupplierPayment
    if (newPurchase.accountId && newPurchase.paidAmount > 0) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === newPurchase.accountId
            ? { ...acc, balance: acc.balance - newPurchase.paidAmount }
            : acc
        )
      );

      const newSupPay: SupplierPayment = {
        id: `sp-${Date.now()}`,
        paymentNo: `PAY-SP-${supplierPayments.length + 1001}`,
        supplierId: newPurchase.supplierId,
        supplierName: newPurchase.supplierName,
        purchaseId: id,
        purchaseNo,
        date: dateOnly,
        time: timeOnly,
        amount: newPurchase.paidAmount,
        paymentMethod: newPurchase.paymentMethod || 'Cash',
        accountId: newPurchase.accountId,
        accountName: newPurchase.accountName || 'Cash Safe',
        referenceNo: purchaseNo,
        notes: `Initial payment for Purchase Order ${purchaseNo}`,
        actor: currentUser.name || 'Admin',
        createdAt: now,
      };
      setSupplierPayments((prev) => [newSupPay, ...prev]);
    }

    addAuditLog(
      'CREATE_PURCHASE',
      purchaseNo,
      `PO #${purchaseNo} recorded for ${newPurchase.supplierName} - Total: $${newPurchase.totalAmount.toFixed(2)} (Paid: $${newPurchase.paidAmount.toFixed(2)}, Due: $${newPurchase.supplierBalance.toFixed(2)})`
    );

    return newPurchase;
  };

  const cancelPurchase = (purchaseId: string, reason = 'Operator cancellation'): { success: boolean; message: string } => {
    const target = purchases.find((p) => p.id === purchaseId);
    if (!target) return { success: false, message: 'Purchase order not found.' };
    if (target.status === 'Cancelled') return { success: false, message: 'Purchase is already cancelled.' };

    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0];

    // 1. Reverse stock on products if it was received
    if (target.status === 'Received') {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = target.items.find((it) => it.productId === prod.id);
          if (!item) return prod;
          const newStock = Math.max(0, prod.stock - item.quantity);
          return {
            ...prod,
            stock: newStock,
            updatedAt: now,
          };
        })
      );

      // Reversal inventory movements
      const revMovements: InventoryMovement[] = target.items.map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const stockAfter = Math.max(0, (prod ? prod.stock : 0) - item.quantity);
        return {
          id: `mov-${Date.now()}-${item.productId}-rev`,
          date: dateOnly,
          productId: item.productId,
          productName: item.productName,
          type: 'adjustment',
          quantityChange: -item.quantity,
          stockAfter,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice || prod?.sellingPrice || 0,
          unit: item.unit || 'PCS',
          referenceNo: target.purchaseNo,
          reason: `Reversal of Cancelled Purchase PO #${target.purchaseNo} (${reason})`,
          actor: currentUser.name || 'Admin',
        };
      });
      setInventoryMovements((prev) => [...revMovements, ...prev]);
    }

    // 2. Reverse supplier balance
    if (target.supplierId) {
      setSuppliers((prev) =>
        prev.map((sup) => {
          if (sup.id === target.supplierId) {
            return {
              ...sup,
              balance: Math.max(0, sup.balance - target.supplierBalance),
              totalPurchases: Math.max(0, sup.totalPurchases - target.totalAmount),
              totalPaid: Math.max(0, sup.totalPaid - target.paidAmount),
              updatedAt: now,
            };
          }
          return sup;
        })
      );
    }

    // 3. Refund payment account if amount was paid
    if (target.accountId && target.paidAmount > 0) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === target.accountId ? { ...acc, balance: acc.balance + target.paidAmount } : acc
        )
      );
    }

    // 4. Update status
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              status: 'Cancelled',
              notes: (p.notes ? p.notes + ' | ' : '') + `Cancelled: ${reason}`,
              updatedAt: now,
            }
          : p
      )
    );

    addAuditLog('CANCEL_PURCHASE', target.purchaseNo, `Cancelled PO #${target.purchaseNo}. Reversal completed.`);
    return { success: true, message: `Purchase ${target.purchaseNo} successfully cancelled and reversed.` };
  };

  const addPurchase = (purchase: any) => {
    createPurchase(purchase);
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
    localStorage.removeItem('benadir_suppliers');
    localStorage.removeItem('benadir_supplier_payments');
    localStorage.removeItem('benadir_purchases');

    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setSupplierPayments(INITIAL_SUPPLIER_PAYMENTS);
    setPurchases(INITIAL_PURCHASES);
    setSales(INITIAL_SALES);
    setReturns([]);
    setDrivers(INITIAL_DRIVERS);
    setDeliveries(INITIAL_DELIVERIES);
    setAccounts(INITIAL_ACCOUNTS);
    setTransfers([]);
    setExpenses(INITIAL_EXPENSES);
    setIncomes(INITIAL_INCOMES);
    setCargoShipments(INITIAL_CARGO);
    setSettings(INITIAL_SETTINGS);
  };

  const exportDatabaseJson = () => {
    return JSON.stringify(
      {
        products,
        customers,
        suppliers,
        supplierPayments,
        purchases,
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
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.supplierPayments) setSupplierPayments(data.supplierPayments);
      if (data.purchases) setPurchases(data.purchases);
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
        categories,
        brands,
        units,
        inventoryMovements,
        customers,
        suppliers,
        supplierPayments,
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
        updateOrder,
        updateOrderStatus,
        convertOrderToSale,
        recordOrderPayment,
        verifyOrderPayment,
        cancelOrder,
        getOrderByPortalToken,
        generateCustomerPortalUrl,
        processReturn,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addStockToProduct,
        archiveProduct,
        reactivateProduct,
        checkDuplicateProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        addUnit,
        addCustomer,
        updateCustomer,
        checkDuplicateCustomer,
        receiveCustomerPayment,
        addDriver,
        updateDriver,
        driverCashHandover,
        handoverDriverCash,
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
        addSupplier,
        updateSupplier,
        deleteSupplier,
        archiveSupplier,
        checkDuplicateSupplier,
        recordSupplierPayment,
        getSupplierStatement,
        createPurchase,
        cancelPurchase,
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
