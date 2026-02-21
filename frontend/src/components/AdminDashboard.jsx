import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Users, MessageSquare, Calendar, Download, LogOut } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const AdminDashboard = ({ onClose, user }) => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactsRes, subscribersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/contact`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/newsletter`, { withCredentials: true })
      ]);
      setContacts(contactsRes.data);
      setSubscribers(subscribersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const exportToCSV = (data, filename) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center justify-between">
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
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200 bg-stone-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'border-b-2 border-emerald-600 text-emerald-600 bg-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contact Inquiries ({contacts.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'subscribers'
                  ? 'border-b-2 border-emerald-600 text-emerald-600 bg-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                Newsletter Subscribers ({subscribers.length})
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-stone-500 mt-4">Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'contacts' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-stone-900">Contact Inquiries</h3>
                    <button
                      onClick={() => exportToCSV(contacts, 'contacts.csv')}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                  
                  {contacts.length === 0 ? (
                    <div className="text-center py-20">
                      <MessageSquare className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500">No contact inquiries yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="bg-white border border-stone-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-lg text-stone-900">{contact.name}</h4>
                              <p className="text-sm text-stone-500">
                                {new Date(contact.created_at).toLocaleString()}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                              {contact.inquiry_type}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-stone-400" />
                              <a href={`mailto:${contact.email}`} className="text-emerald-600 hover:underline">
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
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-stone-900">Newsletter Subscribers</h3>
                    <button
                      onClick={() => exportToCSV(subscribers, 'subscribers.csv')}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                  
                  {subscribers.length === 0 ? (
                    <div className="text-center py-20">
                      <Mail className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500">No newsletter subscribers yet</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subscribers.map((sub) => (
                        <div key={sub.id} className="bg-white border border-stone-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                              {sub.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              sub.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
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
            </>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-stone-200 bg-stone-50 px-6 py-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{contacts.length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Total Contacts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600">{subscribers.length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Subscribers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-600">
                {contacts.filter(c => {
                  const date = new Date(c.created_at);
                  const today = new Date();
                  return date.toDateString() === today.toDateString();
                }).length}
              </p>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
