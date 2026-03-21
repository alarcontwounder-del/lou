import React, { useState, useEffect } from 'react';
import { Plus, Copy, ExternalLink, Trash2, Check, Search, CreditCard, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SERVICE_TYPES = [
  { value: 'reservation', label: 'Reservation Deposit' },
  { value: 'package', label: 'Full Package' },
];

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  initiated: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-stone-100 text-stone-500 border-stone-200',
};

export const PaymentsTab = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    amount: '',
    currency: 'eur',
    description: '',
    service_type: 'reservation',
  });

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/payments`, { withCredentials: true });
      setPayments(res.data);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_email || !form.amount || !form.description) {
      toast.error('Please fill in all fields');
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/payment-request`, {
        ...form,
        amount: parseFloat(form.amount),
      }, { withCredentials: true });
      toast.success(`Payment link created for ${form.customer_name}`);
      setShowForm(false);
      setForm({ customer_name: '', customer_email: '', amount: '', currency: 'eur', description: '', service_type: 'reservation' });
      fetchPayments();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to create payment request');
    } finally { setCreating(false); }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Delete this payment request?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/payment/${paymentId}`, { withCredentials: true });
      setPayments(prev => prev.filter(p => p.payment_id !== paymentId));
      toast.success('Payment request deleted');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Cannot delete this payment');
    }
  };

  const copyLink = (paymentId) => {
    const link = `${window.location.origin}/pay/${paymentId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(paymentId);
    toast.success('Payment link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = payments.filter(p =>
    p.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-12 text-stone-500">Loading payments...</div>;

  return (
    <div data-testid="payments-tab">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300"
            data-testid="payment-search" />
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-900 transition-colors"
          data-testid="create-payment-btn">
          <Plus className="w-4 h-4" /> New Payment Link
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-5 space-y-4" data-testid="payment-form">
          <h3 className="text-sm font-bold text-stone-800">Create Payment Request</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Customer Name</label>
              <input type="text" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
                placeholder="John Smith" data-testid="payment-name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Customer Email</label>
              <input type="email" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
                placeholder="john@example.com" data-testid="payment-email" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Amount</label>
              <input type="number" step="0.01" min="0.50" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
                placeholder="50.00" data-testid="payment-amount" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
                data-testid="payment-currency">
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
                <option value="usd">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Service Type</label>
              <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
                data-testid="payment-service-type">
                {SERVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
              placeholder="e.g. 3-Day Golf Package - Son Gual + St. Regis" data-testid="payment-description" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200">Cancel</button>
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-800 rounded-lg hover:bg-stone-900 disabled:opacity-50"
              data-testid="submit-payment-btn">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {creating ? 'Creating...' : 'Create Payment Link'}
            </button>
          </div>
        </form>
      )}

      {/* Payments List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center py-8 text-stone-400 text-sm" data-testid="no-payments">
            {payments.length === 0 ? 'No payment requests yet. Create one to get started.' : 'No matching payments found.'}
          </p>
        )}
        {filtered.map(p => (
          <div key={p.payment_id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4" data-testid={`payment-row-${p.payment_id}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-stone-800 truncate">{p.customer_name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${STATUS_STYLES[p.status] || STATUS_STYLES.pending}`}>
                  {p.status}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                  {p.service_type === 'package' ? 'Package' : 'Reservation'}
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate">{p.description}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{p.customer_email} &middot; {new Date(p.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-stone-800">
                {new Intl.NumberFormat('en', { style: 'currency', currency: p.currency || 'eur' }).format(p.amount)}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => copyLink(p.payment_id)} title="Copy payment link"
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
                data-testid={`copy-link-${p.payment_id}`}>
                {copiedId === p.payment_id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <a href={`/pay/${p.payment_id}`} target="_blank" rel="noopener noreferrer" title="Open payment page"
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
                data-testid={`open-link-${p.payment_id}`}>
                <ExternalLink className="w-4 h-4" />
              </a>
              {p.status !== 'paid' && (
                <button onClick={() => handleDelete(p.payment_id)} title="Delete payment"
                  className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                  data-testid={`delete-payment-${p.payment_id}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
