import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle2, XCircle, Loader2, Shield, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useParams, useSearchParams, Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CURRENCY_SYMBOLS = { eur: '\u20AC', gbp: '\u00A3', usd: '$' };

export default function PaymentPage() {
  const { paymentId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [pollStatus, setPollStatus] = useState(null); // null | 'polling' | 'paid' | 'failed'

  // Fetch payment details
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/payment/${paymentId}`);
        setPayment(res.data);
      } catch (err) {
        setError(err?.response?.status === 404 ? 'Payment request not found.' : 'Something went wrong.');
      } finally { setLoading(false); }
    };
    fetch();
  }, [paymentId]);

  // Poll if returning from Stripe
  const pollPaymentStatus = useCallback(async (sid, attempts = 0) => {
    if (attempts >= 8) {
      setPollStatus('failed');
      return;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}/api/payment/status/${sid}`);
      if (res.data.payment_status === 'paid') {
        setPollStatus('paid');
        setPayment(prev => prev ? { ...prev, status: 'paid' } : prev);
        return;
      }
      if (res.data.status === 'expired') {
        setPollStatus('failed');
        return;
      }
      setTimeout(() => pollPaymentStatus(sid, attempts + 1), 2500);
    } catch {
      setTimeout(() => pollPaymentStatus(sid, attempts + 1), 3000);
    }
  }, []);

  useEffect(() => {
    if (sessionId && payment && payment.status !== 'paid') {
      setPollStatus('polling');
      pollPaymentStatus(sessionId);
    }
  }, [sessionId, payment, pollPaymentStatus]);

  // Create checkout and redirect
  const handlePay = async () => {
    setRedirecting(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/payment/${paymentId}/checkout`, {}, {
        headers: { origin: window.location.origin },
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to start checkout');
      setRedirecting(false);
    }
  };

  const symbol = payment ? (CURRENCY_SYMBOLS[payment.currency] || payment.currency.toUpperCase()) : '';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error && !payment) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-stone-800 mb-2">Payment Not Found</h1>
          <p className="text-sm text-stone-500 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800">
            <ArrowLeft className="w-4 h-4" /> Back to Golf in Mallorca
          </Link>
        </div>
      </div>
    );
  }

  // Success state (paid)
  if (payment?.status === 'paid' || pollStatus === 'paid') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 max-w-md w-full text-center" data-testid="payment-success">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Payment Successful</h1>
          <p className="text-sm text-stone-500 mb-6">
            Thank you, {payment.customer_name}! Your payment of <strong>{symbol}{payment.amount.toFixed(2)}</strong> has been received.
          </p>
          <div className="bg-stone-50 rounded-xl p-4 text-left mb-6 border border-stone-100">
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Details</p>
            <p className="text-sm font-medium text-stone-700">{payment.description}</p>
            <p className="text-xs text-stone-400 mt-1">{payment.service_type === 'package' ? 'Full Package' : 'Reservation Deposit'}</p>
          </div>
          <p className="text-xs text-stone-400 mb-4">A confirmation will be sent to you shortly.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800">
            <ArrowLeft className="w-4 h-4" /> Back to Golf in Mallorca
          </Link>
        </div>
      </div>
    );
  }

  // Polling state
  if (pollStatus === 'polling') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 max-w-md w-full text-center">
          <Loader2 className="w-10 h-10 text-stone-400 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-stone-800 mb-2">Processing Payment...</h1>
          <p className="text-sm text-stone-500">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  // Default: payment form
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-stone-200 max-w-md w-full overflow-hidden" data-testid="payment-page">
        {/* Header */}
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <img src="https://mallorca-golf-travel.preview.emergentagent.com/api/uploads/logo_email_v2.jpg"
              alt="Golf in Mallorca" className="h-8 w-auto rounded" onError={e => { e.target.style.display = 'none'; }} />
            <span className="text-sm font-medium opacity-80">Golf in Mallorca</span>
          </div>
          <p className="text-stone-300 text-xs uppercase tracking-widest mb-1">
            {payment.service_type === 'package' ? 'Package Payment' : 'Reservation Deposit'}
          </p>
          <p className="text-3xl font-bold">{symbol}{payment.amount.toFixed(2)}</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">For</p>
            <p className="text-sm font-semibold text-stone-800">{payment.customer_name}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-stone-700">{payment.description}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600" data-testid="payment-error">
              {error}
            </div>
          )}

          <button onClick={handlePay} disabled={redirecting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-900 transition-colors disabled:opacity-50"
            data-testid="pay-now-btn">
            {redirecting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe...</>
            ) : (
              <><CreditCard className="w-4 h-4" /> Pay {symbol}{payment.amount.toFixed(2)}</>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <Shield className="w-3 h-3" />
            Secure payment powered by Stripe
          </div>
        </div>
      </div>
    </div>
  );
}
