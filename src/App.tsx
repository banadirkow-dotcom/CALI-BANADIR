import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Sidebar, NavSection } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { SalesView } from './components/views/SalesView';
import { PosView } from './components/views/PosView';
import { ProductsView } from './components/views/ProductsView';
import { InventoryView } from './components/views/InventoryView';
import { PurchasesView } from './components/views/PurchasesView';
import { ExpensesView } from './components/views/ExpensesView';
import { IncomeView } from './components/views/IncomeView';
import { AccountsView } from './components/views/AccountsView';
import { CustomersView } from './components/views/CustomersView';
import { CargoView } from './components/views/CargoView';
import { DriversView } from './components/views/DriversView';
import { TargetsView } from './components/views/TargetsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

import { NewSaleModal } from './components/views/NewSaleModal';
import { NewExpenseModal } from './components/views/NewExpenseModal';
import { NewIncomeModal } from './components/views/NewIncomeModal';
import { NewCustomerModal } from './components/views/NewCustomerModal';
import { NewProductModal } from './components/views/NewProductModal';
import { NewDriverModal } from './components/views/NewDriverModal';
import { ReceivePaymentModal } from './components/views/ReceivePaymentModal';
import { AccountTransferModal } from './components/views/AccountTransferModal';
import { SalesReturnModal } from './components/views/SalesReturnModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { Sale, Customer, Product } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavSection>('dashboard');

  // Modals state
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isNewIncomeOpen, setIsNewIncomeOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isNewDriverOpen, setIsNewDriverOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Contextual modals
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [activeReturnSale, setActiveReturnSale] = useState<Sale | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState(false);

  // Quick sale pre-fill product
  const [prefilledProduct, setPrefilledProduct] = useState<Product | null>(null);

  const handleOpenReceivePayment = (customer?: Customer | null) => {
    setPaymentCustomer(customer || null);
    setIsReceivePaymentOpen(true);
  };

  const handleOpenReturn = (sale: Sale) => {
    setActiveReturnSale(sale);
  };

  const handleViewReceipt = (sale: Sale) => {
    setActiveReceiptSale(sale);
  };

  const handleSaleCompleted = (sale: Sale) => {
    setActiveReceiptSale(sale);
  };

  const handleQuickSellProduct = (product: Product) => {
    setPrefilledProduct(product);
    setActiveTab('pos');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-hidden selection:bg-[#bef264] selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeTab}
        onSelectSection={setActiveTab}
        onOpenNewSale={() => setIsNewSaleOpen(true)}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenNewSale={() => setIsNewSaleOpen(true)}
          onOpenNewExpense={() => setIsNewExpenseOpen(true)}
          onOpenNewIncome={() => setIsNewIncomeOpen(true)}
          onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
          onOpenNewProduct={() => setIsNewProductOpen(true)}
          onOpenNewDriver={() => setIsNewDriverOpen(true)}
          onOpenTransfer={() => setIsTransferOpen(true)}
          onOpenReceivePayment={() => handleOpenReceivePayment(null)}
          onNavigate={(tab) => setActiveTab(tab as NavSection)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto pb-16">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenNewSale={() => setIsNewSaleOpen(true)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onOpenNewIncome={() => setIsNewIncomeOpen(true)}
              onOpenReceivePayment={() => handleOpenReceivePayment(null)}
              onOpenNewDelivery={() => setIsNewDriverOpen(true)}
              onOpenNewAccount={() => setIsTransferOpen(true)}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              onOpenNewSale={() => setIsNewSaleOpen(true)}
              onViewReceipt={handleViewReceipt}
              onOpenReturn={handleOpenReturn}
              onReceivePayment={(sale) => {
                const dummyCust: Customer = {
                  id: sale.customerId,
                  name: sale.customerName,
                  phone: sale.customerPhone || '',
                  balance: sale.remainingBalance,
                  creditLimit: 1000,
                  totalPurchases: sale.grandTotal,
                  status: 'active',
                };
                handleOpenReceivePayment(dummyCust);
              }}
            />
          )}

          {activeTab === 'pos' && (
            <PosView onSaleComplete={handleSaleCompleted} />
          )}

          {activeTab === 'products' && (
            <ProductsView
              onOpenNewProduct={() => setIsNewProductOpen(true)}
              onQuickSell={handleQuickSellProduct}
            />
          )}

          {activeTab === 'inventory' && <InventoryView />}

          {activeTab === 'purchases' && <PurchasesView />}

          {activeTab === 'expenses' && (
            <ExpensesView onOpenNewExpense={() => setIsNewExpenseOpen(true)} />
          )}

          {activeTab === 'income' && (
            <IncomeView onOpenNewIncome={() => setIsNewIncomeOpen(true)} />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              onOpenTransfer={() => setIsTransferOpen(true)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onOpenNewIncome={() => setIsNewIncomeOpen(true)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
              onReceivePayment={handleOpenReceivePayment}
            />
          )}

          {activeTab === 'cargo' && <CargoView />}

          {activeTab === 'drivers' && (
            <DriversView onOpenNewDriver={() => setIsNewDriverOpen(true)} />
          )}

          {activeTab === 'targets' && <TargetsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onSaleSuccess={(sale: Sale) => {
          setActiveReceiptSale(sale);
        }}
      />

      <NewExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
      />

      <NewIncomeModal
        isOpen={isNewIncomeOpen}
        onClose={() => setIsNewIncomeOpen(false)}
      />

      <NewCustomerModal
        isOpen={isNewCustomerOpen}
        onClose={() => setIsNewCustomerOpen(false)}
      />

      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
      />

      <NewDriverModal
        isOpen={isNewDriverOpen}
        onClose={() => setIsNewDriverOpen(false)}
      />

      <AccountTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      <ReceivePaymentModal
        isOpen={isReceivePaymentOpen}
        onClose={() => {
          setIsReceivePaymentOpen(false);
          setPaymentCustomer(null);
        }}
        customer={paymentCustomer}
      />

      <SalesReturnModal
        isOpen={!!activeReturnSale}
        onClose={() => setActiveReturnSale(null)}
        sale={activeReturnSale}
      />

      <ReceiptModal
        isOpen={!!activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
        sale={activeReceiptSale}
      />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}

export default App;
