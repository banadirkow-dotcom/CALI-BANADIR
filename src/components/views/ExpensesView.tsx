import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  Calendar,
  Wallet,
  Trash2,
  Tag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Expense } from '../../types';
import { StatCard } from '../common/StatCard';

interface ExpensesViewProps {
  onOpenNewExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenNewExpense }) => {
  const { expenses, deleteExpense } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(expenses.map((e) => e.category)))];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.paidFromAccountName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'All' || e.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Expenses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Operating overheads, logistics, fuel, store rent and salaries ledger.
          </p>
        </div>

        <button
          onClick={onOpenNewExpense}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 text-lime-400 stroke-[3]" />
          Record Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Expenses"
          value={`$${totalExpenseAmount.toFixed(2)}`}
          subtitle={`${expenses.length} operating bills paid`}
          icon={TrendingDown}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          highlight
        />

        <StatCard
          title="Logistics & Fuel"
          value={`$${expenses
            .filter((e) => e.category === 'Logistics')
            .reduce((s, e) => s + e.amount, 0)
            .toFixed(2)}`}
          subtitle="Transport & fleet energy"
          icon={DollarSign}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="Utilities & Power"
          value={`$${expenses
            .filter((e) => e.category === 'Utilities')
            .reduce((s, e) => s + e.amount, 0)
            .toFixed(2)}`}
          subtitle="Electricity & generator fuel"
          icon={Tag}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Salaries & Labor"
          value={`$${expenses
            .filter((e) => e.category === 'Salaries')
            .reduce((s, e) => s + e.amount, 0)
            .toFixed(2)}`}
          subtitle="Store staff compensation"
          icon={Wallet}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
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
            placeholder="Search description, account..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
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
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4">Paid From Account</th>
                <th className="py-3 px-3 text-right">Amount ($)</th>
                <th className="py-3 px-3">Recorded By</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No expenses recorded.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{e.title}</div>
                      {e.notes && <div className="text-[10px] text-slate-400 font-normal">{e.notes}</div>}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {e.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{e.date}</td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {e.paidFromAccountName}
                    </td>

                    <td className="py-3 px-3 text-right font-black text-rose-600">
                      -${e.amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-slate-500">{e.recordedBy}</td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${e.title}"?`)) {
                            deleteExpense(e.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
