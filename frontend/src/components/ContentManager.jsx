import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, Image, 
  MapPin, ExternalLink, ChevronDown, ChevronUp,
  Hotel, UtensilsCrossed, Palmtree, Coffee, Flag
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Partner type configurations
const PARTNER_TYPES = {
  golf: {
    name: 'Golf Courses',
    icon: Flag,
    endpoint: '/api/golf-courses',
    color: 'emerald',
    fields: ['name', 'location', 'holes', 'par', 'price_from', 'image', 'booking_url']
  },
  hotels: {
    name: 'Hotels',
    icon: Hotel,
    endpoint: '/api/hotels',
    color: 'blue',
    fields: ['name', 'location', 'category', 'region', 'discount_percent', 'image', 'contact_url']
  },
  restaurants: {
    name: 'Restaurants',
    icon: UtensilsCrossed,
    endpoint: '/api/restaurants',
    color: 'orange',
    fields: ['name', 'location', 'cuisine_type', 'michelin_stars', 'discount_percent', 'image', 'contact_url']
  },
  beach_clubs: {
    name: 'Beach Clubs',
    icon: Palmtree,
    endpoint: '/api/beach-clubs',
    color: 'cyan',
    fields: ['name', 'location', 'nearest_golf', 'distance_km', 'discount_percent', 'image', 'contact_url']
  },
  cafe_bars: {
    name: 'Cafés & Bars',
    icon: Coffee,
    endpoint: '/api/cafe-bars',
    color: 'amber',
    fields: ['name', 'location', 'category', 'specialty', 'hours', 'image', 'contact_url']
  }
};

