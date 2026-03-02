import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, 
  MapPin, ExternalLink, ChevronDown, Eye, EyeOff,
  Hotel, UtensilsCrossed, Palmtree, Coffee, Flag,
  ToggleLeft, ToggleRight, Settings, Link, RefreshCw,
  Upload, Image as ImageIcon
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
    urlField: 'booking_url',
    urlLabel: 'Booking URL'
  },
  hotels: {
    name: 'Hotels',
    icon: Hotel,
    endpoint: '/api/hotels',
    color: 'blue',
    urlField: 'contact_url',
    urlLabel: 'Contact URL'
  },
  restaurants: {
    name: 'Restaurants',
    icon: UtensilsCrossed,
    endpoint: '/api/restaurants',
    color: 'orange',
    urlField: 'contact_url',
    urlLabel: 'Contact URL'
  },
  beach_clubs: {
    name: 'Beach Clubs',
    icon: Palmtree,
    endpoint: '/api/beach-clubs',
    color: 'cyan',
    urlField: 'contact_url',
    urlLabel: 'Contact URL'
  },
  cafe_bars: {
    name: 'Cafés & Bars',
    icon: Coffee,
    endpoint: '/api/cafe-bars',
    color: 'amber',
    urlField: 'contact_url',
    urlLabel: 'Contact URL'
  }
};

