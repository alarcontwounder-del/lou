import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Users, MessageSquare, Download, LogOut, Search, Trash2, AlertCircle, Star, CheckCircle, XCircle, LayoutGrid } from 'lucide-react';
import axios from 'axios';
import { ContentManager } from './ContentManager';

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

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => {
    const term = searchTerm.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(term) ||
      contact.email?.toLowerCase().includes(term) ||
      contact.country?.toLowerCase().includes(term) ||
      contact.message?.toLowerCase().includes(term) ||
      contact.inquiry_type?.toLowerCase().includes(term)
    );
  });

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter(sub => {
    const term = searchTerm.toLowerCase();
    return (
      sub.name?.toLowerCase().includes(term) ||
      sub.email?.toLowerCase().includes(term) ||
      sub.country?.toLowerCase().includes(term)
    );
  });

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
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Logout"
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              data-testid="close-dashboard-btn"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200 bg-stone-50">
          <div className="flex">
            <button
              onClick={() => { setActiveTab('contacts'); setSearchTerm(''); }}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'contacts'
                  ? 'border-b-2 border-brand-slate text-brand-charcoal bg-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              data-testid="contacts-tab"
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contacts ({contacts.length})
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('subscribers'); setSearchTerm(''); }}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'subscribers'
                  ? 'border-b-2 border-brand-slate text-brand-charcoal bg-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              data-testid="subscribers-tab"
            >
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Subscribers ({subscribers.length})
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('reviews'); setSearchTerm(''); }}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-brand-slate text-brand-charcoal bg-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              data-testid="reviews-tab"
            >
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                Pending Reviews ({pendingReviews.length})
              </div>
            </button>
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
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-stone-900">Contact Inquiries</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Search Input */}
                      <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Search contacts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-slate focus:border-transparent"
                          data-testid="search-contacts"
                        />
                      </div>
                      <button
                        onClick={() => exportToCSV(filteredContacts, 'contacts.csv')}
                        disabled={filteredContacts.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="export-contacts-btn"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-20">
                      <MessageSquare className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500">
                        {searchTerm ? 'No contacts match your search' : 'No contact inquiries yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredContacts.map((contact) => (
                        <div key={contact.id} className="bg-white border border-stone-200 rounded-lg p-6 hover:shadow-md transition-shadow relative group">
                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirm({ type: 'contact', id: contact.id, name: contact.name })}
                            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete contact"
                            data-testid={`delete-contact-${contact.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="flex justify-between items-start mb-4 pr-10">
                            <div>
                              <h4 className="font-bold text-lg text-stone-900">{contact.name}</h4>
                              <p className="text-sm text-stone-500">
                                {new Date(contact.created_at).toLocaleString()}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-brand-cream text-brand-charcoal text-xs font-medium rounded-full">
                              {contact.inquiry_type}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-stone-400" />
                              <a href={`mailto:${contact.email}`} className="text-brand-slate hover:underline">
                                {contact.email}
                              </a>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-stone-400" />
                                <span className="text-stone-700">{contact.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-stone-400" />
                              <span className="text-stone-700">{contact.country}</span>
                            </div>
                          </div>
                          <div className="bg-stone-50 p-4 rounded-lg">
                            <p className="text-sm text-stone-700 whitespace-pre-wrap">{contact.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'subscribers' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-stone-900">Newsletter Subscribers</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Search Input */}
                      <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Search subscribers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-slate focus:border-transparent"
                          data-testid="search-subscribers"
                        />
                      </div>
                      <button
                        onClick={() => exportToCSV(filteredSubscribers, 'subscribers.csv')}
                        disabled={filteredSubscribers.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="export-subscribers-btn"
                      >
                        <Download className="w-4 h-4" />
                        Export
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
                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirm({ type: 'subscriber', id: sub.id, name: sub.name })}
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
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              sub.is_active ? 'bg-brand-cream text-brand-charcoal' : 'bg-stone-100 text-stone-500'
                            }`}>
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
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-600">
                      {pendingReviews.length === 0 
                        ? 'No pending reviews to approve' 
                        : `${pendingReviews.length} review${pendingReviews.length > 1 ? 's' : ''} waiting for approval`
                      }
                    </p>
                  </div>

                  {pendingReviews.length === 0 ? (
                    <div className="text-center py-16 text-stone-400">
                      <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-stone-500">All reviews have been processed</p>
                      <p className="text-sm mt-1">New reviews will appear here when submitted</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingReviews.map((review) => (
                        <div key={review.id} className="bg-white border border-stone-200 rounded-lg p-5">
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-brand-slate to-brand-charcoal rounded-full flex items-center justify-center text-white font-bold">
                                {review.user_name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h4 className="font-semibold text-stone-900">{review.user_name}</h4>
                                <p className="text-xs text-stone-500">{review.user_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(star => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Review Text */}
                          <p className="text-stone-700 mb-4 bg-stone-50 p-3 rounded-lg text-sm">
                            "{review.review_text}"
                          </p>
                          
                          {/* Review Meta & Actions */}
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-stone-500">
                              <span>{review.country}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRejectReview(review.id)}
                                disabled={reviewAction === review.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                              <button
                                onClick={() => handleApproveReview(review.id)}
                                disabled={reviewAction === review.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Confirm Delete</h3>
            </div>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors font-medium"
                data-testid="cancel-delete-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'contact') {
                    handleDeleteContact(deleteConfirm.id);
                  } else {
                    handleDeleteSubscriber(deleteConfirm.id);
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                data-testid="confirm-delete-btn"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