// Compact Partner Card
const PartnerCard = ({ partner, type, onEdit, onDelete }) => {
  const config = PARTNER_TYPES[type];
  const Icon = config.icon;
  
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 hover:shadow-md transition-all group">
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
          {partner.image ? (
            <img 
              src={partner.image} 
              alt={partner.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-stone-300" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-stone-900 truncate">{partner.name}</h4>
          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {partner.location}
          </p>
          
          {/* Type-specific info */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {type === 'golf' && partner.holes && (
              <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                {partner.holes} holes
              </span>
            )}
            {type === 'golf' && partner.price_from && (
              <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                From €{partner.price_from}
              </span>
            )}
            {partner.discount_percent && (
              <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">
                -{partner.discount_percent}%
              </span>
            )}
            {partner.category && (
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                {partner.category}
              </span>
            )}
            {partner.michelin_stars && (
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
                {partner.michelin_stars}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(partner)}
            className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(partner)}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Modal
const EditModal = ({ partner, type, onSave, onClose, isNew }) => {
  const [formData, setFormData] = useState(partner || {});
  const [saving, setSaving] = useState(false);
  const config = PARTNER_TYPES[type];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData, isNew);
      onClose();
    } catch (error) {
      alert('Failed to save: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateDescription = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      description: { ...prev.description, [lang]: value }
    }));
  };

  const updateDeal = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      deal: { ...prev.deal, [lang]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${config.color}-600 to-${config.color}-700 p-4 flex items-center justify-between`}
             style={{ background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` }}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {React.createElement(config.icon, { className: "w-5 h-5" })}
            {isNew ? `Add New ${config.name.slice(0, -1)}` : `Edit ${partner?.name}`}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">ID (slug)</label>
                <input
                  type="text"
                  value={formData.id || ''}
                  onChange={(e) => updateField('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="unique-id"
                  required
                  disabled={!isNew}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Partner Name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City/Area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Address</label>
                <input
                  type="text"
                  value={formData.full_address || ''}
                  onChange={(e) => updateField('full_address', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full street address"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => updateField('image', e.target.value)}
                  className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
                {formData.image && (
                  <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0">
                    <img src={formData.image} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                  </div>
                )}
              </div>
            </div>

            {/* Type-specific fields */}
            {type === 'golf' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Holes</label>
                  <input
                    type="number"
                    value={formData.holes || ''}
                    onChange={(e) => updateField('holes', parseInt(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Par</label>
                  <input
                    type="number"
                    value={formData.par || ''}
                    onChange={(e) => updateField('par', parseInt(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="72"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price From (€)</label>
                  <input
                    type="number"
                    value={formData.price_from || ''}
                    onChange={(e) => updateField('price_from', parseFloat(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="85"
                  />
                </div>
              </div>
            )}

            {(type === 'hotels' || type === 'cafe_bars') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="Luxury / Boutique / etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {type === 'hotels' ? 'Region' : 'Specialty'}
                  </label>
                  <input
                    type="text"
                    value={type === 'hotels' ? (formData.region || '') : (formData.specialty || '')}
                    onChange={(e) => updateField(type === 'hotels' ? 'region' : 'specialty', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder={type === 'hotels' ? 'North / South / etc.' : 'Famous dish...'}
                  />
                </div>
              </div>
            )}

            {type === 'restaurants' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Cuisine Type</label>
                  <input
                    type="text"
                    value={formData.cuisine_type || ''}
                    onChange={(e) => updateField('cuisine_type', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="Mediterranean / Spanish / etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Michelin Stars</label>
                  <input
                    type="text"
                    value={formData.michelin_stars || ''}
                    onChange={(e) => updateField('michelin_stars', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="⭐ Michelin Star"
                  />
                </div>
              </div>
            )}

            {type === 'beach_clubs' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nearest Golf Course</label>
                  <input
                    type="text"
                    value={formData.nearest_golf || ''}
                    onChange={(e) => updateField('nearest_golf', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="Golf course name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_km || ''}
                    onChange={(e) => updateField('distance_km', parseFloat(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="5.2"
                  />
                </div>
              </div>
            )}

            {/* Discount & URL */}
            {type !== 'golf' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={formData.discount_percent || ''}
                    onChange={(e) => updateField('discount_percent', parseInt(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Contact/Booking URL</label>
                  <input
                    type="url"
                    value={formData.contact_url || formData.booking_url || ''}
                    onChange={(e) => updateField(type === 'golf' ? 'booking_url' : 'contact_url', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {type === 'golf' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Booking URL</label>
                <input
                  type="url"
                  value={formData.booking_url || ''}
                  onChange={(e) => updateField('booking_url', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  placeholder="https://..."
                />
              </div>
            )}

            {/* Descriptions - Collapsible */}
            <div className="border border-stone-200 rounded-lg">
              <button
                type="button"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling;
                  content.classList.toggle('hidden');
                }}
                className="w-full p-3 flex items-center justify-between text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Descriptions (Multi-language)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="hidden p-3 pt-0 space-y-3">
                {['en', 'de', 'fr', 'se'].map(lang => (
                  <div key={lang}>
                    <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{lang}</label>
                    <textarea
                      value={formData.description?.[lang] || ''}
                      onChange={(e) => updateDescription(lang, e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm resize-none"
                      rows={2}
                      placeholder={`Description in ${lang.toUpperCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Deal - Collapsible (for non-golf) */}
            {type !== 'golf' && (
              <div className="border border-stone-200 rounded-lg">
                <button
                  type="button"
                  onClick={(e) => {
                    const content = e.currentTarget.nextElementSibling;
                    content.classList.toggle('hidden');
                  }}
                  className="w-full p-3 flex items-center justify-between text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <span>Deal Text (Multi-language)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="hidden p-3 pt-0 space-y-3">
                  {['en', 'de', 'fr', 'se'].map(lang => (
                    <div key={lang}>
                      <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{lang}</label>
                      <input
                        type="text"
                        value={formData.deal?.[lang] || ''}
                        onChange={(e) => updateDeal(lang, e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                        placeholder={`Deal text in ${lang.toUpperCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isNew ? 'Create' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Content Manager Component
export const ContentManager = () => {
  const [activeType, setActiveType] = useState('golf');
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPartner, setEditingPartner] = useState(null);
  const [isNewPartner, setIsNewPartner] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const config = PARTNER_TYPES[activeType];

  useEffect(() => {
    fetchPartners();
  }, [activeType]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}${config.endpoint}`);
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (partnerData, isNew) => {
    if (isNew) {
      await axios.post(`${BACKEND_URL}${config.endpoint}`, partnerData);
    } else {
      await axios.put(`${BACKEND_URL}${config.endpoint}/${partnerData.id}`, partnerData);
    }
    fetchPartners();
  };

  const handleDelete = async (partner) => {
    try {
      await axios.delete(`${BACKEND_URL}${config.endpoint}/${partner.id}`);
      setPartners(partners.filter(p => p.id !== partner.id));
      setDeleteConfirm(null);
    } catch (error) {
      alert('Failed to delete: ' + (error.response?.data?.detail || error.message));
    }
  };

  const filteredPartners = partners.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.location?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="h-full flex flex-col">
      {/* Type Tabs */}
      <div className="flex gap-1 p-2 bg-stone-100 rounded-lg mb-4 overflow-x-auto">
        {Object.entries(PARTNER_TYPES).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => { setActiveType(key); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                activeType === key
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cfg.name}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={`Search ${config.name.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => { setEditingPartner({}); setIsNewPartner(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Stats */}
      <div className="text-sm text-stone-500 mb-3">
        {filteredPartners.length} {config.name.toLowerCase()} {searchTerm && `matching "${searchTerm}"`}
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            {React.createElement(config.icon, { className: "w-12 h-12 mx-auto mb-3 opacity-50" })}
            <p>{searchTerm ? 'No results found' : `No ${config.name.toLowerCase()} yet`}</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredPartners.map(partner => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                type={activeType}
                onEdit={(p) => { setEditingPartner(p); setIsNewPartner(false); }}
                onDelete={(p) => setDeleteConfirm(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPartner && (
        <EditModal
          partner={editingPartner}
          type={activeType}
          isNew={isNewPartner}
          onSave={handleSave}
          onClose={() => { setEditingPartner(null); setIsNewPartner(false); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Delete {deleteConfirm.name}?</h3>
            <p className="text-stone-600 text-sm mb-6">
              This will remove this item from the website. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