// Compact Partner Card with Active Toggle
const PartnerCard = ({ partner, type, onEdit, onDelete, onToggleActive }) => {
  const config = PARTNER_TYPES[type];
  const Icon = config.icon;
  const isActive = partner.is_active !== false;
  const bookingUrl = partner[config.urlField] || partner.booking_url || partner.contact_url;
  
  return (
    <div className={`bg-white border rounded-lg p-4 transition-all group ${
      isActive ? 'border-stone-200 hover:shadow-md' : 'border-dashed border-stone-300 opacity-60'
    }`}>
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 relative">
          {partner.image ? (
            <img 
              src={partner.image} 
              alt={partner.name} 
              className={`w-full h-full object-cover ${!isActive ? 'grayscale' : ''}`}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-stone-300" />
            </div>
          )}
          {!isActive && (
            <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center">
              <EyeOff className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-semibold truncate ${isActive ? 'text-stone-900' : 'text-stone-500'}`}>
              {partner.name}
            </h4>
            {/* Active Toggle */}
            <button
              onClick={() => onToggleActive(partner)}
              className={`flex-shrink-0 p-1 rounded transition-colors ${
                isActive 
                  ? 'text-green-600 hover:bg-green-50' 
                  : 'text-stone-400 hover:bg-stone-100'
              }`}
              title={isActive ? 'Click to hide from website' : 'Click to show on website'}
            >
              {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
          </div>
          
          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {partner.location}
          </p>
          
          {/* URL indicator */}
          {bookingUrl && (
            <a 
              href={bookingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 truncate"
              title={bookingUrl}
            >
              <Link className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{new URL(bookingUrl).hostname}</span>
            </a>
          )}
          
          {/* Tags */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {type === 'golf' && partner.holes && (
              <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                {partner.holes}H
              </span>
            )}
            {partner.discount_percent && (
              <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                -{partner.discount_percent}%
              </span>
            )}
            {!isActive && (
              <span className="text-xs px-1.5 py-0.5 bg-stone-200 text-stone-600 rounded">
                Hidden
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
            title="Delete permanently"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Display Settings Modal
const DisplaySettingsModal = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localSettings);
      onClose();
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateLimit = (type, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [type]: value === 'all' ? null : parseInt(value)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-stone-700 to-stone-800 p-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Display Limits
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-stone-600 mb-4">
            Set how many cards to show on your website for each category. Choose "Show All" to display every active partner.
          </p>
          
          {Object.entries(PARTNER_TYPES).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const currentValue = localSettings[key];
            return (
              <div key={key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-stone-500" />
                  <span className="text-sm font-medium text-stone-700">{cfg.name}</span>
                </div>
                <select
                  value={currentValue === null ? 'all' : currentValue}
                  onChange={(e) => updateLimit(key, e.target.value)}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Show All</option>
                  <option value="3">3 cards</option>
                  <option value="4">4 cards</option>
                  <option value="6">6 cards</option>
                  <option value="8">8 cards</option>
                  <option value="10">10 cards</option>
                  <option value="12">12 cards</option>
                  <option value="16">16 cards</option>
                  <option value="20">20 cards</option>
                </select>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-stone-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
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
        <div className="bg-gradient-to-r from-stone-700 to-stone-800 p-4 flex items-center justify-between">
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

            {/* BOOKING/CONTACT URL - Prominent Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Link className="w-4 h-4" />
                {config.urlLabel} (Book Button Link)
              </label>
              <input
                type="url"
                value={formData[config.urlField] || formData.booking_url || formData.contact_url || ''}
                onChange={(e) => updateField(config.urlField, e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="https://partner-website.com/booking"
              />
              <p className="text-xs text-blue-600 mt-1">This URL appears on the "Book" button on the card back</p>
            </div>

            {/* Image Upload Section */}
            <ImageUploadField 
              value={formData.image} 
              onChange={(url) => updateField('image', url)} 
            />

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

            {/* Discount (for non-golf) */}
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
                <div></div>
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
                  <RefreshCw className="w-4 h-4 animate-spin" />
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
  const [showHidden, setShowHidden] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [isNewPartner, setIsNewPartner] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [displaySettings, setDisplaySettings] = useState({
    golf: null,
    hotels: null,
    restaurants: null,
    beach_clubs: null,
    cafe_bars: null
  });

  const config = PARTNER_TYPES[activeType];

  useEffect(() => {
    fetchPartners();
    fetchDisplaySettings();
  }, [activeType]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      // Fetch all partners including inactive ones for admin view
      const response = await axios.get(`${BACKEND_URL}${config.endpoint}?include_inactive=true`);
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
      // Fallback to regular endpoint if include_inactive doesn't exist
      try {
        const response = await axios.get(`${BACKEND_URL}${config.endpoint}`);
        setPartners(response.data);
      } catch (err) {
        console.error('Fallback fetch failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDisplaySettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/display-settings`);
      if (response.data) {
        setDisplaySettings(response.data);
      }
    } catch (error) {
      // Settings endpoint might not exist yet, use defaults
      console.log('Using default display settings');
    }
  };

  const handleSaveDisplaySettings = async (newSettings) => {
    try {
      await axios.post(`${BACKEND_URL}/api/display-settings`, newSettings);
      setDisplaySettings(newSettings);
    } catch (error) {
      console.error('Failed to save display settings:', error);
      throw error;
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

  const handleToggleActive = async (partner) => {
    try {
      const newStatus = partner.is_active === false ? true : false;
      await axios.put(`${BACKEND_URL}${config.endpoint}/${partner.id}`, {
        is_active: newStatus
      });
      // Update local state
      setPartners(partners.map(p => 
        p.id === partner.id ? { ...p, is_active: newStatus } : p
      ));
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (partner) => {
    try {
      await axios.delete(`${BACKEND_URL}${config.endpoint}/${partner.id}?permanent=true`);
      setPartners(partners.filter(p => p.id !== partner.id));
      setDeleteConfirm(null);
    } catch (error) {
      alert('Failed to delete: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Filter partners based on search and show/hide toggle
  const filteredPartners = partners.filter(p => {
    // Filter by active status
    if (!showHidden && p.is_active === false) return false;
    
    // Filter by search term
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.location?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  });

  const activeCount = partners.filter(p => p.is_active !== false).length;
  const hiddenCount = partners.filter(p => p.is_active === false).length;
  const currentLimit = displaySettings[activeType];

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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={`Search ${config.name.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Show Hidden Toggle */}
          <button
            onClick={() => setShowHidden(!showHidden)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showHidden 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showHidden ? 'Showing Hidden' : 'Show Hidden'}
            {hiddenCount > 0 && (
              <span className="bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-xs">
                {hiddenCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Display Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm font-medium transition-colors"
            title="Display limits"
          >
            <Settings className="w-4 h-4" />
            Limits
            {currentLimit && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                {currentLimit}
              </span>
            )}
          </button>
          
          {/* Add New Button */}
          <button
            onClick={() => { setEditingPartner({}); setIsNewPartner(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-sm text-stone-600 mb-3 px-1">
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4 text-green-600" />
          {activeCount} active
        </span>
        <span className="flex items-center gap-1">
          <EyeOff className="w-4 h-4 text-stone-400" />
          {hiddenCount} hidden
        </span>
        {currentLimit && (
          <span className="flex items-center gap-1 text-blue-600">
            <Settings className="w-4 h-4" />
            Showing {Math.min(currentLimit, activeCount)} on website
          </span>
        )}
        {searchTerm && (
          <span className="text-stone-500">
            {filteredPartners.length} matching "{searchTerm}"
          </span>
        )}
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            {React.createElement(config.icon, { className: "w-12 h-12 mx-auto mb-3 opacity-50" })}
            <p>{searchTerm ? 'No results found' : showHidden ? 'No hidden partners' : `No ${config.name.toLowerCase()} yet`}</p>
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
                onToggleActive={handleToggleActive}
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

      {/* Display Settings Modal */}
      {showSettings && (
        <DisplaySettingsModal
          settings={displaySettings}
          onSave={handleSaveDisplaySettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Permanently Delete {deleteConfirm.name}?</h3>
            <p className="text-stone-600 text-sm mb-4">
              This will permanently remove this partner from the database. This cannot be undone.
            </p>
            <p className="text-amber-600 text-sm mb-6 bg-amber-50 p-3 rounded-lg">
              <strong>Tip:</strong> If you just want to hide this from the website, use the toggle switch instead.
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
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
