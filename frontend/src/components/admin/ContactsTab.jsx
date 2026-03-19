import React from 'react';
import { MessageSquare, Mail, MapPin, Phone, Search, Download, Trash2 } from 'lucide-react';

export const ContactsTab = ({ contacts, searchTerm, setSearchTerm, onDelete, onExport }) => {
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-stone-900">Contact Inquiries</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
            onClick={() => onExport(filteredContacts, 'contacts.csv')}
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
              <button
                onClick={() => onDelete({ type: 'contact', id: contact.id, name: contact.name })}
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
  );
};
