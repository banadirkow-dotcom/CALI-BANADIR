import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  Plus,
  Search,
  Package,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Purchase } from '../../types';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';

export const PurchasesView: React.FC = () => {
  const { purchases, addPurchase, products, accounts, currentUser } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form
  const [supplierName, setSupplierName] = useState('');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState('20');
  const [unitCost, setUnitCost] = useState('10.00');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  const filteredPurchases = purchases.filter(
    (p) =>
      p.purchaseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    const prod = products.find((p) => p.id === productId);
    const acc = accounts.find((a) => a.id === accountId);
    if (!prod || !acc) return;

    const qty = parseInt(quantity, 10) || 1;
    const cost = parseFloat(unitCost) || prod.costPrice;
    const total = qty * cost;

    addPurchase({
      purchaseNo: `PO-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      supplierName: supplierName.trim(),
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unitCost: cost,
          total,
        },
      ],
      totalAmount: total,
      paidAmount: total,
      paymentMethod: 'Cash',
      accountId: acc.id,
      accountName: acc.name,
      status: 'Received',
    });

    setIsNewModalOpen(false);
    setSupplierName('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Purchases & Supplier Inflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Record supplier orders and restock product inventory automatically.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 text-lime-400 stroke-[3]" />
          New Purchase
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Purchase Spend"
          value={`$${totalPurchasesAmount.toFixed(2)}`}
          subtitle={`${purchases.length} supplier orders`}
          icon={DollarSign}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Received & In Stock"
          value={purchases.filter((p) => p.status === 'Received').length}
          subtitle="Inventory added"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Active Suppliers"
          value={Array.from(new Set(purchases.map((p) => p.supplierName))).length}
          subtitle="Wholesale vendors"
          icon={Building2}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Average Order Value"
          value={`$${purchases.length > 0 ? (totalPurchasesAmount / purchases.length).toFixed(2) : '0.00'}`}
          subtitle="Cost per restocking"
          icon={Package}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO number or supplier name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-3">Items Count</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3">Paid From Account</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {p.purchaseNo}
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{p.date}</td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.supplierName}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-600">
                      {p.items.reduce((s, it) => s + it.quantity, 0)} units
                    </td>

                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      ${p.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {p.accountName || 'Cash Safe'}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Record Supplier Purchase Order"
        subtitle="Restocks inventory and records outflow from bank or cash account."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="form-new-purchase"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
            >
              Receive & Restock
            </button>
          </>
        }
      >
        <form id="form-new-purchase" onSubmit={handleCreatePurchase} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Supplier / Vendor Name *
            </label>
            <input
              type="text"
              required
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. Al-Baraka Import Co."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Product To Restock *
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const p = products.find((x) => x.id === e.target.value);
                if (p) setUnitCost(p.costPrice.toString());
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Pay From Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${acc.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Total Purchase Cost:</span>
            <span className="font-black text-slate-900 text-sm">
              ${((parseInt(quantity, 10) || 0) * (parseFloat(unitCost) || 0)).toFixed(2)}
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
};
