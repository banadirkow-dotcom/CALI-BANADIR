import React, { useState, useMemo } from 'react';
import {
  Truck,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  MapPin,
  Building2,
  Phone,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CargoShipment } from '../../types';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';

export const CargoView: React.FC = () => {
  const { cargoShipments, addCargoShipment, updateCargoShipment, customers, sales, currentUser } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [destinationCity, setDestinationCity] = useState('Hargeisa');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [cargoCompany, setCargoCompany] = useState('Star Cargo & Logistics');
  const [cargoPhone, setCargoPhone] = useState('+252 61 700 8899');
  const [waybillNo, setWaybillNo] = useState('');
  const [saleInvoiceNo, setSaleInvoiceNo] = useState(sales[0]?.invoiceNo || '');
  const [codAmount, setCodAmount] = useState('0');
  const [shippingFee, setShippingFee] = useState('15.00');
  const [packageCount, setPackageCount] = useState('1');
  const [weightKg, setWeightKg] = useState('5.0');
  const [notes, setNotes] = useState('');

  const filteredShipments = useMemo(() => {
    return cargoShipments.filter((c) => {
      const matchSearch =
        c.trackingNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.cargoCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.waybillNo && c.waybillNo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        selectedStatus === 'All' || c.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [cargoShipments, searchQuery, selectedStatus]);

  const totalCodPending = cargoShipments
    .filter((c) => c.status !== 'Delivered' && c.codAmount > 0)
    .reduce((sum, c) => sum + c.codAmount, 0);

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId) || customers[0];

    addCargoShipment({
      trackingNo: `CRG-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      destinationCity,
      destinationAddress: destinationAddress.trim() || undefined,
      cargoCompany,
      cargoPhone,
      waybillNo: waybillNo.trim() || undefined,
      saleInvoiceNo: saleInvoiceNo || undefined,
      status: 'Pending Handover',
      codAmount: parseFloat(codAmount) || 0,
      shippingFee: parseFloat(shippingFee) || 0,
      feePaidBy: 'Customer',
      packageCount: parseInt(packageCount, 10) || 1,
      weightKg: parseFloat(weightKg) || 1,
      notes,
    });

    setIsNewModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: CargoShipment['status']) => {
    updateCargoShipment(id, { status: newStatus });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Cargo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Customer, destination, cargo company, status, COD, and freight fee tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4 text-lime-400 stroke-[3]" />
            New Cargo
          </button>
        </div>
      </div>

      {/* KPI Cards (Screenshot 21) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Shipments"
          value={cargoShipments.length}
          subtitle="Inter-city freight dispatches"
          icon={Truck}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Pending Handover"
          value={cargoShipments.filter((c) => c.status === 'Pending Handover').length}
          subtitle="At store, awaiting pickup"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="In Transit"
          value={cargoShipments.filter((c) => c.status === 'In Transit' || c.status === 'Handed to Cargo').length}
          subtitle="On road / cargo fleet"
          icon={Package}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Pending COD to Collect"
          value={`$${totalCodPending.toFixed(2)}`}
          subtitle="Cash on delivery receivable"
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          highlight={totalCodPending > 0}
        />
      </div>

      {/* Filter Bar & Tabs (Screenshot 21) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking, customer, city, company..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full sm:w-auto">
            {(['All', 'Pending Handover', 'Handed to Cargo', 'In Transit', 'Delivered'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cargo Shipments Table (Screenshot 21) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Tracking No</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Cargo Company</th>
                <th className="py-3 px-3">Waybill #</th>
                <th className="py-3 px-3 text-right">COD Amount</th>
                <th className="py-3 px-3 text-right">Fee</th>
                <th className="py-3 px-4 text-center">Status Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No cargo shipments found.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {c.trackingNo}
                      {c.saleInvoiceNo && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          Inv: {c.saleInvoiceNo}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'In Transit'
                            ? 'bg-purple-100 text-purple-800'
                            : c.status === 'Handed to Cargo'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{c.customerName}</div>
                      <div className="text-[10px] text-slate-400">{c.customerPhone}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {c.destinationCity}
                      </div>
                      {c.destinationAddress && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {c.destinationAddress}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{c.cargoCompany}</div>
                      {c.cargoPhone && (
                        <div className="text-[10px] text-slate-400">{c.cargoPhone}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {c.waybillNo || '—'}
                    </td>

                    <td className="py-3 px-3 text-right font-black">
                      {c.codAmount > 0 ? (
                        <span className="text-emerald-700">${c.codAmount.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">$0.00</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-600 font-semibold">
                      ${c.shippingFee.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value as CargoShipment['status'])}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                      >
                        <option value="Pending Handover">Pending Handover</option>
                        <option value="Handed to Cargo">Handed to Cargo</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Cargo Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Dispatch New Cargo Shipment"
        subtitle="Book inter-city shipment with local cargo agency, waybill & COD terms."
        maxWidth="lg"
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
              form="form-new-cargo"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
            >
              Register Shipment
            </button>
          </>
        }
      >
        <form id="form-new-cargo" onSubmit={handleCreateShipment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Related Sale Invoice
              </label>
              <select
                value={saleInvoiceNo}
                onChange={(e) => setSaleInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              >
                <option value="">-- None / Standalone --</option>
                {sales.map((s) => (
                  <option key={s.id} value={s.invoiceNo}>
                    {s.invoiceNo} — ${s.grandTotal.toFixed(2)} ({s.customerName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Destination City *
              </label>
              <select
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="Hargeisa">Hargeisa</option>
                <option value="Garowe">Garowe</option>
                <option value="Baidoa">Baidoa</option>
                <option value="Kismayo">Kismayo</option>
                <option value="Bossaso">Bossaso</option>
                <option value="Galkayo">Galkayo</option>
                <option value="Beledweyne">Beledweyne</option>
                <option value="Jowhar">Jowhar</option>
                <option value="Borama">Borama</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Cargo Carrier / Agency *
              </label>
              <select
                value={cargoCompany}
                onChange={(e) => setCargoCompany(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Star Cargo & Logistics">Star Cargo & Logistics</option>
                <option value="Som Cargo Express">Som Cargo Express</option>
                <option value="Dahabshiil Logistics">Dahabshiil Logistics</option>
                <option value="Horseed Intercity Transport">Horseed Intercity Transport</option>
                <option value="Juba Cargo">Juba Cargo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Waybill / Receipt No
              </label>
              <input
                type="text"
                value={waybillNo}
                onChange={(e) => setWaybillNo(e.target.value)}
                placeholder="e.g. WB-84920"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Destination Specific Address
              </label>
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Market branch, street, recipient contact..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                COD Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Shipping Fee ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Packages
              </label>
              <input
                type="number"
                value={packageCount}
                onChange={(e) => setPackageCount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Weight (KG)
              </label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
