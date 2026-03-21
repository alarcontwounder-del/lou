import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Check, X, Search, Image, Upload, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { key: 'hotels', label: 'Hotels' },
  { key: 'restaurants', label: 'Restaurants' },
  { key: 'cafe_bars', label: 'Cafes & Bars' },
  { key: 'beach_clubs', label: 'Beach Clubs' },
  { key: 'golf_courses', label: 'Golf Courses' },
];

export const PartnerImagesTab = () => {
  const [partners, setPartners] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [activeCategory, setActiveCategory] = useState('hotels');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/all-partners`);
      setPartners(res.data);
    } catch { toast.error('Failed to load partners'); }
    finally { setLoading(false); }
  };

  const uploadFile = async (file, partnerId) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(partnerId);
    try {
      const uploadRes = await axios.post(`${BACKEND_URL}/api/admin/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      const imageUrl = `${BACKEND_URL}${uploadRes.data.url}`;
      await axios.patch(`${BACKEND_URL}/api/admin/partner/${partnerId}/image`, { image: imageUrl }, { withCredentials: true });
      setPartners(prev => {
        const updated = { ...prev };
        for (const cat of Object.keys(updated)) {
          if (Array.isArray(updated[cat])) {
            updated[cat] = updated[cat].map(p => p.id === partnerId ? { ...p, image: imageUrl } : p);
          }
        }
        return updated;
      });
      toast.success('Image uploaded & saved');
      setEditingId(null);
      setEditUrl('');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (partnerId) => {
    if (!editUrl.trim()) return;
    setSaving(true);
    try {
      await axios.patch(`${BACKEND_URL}/api/admin/partner/${partnerId}/image`, { image: editUrl.trim() }, { withCredentials: true });
      setPartners(prev => {
        const updated = { ...prev };
        for (const cat of Object.keys(updated)) {
          if (Array.isArray(updated[cat])) {
            updated[cat] = updated[cat].map(p => p.id === partnerId ? { ...p, image: editUrl.trim() } : p);
          }
        }
        return updated;
      });
      setEditingId(null);
      setEditUrl('');
      toast.success('Image updated');
    } catch { toast.error('Failed to update image'); }
    finally { setSaving(false); }
  };

  const handleDrop = useCallback((e, partnerId) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file, partnerId);
    } else {
      toast.error('Please drop an image file');
    }
  }, []);

  const handleFileSelect = (e, partnerId) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, partnerId);
  };

  const items = (partners[activeCategory] || []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-12 text-stone-500">Loading partners...</div>;

  return (
    <div data-testid="partner-images-tab">
      {/* Category tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setSearch(''); setEditingId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat.key ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            data-testid={`cat-${cat.key}`}>
            {cat.label} ({(partners[cat.key] || []).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300" data-testid="partner-search" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map(partner => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            isEditing={editingId === partner.id}
            editUrl={editUrl}
            saving={saving}
            uploading={uploading === partner.id}
            onEdit={() => { setEditingId(partner.id); setEditUrl(partner.image || ''); }}
            onCancel={() => { setEditingId(null); setEditUrl(''); }}
            onUrlChange={setEditUrl}
            onSave={() => handleSave(partner.id)}
            onDrop={(e) => handleDrop(e, partner.id)}
            onFileSelect={(e) => handleFileSelect(e, partner.id)}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center py-8 text-stone-400 text-sm">No partners found</p>
      )}
    </div>
  );
};

function PartnerCard({ partner, isEditing, editUrl, saving, uploading, onEdit, onCancel, onUrlChange, onSave, onDrop, onFileSelect }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputId = `file-${partner.id}`;

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden group" data-testid={`partner-card-${partner.id}`}>
      <div
        className={`relative aspect-[4/3] bg-stone-100 transition-colors ${dragOver ? 'ring-2 ring-stone-500 ring-inset bg-stone-200' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { setDragOver(false); onDrop(e); }}
      >
        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100">
            <Loader2 className="w-6 h-6 text-stone-500 animate-spin" />
            <p className="text-[10px] text-stone-400 mt-1.5">Uploading...</p>
          </div>
        ) : (
          <>
            <img src={partner.image} alt={partner.name} className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }} />
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-800/40">
                <p className="text-white text-xs font-medium">Drop image here</p>
              </div>
            )}
          </>
        )}
        {!uploading && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <label htmlFor={fileInputId} className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white cursor-pointer" title="Upload image">
              <Upload className="w-3.5 h-3.5 text-stone-600" />
            </label>
            <input id={fileInputId} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
            <button onClick={onEdit} className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white" title="Paste URL" data-testid={`edit-${partner.id}`}>
              <Pencil className="w-3.5 h-3.5 text-stone-600" />
            </button>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-stone-800 truncate">{partner.name}</p>
        <p className="text-[10px] text-stone-400 truncate">{partner.location || partner.municipality || ''}</p>
      </div>

      {/* URL edit panel */}
      {isEditing && (
        <div className="px-2.5 pb-2.5">
          <input type="text" value={editUrl} onChange={e => onUrlChange(e.target.value)} placeholder="Paste image URL..."
            className="w-full px-2 py-1.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 mb-1.5"
            data-testid={`edit-url-${partner.id}`} autoFocus />
          <div className="flex gap-1.5">
            <button onClick={onSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-1 py-1 text-xs bg-stone-700 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
              data-testid={`save-${partner.id}`}>
              <Check className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onCancel}
              className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
              data-testid={`cancel-${partner.id}`}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
