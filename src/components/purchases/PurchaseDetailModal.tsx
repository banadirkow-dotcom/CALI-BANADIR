import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  Clock,
  Building2,
  Package,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  User,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Purchase } from '../../types';
import { useStore } from '../../context/StoreContext';

interface PurchaseDetailModalProps {
  purchase: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

export const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
  purchase,
  isOpen,
  onClose,
  onCancelled,
}) => {
  const { cancelPurchase, settings } = useStore();
  const [isConfirmCancel, setIsConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('Damaged goods / Order rejected at dock');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [message, setMessage] = useState('');

  if (!purchase) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmCancel = () => {
    setIsSubmittingCancel(true);
    const res = cancelPurchase(purchase.id, cancelReason);
    setIsSubmittingCancel(false);
    if (res.success) {
      setMessage(res.message);
      setTimeout(() => {
        setIsConfirmCancel(false);
        if (onCancelled) onCancelled();
        onClose();
      }, 1200);
    } else {
      setMessage(res.message);
    }
  };

  const totalQuantity = purchase.items.reduce((s, it) => s + it.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase Order ${purchase.purchaseNo}`}
      subtitle={`Vendor: ${purchase.supplierName} • Created ${purchase.date}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 print:m-0 print:p-0">
        {/* Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              PO Status:
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black ${
                purchase.status === 'Received'
                  ? 'bg-emerald-100 text-emerald-800'
                  : purchase.status === 'Cancelled'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {purchase.status === 'Received' ? (
                <CheckCircle2 className="w-3 h-3 mr-1 inline" />
              ) : purchase.status === 'Cancelled' ? (
                <XCircle className="w-3 h-3 mr-1 inline" />
              ) : null}
              {purchase.status}
            </span>

            <span className="text-slate-300">|</span>

            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              Payment:
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                purchase.paymentStatus === 'full_paid'
                  ? 'bg-blue-100 text-blue-800'
                  : purchase.paymentStatus === 'partial_payment'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {purchase.paymentStatus === 'full_paid'
                ? 'Full Paid'
                : purchase.paymentStatus === 'partial_payment'
                ? 'Partial Payment'
                : 'Supplier Credit (A/P)'}
            </span>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
          </div>
        </div>

        {/* Invoice Metadata Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Supplier / Vendor
            </h4>
            <p className="font-black text-slate-900 text-sm">{purchase.supplierName}</p>
            {purchase.supplierPhone && (
              <p className="text-slate-600 font-medium">{purchase.supplierPhone}</p>
            )}
            {purchase.supplierId && (
              <p className="text-[10px] text-slate-400 font-mono">ID: {purchase.supplierId}</p>
            )}
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Receipt & Settlement
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-semibold text-slate-800">
                {purchase.date} {purchase.time || ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid Account:</span>
              <span className="font-semibold text-slate-800">
                {purchase.accountName || 'Commercial Account'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Recorded By:</span>
              <span className="font-semibold text-slate-800">{purchase.actor || 'Admin'}</span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-center">Unit</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {purchase.items.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <div>{it.productName}</div>
                    {it.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500 uppercase font-mono text-[11px]">
                    {it.unit || 'PCS'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {it.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                    ${it.costPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    ${(it.sellingPrice || 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ${it.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Breakdown */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal ({totalQuantity} units):</span>
            <span className="font-bold text-slate-800">${(purchase.subtotal || purchase.totalAmount).toFixed(2)}</span>
          </div>

          {(purchase.discount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Supplier Discount:</span>
              <span>-${(purchase.discount || 0).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Purchase Amount:</span>
            <span>${purchase.totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-100">
            <span>Paid Outflow ({purchase.paymentMethod || 'Cash'}):</span>
            <span className="font-bold text-emerald-600">${purchase.paidAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-700">
            <span>Outstanding Due to Supplier:</span>
            <span
              className={`font-black ${
                (purchase.supplierBalance || 0) > 0 ? 'text-amber-600' : 'text-slate-500'
              }`}
            >
              ${(purchase.supplierBalance || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {purchase.notes && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider mb-1">
              Internal Notes / Logistics Reference
            </span>
            <p className="text-slate-700">{purchase.notes}</p>
          </div>
        )}

        {/* Cancellation & Reversal Section */}
        {purchase.status !== 'Cancelled' && (
          <div className="pt-2 border-t border-slate-200 print:hidden">
            {!isConfirmCancel ? (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Need to void or reverse this purchase order?
                </span>
                <button
                  type="button"
                  onClick={() => setIsConfirmCancel(true)}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Cancel & Reverse Purchase
                </button>
              </div>
            ) : (
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-rose-900">
                      Confirm Purchase Cancellation & Stock Reversal
                    </h5>
                    <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                      This will reverse stock levels for all {purchase.items.length} items, log an inventory
                      reversal movement, reverse the supplier balance, and refund ${purchase.paidAmount.toFixed(2)}{' '}
                      to {purchase.accountName || 'commercial account'}.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">
                    Reason for Cancellation
                  </label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                {message && (
                  <p className="text-xs font-bold text-rose-800">{message}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmCancel(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingCancel}
                    onClick={handleConfirmCancel}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    {isSubmittingCancel ? 'Reversing...' : 'Confirm Reversal'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
