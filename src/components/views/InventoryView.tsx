import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowUpDown,
  Search,
  CheckCircle2,
  TrendingUp,
  Layers,
  Archive,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StatCard } from '../common/StatCard';

export const InventoryView: React.FC = () => {
  const { products, adjustStock } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');

  const filteredProducts = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const isLow = p.stock > 0 && p.stock <= p.minStockLevel;
    const isOut = p.stock === 0;

    const matchFilter =
      filterType === 'all' ? true : filterType === 'low' ? isLow : isOut;

    return matchQuery && matchFilter;
  });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockLevel).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalStockUnits = products.reduce((s, p) => s + p.stock, 0);
  const totalStockValuation = products.reduce((s, p) => s + p.sellingPrice * p.stock, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Inventory & Stock Valuation
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Monitor on-hand counts, reorder thresholds, and prevent stock-outs across warehouse shelves.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Physical Units"
          value={totalStockUnits}
          subtitle={`${products.length} distinct SKUs`}
          icon={Package}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Stock Valuation"
          value={`$${totalStockValuation.toFixed(2)}`}
          subtitle="At retail market price"
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          highlight
        />

        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          subtitle="Under minimum threshold"
          icon={AlertTriangle}
          iconBg={lowStockCount > 0 ? 'bg-amber-50' : 'bg-slate-100'}
          iconColor={lowStockCount > 0 ? 'text-amber-600' : 'text-slate-500'}
        />

        <StatCard
          title="Out of Stock"
          value={outOfStockCount}
          subtitle="Zero units on shelf"
          icon={Archive}
          iconBg={outOfStockCount > 0 ? 'bg-rose-50' : 'bg-slate-100'}
          iconColor={outOfStockCount > 0 ? 'text-rose-600' : 'text-slate-500'}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, product name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-xl font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-2 rounded-xl font-semibold transition-all ${
              filterType === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-2 rounded-xl font-semibold transition-all ${
              filterType === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Code / SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Cost</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-center">Available Stock</th>
                <th className="py-3 px-3 text-center">Min Threshold</th>
                <th className="py-3 px-3 text-right">Stock Valuation</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map((p) => {
                const isLow = p.stock > 0 && p.stock <= p.minStockLevel;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {p.code}
                      <div className="text-[10px] text-slate-400 font-normal">{p.sku}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.name}
                    </td>

                    <td className="py-3 px-3 text-slate-600">{p.category}</td>

                    <td className="py-3 px-3 text-right text-slate-500 font-mono">
                      ${p.costPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                      ${p.sellingPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-center font-black font-mono text-sm">
                      {p.stock} <span className="text-[10px] font-normal text-slate-400">{p.unit}</span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {p.minStockLevel}
                    </td>

                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      ${(p.sellingPrice * p.stock).toFixed(2)}
                    </td>

                    <td className="py-3 px-3">
                      {isOut ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Out of stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Reorder Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Adequate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
