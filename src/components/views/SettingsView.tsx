import React, { useState } from 'react';
import {
  Settings,
  Store,
  DollarSign,
  Shield,
  RotateCcw,
  CheckCircle2,
  Users,
  Database,
  Building2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, currentUser, resetToDemoData } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail);
  const [currency, setCurrency] = useState(settings.currency);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      currency,
      receiptFooter,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (
      confirm(
        'Are you sure you want to reset all data back to the clean Benadir Store commercial master state?'
      )
    ) {
      resetToDemoData();
      alert('Data reloaded successfully.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Settings & Commercial Store Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Store branding, currency configuration, receipt details, and database maintenance.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings saved successfully.
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
          <Store className="w-4 h-4 text-slate-600" />
          Store Identity & Receipt Header
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Store Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="SOS">SOS (Sh.So) - Somali Shilling</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Email
            </label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Store Physical Location
          </label>
          <input
            type="text"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Receipt Footer Note
          </label>
          <textarea
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* User Session Profile & Role */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-600" />
          Active User Session
        </h3>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
              <div className="text-slate-400">{currentUser.email}</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold uppercase text-[10px]">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Reset System Data */}
      <div className="bg-white rounded-2xl border border-rose-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-rose-900 text-base border-b border-rose-100 pb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-600" />
          Commercial Reset & Database Seed
        </h3>

        <p className="text-xs text-slate-600">
          Reload clean master catalogue, initial cash accounts, product inventory, and customer debt ledger.
        </p>

        <button
          type="button"
          onClick={handleResetData}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data to Factory Commercial State
        </button>
      </div>
    </div>
  );
};
