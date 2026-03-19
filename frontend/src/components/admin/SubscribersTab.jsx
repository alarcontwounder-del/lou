import React, { useState } from 'react';
import { Mail, Search, Download, Trash2, Plus, Upload, Send, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const SubscribersTab = ({ subscribers, setSubscribers, searchTerm, setSearchTerm, onDelete, onExport }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({ name: '', email: '', country: '' });
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [bulkEmail, setBulkEmail] = useState({ subject: '', message: '' });
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const filteredSubscribers = subscribers.filter(sub => {
    const term = searchTerm.toLowerCase();
    return (
      sub.name?.toLowerCase().includes(term) ||
      sub.email?.toLowerCase().includes(term) ||
      sub.country?.toLowerCase().includes(term)
    );
  });

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/newsletter/add?name=${encodeURIComponent(newSubscriber.name)}&email=${encodeURIComponent(newSubscriber.email)}&country=${encodeURIComponent(newSubscriber.country)}`,
        {},
        { withCredentials: true }
      );
      setSubscribers([...subscribers, res.data]);
      setShowAddModal(false);
      setNewSubscriber({ name: '', email: '', country: '' });
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to add subscriber');
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/newsletter/import-csv`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(res.data);
      const subscribersRes = await axios.get(`${BACKEND_URL}/api/newsletter`, { withCredentials: true });
      setSubscribers(subscribersRes.data);
    } catch (error) {
      setImportResult({ success: false, error: error.response?.data?.detail || 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  const handleSendBulkEmail = async (e) => {
    e.preventDefault();
    setSendingBulk(true);
    setBulkResult(null);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/newsletter/send-bulk?subject=${encodeURIComponent(bulkEmail.subject)}&message=${encodeURIComponent(bulkEmail.message)}`,
        {},
        { withCredentials: true }
      );
      setBulkResult(res.data);
    } catch (error) {
      setBulkResult({ success: false, error: error.response?.data?.detail || 'Failed to send emails' });
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-stone-900">Newsletter Subscribers</h3>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-brand-slate focus:border-transparent"
              data-testid="search-subscribers"
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3 py-2 bg-brand-charcoal text-white rounded-lg transition-colors text-sm font-medium hover:bg-brand-charcoal/90" data-testid="add-subscriber-btn">
            <Plus className="w-4 h-4" /> Add
          </button>
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-3 py-2 bg-brand-slate text-white rounded-lg transition-colors text-sm font-medium hover:bg-brand-slate/90" data-testid="import-csv-btn">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={() => setShowBulkEmailModal(true)} disabled={subscribers.length === 0} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg transition-colors text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" data-testid="bulk-email-btn">
            <Send className="w-4 h-4" /> Send Email
          </button>
          <button onClick={() => onExport(filteredSubscribers, 'subscribers.csv')} disabled={filteredSubscribers.length === 0} className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" data-testid="export-subscribers-btn">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>
      
      {filteredSubscribers.length === 0 ? (
        <div className="text-center py-20">
          <Mail className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">
            {searchTerm ? 'No subscribers match your search' : 'No newsletter subscribers yet'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscribers.map((sub) => (
            <div key={sub.id} className="bg-white border border-stone-200 rounded-lg p-5 hover:shadow-md transition-shadow relative group">
              <button
                onClick={() => onDelete({ type: 'subscriber', id: sub.id, name: sub.name })}
                className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Delete subscriber"
                data-testid={`delete-subscriber-${sub.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-start justify-between mb-3 pr-8">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-charcoal to-brand-charcoalLight rounded-full flex items-center justify-center text-white font-bold">
                  {sub.name.charAt(0).toUpperCase()}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${sub.is_active ? 'bg-brand-cream text-brand-charcoal' : 'bg-stone-100 text-stone-500'}`}>
                  {sub.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h4 className="font-bold text-stone-900 mb-1">{sub.name}</h4>
              <p className="text-sm text-stone-600 mb-2 truncate">{sub.email}</p>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{sub.country}</span>
                <span>{new Date(sub.subscribed_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900">Add Subscriber</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                <input type="text" required value={newSubscriber.name} onChange={(e) => setNewSubscriber({...newSubscriber, name: e.target.value})} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-slate" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input type="email" required value={newSubscriber.email} onChange={(e) => setNewSubscriber({...newSubscriber, email: e.target.value})} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-slate" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Country</label>
                <input type="text" value={newSubscriber.country} onChange={(e) => setNewSubscriber({...newSubscriber, country: e.target.value})} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-slate" placeholder="Spain" />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-charcoal text-white rounded-lg hover:bg-brand-charcoal/90 transition-colors font-medium">Add Subscriber</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900">Import Subscribers from CSV</h3>
              <button onClick={() => { setShowImportModal(false); setImportResult(null); }} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-lg text-sm text-stone-600">
                <p className="font-medium mb-2">CSV Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Columns: <code className="bg-stone-200 px-1 rounded">email</code>, <code className="bg-stone-200 px-1 rounded">name</code>, <code className="bg-stone-200 px-1 rounded">country</code></li>
                  <li>First row should be headers</li>
                  <li>Duplicate emails will be skipped</li>
                </ul>
              </div>
              <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <label className="cursor-pointer">
                  <span className="text-brand-slate font-medium hover:underline">Choose CSV file</span>
                  <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" disabled={importing} />
                </label>
                {importing && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-stone-500">
                    <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </div>
                )}
              </div>
              {importResult && (
                <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {importResult.success ? (
                    <><p className="font-medium">Import Complete!</p><p className="text-sm mt-1">{importResult.imported} imported, {importResult.skipped} skipped</p></>
                  ) : (
                    <p>{importResult.error}</p>
                  )}
                </div>
              )}
              <div className="flex justify-end pt-2">
                <button onClick={() => { setShowImportModal(false); setImportResult(null); }} className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors font-medium">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Email Modal */}
      {showBulkEmailModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900">Send Bulk Email</h3>
              <button onClick={() => { setShowBulkEmailModal(false); setBulkResult(null); }} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
              <strong>Note:</strong> This will send an email to all {subscribers.length} active subscribers.
            </div>
            <form onSubmit={handleSendBulkEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
                <input type="text" required value={bulkEmail.subject} onChange={(e) => setBulkEmail({...bulkEmail, subject: e.target.value})} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-slate" placeholder="Special Golf Offer This Week!" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                <textarea required rows={6} value={bulkEmail.message} onChange={(e) => setBulkEmail({...bulkEmail, message: e.target.value})} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-slate resize-none" placeholder={"Dear Golfer,\n\nWe have an exclusive offer for you..."} />
              </div>
              {bulkResult && (
                <div className={`p-4 rounded-lg ${bulkResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {bulkResult.success ? (
                    <><p className="font-medium">Emails Sent!</p><p className="text-sm mt-1">{bulkResult.sent} sent successfully, {bulkResult.failed} failed</p></>
                  ) : (
                    <p>{bulkResult.error}</p>
                  )}
                </div>
              )}
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => { setShowBulkEmailModal(false); setBulkResult(null); }} className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={sendingBulk} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50">
                  {sendingBulk ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" />Send to {subscribers.length} Subscribers</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
