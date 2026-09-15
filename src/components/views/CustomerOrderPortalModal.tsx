import React, { useState } from 'react';
import {
  X,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  Share2,
  Printer,
  DollarSign,
  Copy,
  Check,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';

interface CustomerOrderPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConvertSale?: (orderId: string) => void;
}

export const CustomerOrderPortalModal: React.FC<CustomerOrderPortalModalProps> = ({
  isOpen,
  onClose,
  order,
  onConvertSale,
}) => {
  const { settings, recordOrderPayment, updateOrderStatus } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('EVC Plus');
  const [showPayInput, setShowPayInput] = useState(false);

  if (!isOpen || !order) return null;

  const remaining = Math.max(0, order.total - order.paidAmount);

  // Status mapping to steps (1 to 5)
  const getStepIndex = (status: Order['status']): number => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'ready':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
      case 'converted':
        return 5;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const currentStep = getStepIndex(order.status);

  const steps = [
    { num: 1, label: 'Dalabka La Helay', sub: 'Order Placed', icon: Clock },
    { num: 2, label: 'Waa La Xaqiijiyay', sub: 'Confirmed', icon: CheckCircle2 },
    { num: 3, label: 'Waa Diyaar', sub: 'Packed & Ready', icon: Package },
    { num: 4, label: 'Jidka Kujira', sub: 'Out for Delivery', icon: Truck },
    { num: 5, label: 'La Gaarsiiyay', sub: 'Completed', icon: CheckCircle2 },
  ];

  const handleCopyUssd = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    recordOrderPayment(order.id, payAmount, payMethod);
    setPayAmount(0);
    setShowPayInput(false);
  };

  const evcUssd = `*770*615001234*${Math.ceil(remaining)}#`;
  const sahalUssd = `*888*615001234*${Math.ceil(remaining)}#`;
  const edahabUssd = `*789*615001234*${Math.ceil(remaining)}#`;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Salaan! Waa dalabkaaga Banadir Store:\nOrder No: ${order.orderNo}\nTotal: $${order.total.toFixed(2)}\nBixiyay: $${order.paidAmount.toFixed(2)}\nHadhaa: $${remaining.toFixed(2)}\nFadlan la socodka dalabka ama bixinta isticmaal: ${window.location.origin}`
    );
    window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with store branding */}
        <div className="bg-[#0f172a] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-lime-400 text-black">
                  Banadir Order Tracking
                </span>
                <span className="text-slate-400 text-xs font-mono">{order.orderNo}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5">{settings.storeName}</h2>
              <p className="text-slate-300 text-xs mt-0.5">
                Mogadishu, Somalia • Tel: {settings.storePhone}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Order Placed</div>
              <div className="text-sm font-semibold text-slate-200">{order.date} {order.time}</div>
              <div className="mt-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    order.status === 'delivered' || order.status === 'converted'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : order.status === 'out_for_delivery'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : order.status === 'ready'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      : order.status === 'confirmed'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : order.status === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Tracking Progress Bar */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
            <span>Dabagalka Dalabka (Order Tracking)</span>
            <span className="text-slate-400 font-normal">Fulfillment: {order.fulfillmentType}</span>
          </div>

          <div className="relative">
            <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-slate-200">
              <div
                style={{ width: `${Math.min(100, Math.max(5, (currentStep / 5) * 100))}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-lime-500 transition-all duration-500"
              />
            </div>

            <div className="grid grid-cols-5 gap-1 text-center">
              {steps.map((step) => {
                const Icon = step.icon;
                const isPassed = currentStep >= step.num;
                const isCurrent = currentStep === step.num;
                return (
                  <div key={step.num} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                        isPassed
                          ? 'bg-slate-900 text-lime-400 shadow-sm'
                          : 'bg-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-2 ring-lime-400 ring-offset-2' : ''}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className={`text-[11px] font-semibold leading-tight ${isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-slate-400 hidden sm:block">{step.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Customer & Delivery Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Macmiilka (Customer)
              </div>
              <div className="font-bold text-slate-800 text-sm">{order.customerName}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <a href={`tel:${order.customerPhone}`} className="hover:text-blue-600 hover:underline">
                  {order.customerPhone}
                </a>
              </div>
              {order.deliveryAddress && (
                <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{order.deliveryAddress}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Fulfillment Details
              </div>
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                {order.fulfillmentType === 'Delivery' && <Truck className="w-4 h-4 text-emerald-600" />}
                {order.fulfillmentType === 'Cargo' && <Building2 className="w-4 h-4 text-blue-600" />}
                {order.fulfillmentType === 'Pickup' && <Package className="w-4 h-4 text-amber-600" />}
                {order.fulfillmentType}
              </div>
              {order.driverName && (
                <div className="text-xs text-slate-600 mt-1">
                  <span className="text-slate-400">Driver:</span> {order.driverName}
                </div>
              )}
              {order.cargoCompany && (
                <div className="text-xs text-slate-600 mt-1">
                  <span className="text-slate-400">Cargo Company:</span> {order.cargoCompany}
                </div>
              )}
              {order.notes && (
                <div className="text-xs text-slate-500 italic mt-1.5 bg-white p-1.5 rounded border border-slate-200">
                  "{order.notes}"
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Waxyaabaha La Dalbaday (Ordered Items)
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Price</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.productName}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600 font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                        ${item.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800 font-mono">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span>Discount:</span>
                <span className="font-mono">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Delivery Fee:</span>
                <span className="font-mono font-medium">+${order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            {order.cargoFee > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Cargo Fee:</span>
                <span className="font-mono font-medium">+${order.cargoFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>Wadarta Guud (Grand Total):</span>
              <span className="font-mono text-base text-slate-900">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-700 font-medium">
              <span>La Bixiyay (Paid / Advance):</span>
              <span className="font-mono">${order.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-rose-600 pt-1 border-t border-dashed border-slate-200">
              <span>Haraaga Dhiman (Remaining Balance):</span>
              <span className="font-mono text-sm">${remaining.toFixed(2)}</span>
            </div>
          </div>

          {/* HADDA BIXI (PAY NOW) Mobile Money USSD Prompt */}
          {remaining > 0 && (
            <div className="bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    $
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">HADDA BIXI (PAY NOW)</h4>
                    <p className="text-xs text-slate-600">Ku bixi lacagta hadhaaga ah EVC Plus, Sahal ama e-Dahab</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  ${remaining.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                {/* EVC Plus */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-800 uppercase">Hormuud EVC Plus</div>
                    <div className="text-xs font-mono font-bold text-slate-800 mt-1 select-all">{evcUssd}</div>
                  </div>
                  <button
                    onClick={() => handleCopyUssd(evcUssd)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition"
                  >
                    {copiedCode === evcUssd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === evcUssd ? 'Waa La Koobiyeeyay' : 'Koodhka Koobiyi'}
                  </button>
                </div>

                {/* Sahal */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-sky-800 uppercase">Golis Sahal</div>
                    <div className="text-xs font-mono font-bold text-slate-800 mt-1 select-all">{sahalUssd}</div>
                  </div>
                  <button
                    onClick={() => handleCopyUssd(sahalUssd)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold transition"
                  >
                    {copiedCode === sahalUssd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === sahalUssd ? 'Waa La Koobiyeeyay' : 'Koodhka Koobiyi'}
                  </button>
                </div>

                {/* e-Dahab */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-amber-800 uppercase">Dahabshiil e-Dahab</div>
                    <div className="text-xs font-mono font-bold text-slate-800 mt-1 select-all">{edahabUssd}</div>
                  </div>
                  <button
                    onClick={() => handleCopyUssd(edahabUssd)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition"
                  >
                    {copiedCode === edahabUssd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === edahabUssd ? 'Waa La Koobiyeeyay' : 'Koodhka Koobiyi'}
                  </button>
                </div>
              </div>

              {/* Cashier Payment Entry Toggle */}
              <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowPayInput(!showPayInput);
                    setPayAmount(remaining);
                  }}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {showPayInput ? 'Qari lacag qabashada' : 'Qabo Lacag (Record Received Payment)'}
                </button>
              </div>

              {showPayInput && (
                <form onSubmit={handleRecordPayment} className="mt-3 p-3 bg-white rounded-xl border border-emerald-300 flex flex-wrap gap-2 items-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={remaining}
                    value={payAmount || ''}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Lacagta ($)"
                    className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EVC Plus">Hormuud EVC Plus</option>
                    <option value="Sahal">Golis Sahal</option>
                    <option value="Premier Bank">Premier Bank</option>
                    <option value="Dahabshiil">Dahabshiil</option>
                    <option value="Cash">Cash</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Xaqiiji Bixinta
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp Ku Dir
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Daabac (Print)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {order.status !== 'converted' && onConvertSale && (
              <button
                onClick={() => {
                  onConvertSale(order.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-lime-400 text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                U Bedel Invoice (Convert to Sale)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
            >
              Xir (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
