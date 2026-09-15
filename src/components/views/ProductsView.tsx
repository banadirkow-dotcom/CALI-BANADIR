import React, { useState, useMemo } from 'react';
import {
  Package,
  DollarSign,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Filter,
  CheckCircle2,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';

interface ProductsViewProps {
  onOpenNewProduct: () => void;
  onQuickSell: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenNewProduct,
  onQuickSell,
}) => {
  const { products, deleteProduct, updateProduct, adjustStock } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [activeOnly, setActiveOnly] = useState(true);

  // Stock Adjust Modal
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const brands = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map((p) => p.brand || 'General')))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));

      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'All' || (p.brand || 'General') === selectedBrand;
      const matchActive = activeOnly ? p.isActive : true;

      return matchSearch && matchCat && matchBrand && matchActive;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, activeOnly]);

  // Aggregate stats
  const totalProducts = products.length;
  const stockValueCost = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
  const stockValueSelling = products.reduce((s, p) => s + p.sellingPrice * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockLevel).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleApplyAdjustment = () => {
    if (!adjustModalProduct) return;
    const qty = parseInt(adjustQty, 10);
    if (!qty || qty <= 0) return;
    const delta = adjustType === 'add' ? qty : -qty;
    adjustStock(adjustModalProduct.id, delta, 'Manual stock adjustment');
    setAdjustModalProduct(null);
    setAdjustQty('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Product catalogue with cost, selling price, stock levels and inventory ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-product-header"
            onClick={onOpenNewProduct}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-lime-400 stroke-[3]" />
            Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards (Screenshot 6, 10) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Products"
          value={products.filter((p) => p.isActive).length}
          subtitle={`${totalProducts} total recorded items`}
          icon={Package}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Stock Value (Cost)"
          value={`$${stockValueCost.toFixed(2)}`}
          subtitle="Inventory acquisition cost"
          icon={DollarSign}
          iconBg="bg-slate-100"
          iconColor="text-slate-700"
        />

        <StatCard
          title="Stock Value (Selling)"
          value={`$${stockValueSelling.toFixed(2)}`}
          subtitle={`Potential revenue: +$${(stockValueSelling - stockValueCost).toFixed(2)}`}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          highlight
        />

        <StatCard
          title="Low / Out of Stock"
          value={`${lowStockCount} / ${outOfStockCount}`}
          subtitle="Threshold alerts"
          icon={AlertTriangle}
          iconBg={lowStockCount > 0 ? 'bg-amber-50' : 'bg-slate-100'}
          iconColor={lowStockCount > 0 ? 'text-amber-600' : 'text-slate-500'}
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, SKU, barcode..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === 'All' ? 'All Brands' : b}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
            />
            <span>Active only</span>
          </label>
        </div>
      </div>

      {/* Products Table (Screenshot 6, 10) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Ref / Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Brand</th>
                <th className="py-3 px-3 text-right">Cost</th>
                <th className="py-3 px-3 text-right">Selling</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3">Stock Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= p.minStockLevel;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {p.code}
                        <div className="text-[10px] text-slate-400 font-normal">{p.sku}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            {p.barcode && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Barcode: {p.barcode}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600">{p.category}</td>
                      <td className="py-3 px-3 text-slate-600">{p.brand || '—'}</td>

                      <td className="py-3 px-3 text-right text-slate-600">
                        ${p.costPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        ${p.sellingPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-center font-bold font-mono">
                        {p.stock} <span className="text-[10px] font-normal text-slate-400">{p.unit}</span>
                      </td>

                      <td className="py-3 px-3">
                        {isOut ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Low stock ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            In stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onQuickSell(p)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold"
                            title="Quick Sale this item"
                          >
                            Sell
                          </button>

                          <button
                            onClick={() => {
                              setAdjustModalProduct(p);
                              setAdjustQty('10');
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="Adjust Stock Qty"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete product ${p.name}?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustModalProduct && (
        <Modal
          isOpen={!!adjustModalProduct}
          onClose={() => setAdjustModalProduct(null)}
          title={`Adjust Stock: ${adjustModalProduct.name}`}
          subtitle={`Current stock: ${adjustModalProduct.stock} ${adjustModalProduct.unit}`}
          maxWidth="sm"
          footer={
            <>
              <button
                type="button"
                onClick={() => setAdjustModalProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Update Stock
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('add')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  adjustType === 'add'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                + Add Stock (Restock)
              </button>

              <button
                type="button"
                onClick={() => setAdjustType('remove')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  adjustType === 'remove'
                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                - Reduce (Waste/Damage)
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Quantity ({adjustModalProduct.unit})
              </label>
              <input
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="Quantity to adjust..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
