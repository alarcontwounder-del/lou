import React, { useState, useEffect } from 'react';
import { X, Mail, Users, MessageSquare, LogOut, Star, LayoutGrid, Settings } from 'lucide-react';
import axios from 'axios';
import { ContentManager } from './ContentManager';
import { ContactsTab } from './admin/ContactsTab';
import { SubscribersTab } from './admin/SubscribersTab';
import { ReviewsTab } from './admin/ReviewsTab';
import { DeleteModal } from './admin/DeleteModal';
import { DisplaySettingsTab } from './admin/DisplaySettingsTab';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const AdminDashboard = ({ onClose, user }) => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reviewAction, setReviewAction] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactsRes, subscribersRes, reviewsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/contact`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/newsletter`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/reviews/pending`, { withCredentials: true })
      ]);
      setContacts(contactsRes.data);
      setSubscribers(subscribersRes.data);
      setPendingReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    setReviewAction(reviewId);
    try {
      await axios.post(`${BACKEND_URL}/api/reviews/${reviewId}/approve`, {}, { withCredentials: true });
      setPendingReviews(pendingReviews.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve review');
    } finally {
      setReviewAction(null);
    }
  };

  const handleRejectReview = async (reviewId) => {
    setReviewAction(reviewId);
    try {
      await axios.post(`${BACKEND_URL}/api/reviews/${reviewId}/reject`, {}, { withCredentials: true });
      setPendingReviews(pendingReviews.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('Reject error:', error);
      alert('Failed to reject review');
    } finally {
      setReviewAction(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    setDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/contact/${contactId}`, { withCredentials: true });
      setContacts(contacts.filter(c => c.id !== contactId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete contact');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    setDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/newsletter/${subscriberId}`, { withCredentials: true });
      setSubscribers(subscribers.filter(s => s.id !== subscriberId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete subscriber');
    } finally {
      setDeleting(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.type === 'contact') {
      handleDeleteContact(deleteConfirm.id);
    } else {
      handleDeleteSubscriber(deleteConfirm.id);
    }
  };

  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: MessageSquare, count: contacts.length },
    { id: 'subscribers', label: 'Subscribers', icon: Mail, count: subscribers.length },
    { id: 'reviews', label: 'Pending Reviews', icon: Star, count: pendingReviews.length },
    { id: 'content', label: 'Content Manager', icon: LayoutGrid },
    { id: 'display', label: 'Display Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-charcoal to-brand-charcoalLight p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
              <p className="text-white/80 text-sm">Golfinmallorca.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-white/70 text-xs">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Logout" data-testid="logout-btn">
              <LogOut className="w-5 h-5 text-white" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors" data-testid="close-dashboard-btn">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200 bg-stone-50">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                  activeTab === tab.id
                    ? 'border-b-2 border-brand-slate text-brand-charcoal bg-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                data-testid={`${tab.id}-tab`}
              >
                <div className="flex items-center justify-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label} {tab.count !== undefined && `(${tab.count})`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-brand-charcoal border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-stone-500 mt-4">Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'contacts' && (
                <ContactsTab
                  contacts={contacts}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onDelete={setDeleteConfirm}
                  onExport={exportToCSV}
                />
              )}
              {activeTab === 'subscribers' && (
                <SubscribersTab
                  subscribers={subscribers}
                  setSubscribers={setSubscribers}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onDelete={setDeleteConfirm}
                  onExport={exportToCSV}
                />
              )}
              {activeTab === 'reviews' && (
                <ReviewsTab
                  pendingReviews={pendingReviews}
                  reviewAction={reviewAction}
                  onApprove={handleApproveReview}
                  onReject={handleRejectReview}
                />
              )}
              {activeTab === 'content' && <ContentManager />}
              {activeTab === 'display' && <DisplaySettingsTab />}
            </>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-stone-200 bg-stone-50 px-6 py-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-brand-charcoal">{contacts.length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Contacts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-charcoal/90">{subscribers.length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Subscribers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{pendingReviews.length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Pending Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        deleteConfirm={deleteConfirm}
        deleting={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};
