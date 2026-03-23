import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Eye, EyeOff, Hotel, UtensilsCrossed, Coffee, Umbrella, Flag } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { key: 'golf', label: 'Golf Courses', icon: Flag, color: 'emerald' },
  { key: 'hotels', label: 'Hotels', icon: Hotel, color: 'blue' },
  { key: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed, color: 'amber' },
  { key: 'cafe_bars', label: 'Cafes & Bars', icon: Coffee, color: 'orange' },
  { key: 'beach_clubs', label: 'Beach Clubs', icon: Umbrella, color: 'cyan' },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', toggle: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', toggle: 'bg-blue-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', toggle: 'bg-amber-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', toggle: 'bg-orange-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500', toggle: 'bg-cyan-500' },
};

export const DisplaySettingsTab = () => {
  const [settings, setSettings] = useState({});
  const [totalCounts, setTotalCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [settingsRes, partnersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/display-settings`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/all-partners`)
      ]);

      const s = settingsRes.data;
      const p = partnersRes.data;

      const counts = {
        golf: (p.golf_courses || []).length,
        hotels: (p.hotels || []).length,
        restaurants: (p.restaurants || []).length,
        cafe_bars: (p.cafe_bars || []).length,
        beach_clubs: (p.beach_clubs || []).length,
      };
      setTotalCounts(counts);

      // Normalize settings: ensure each category has show + limit
      const normalized = {};
      CATEGORIES.forEach(({ key }) => {
        const val = s[key];
        if (val && typeof val === 'object') {
          normalized[key] = {
            show: val.show !== false,
            limit: val.limit || counts[key],
          };
        } else if (typeof val === 'number') {
          normalized[key] = { show: true, limit: val };
        } else {
          normalized[key] = { show: true, limit: counts[key] };
        }
      });
      setSettings(normalized);
    } catch (err) {
      console.error('Error fetching display settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], show: !prev[key].show }
    }));
    setSaved(false);
  };

  const handleLimitChange = (key, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    const max = totalCounts[key] || 100;
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], limit: Math.min(num, max) }
    }));
    setSaved(false);
  };

  const handleShowAll = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], limit: totalCounts[key] || 100 }
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/api/display-settings`, settings, { withCredentials: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving display settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const reset = {};
    CATEGORIES.forEach(({ key }) => {
      reset[key] = { show: true, limit: totalCounts[key] || 100 };
    });
    setSettings(reset);
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-stone-500 mt-4 text-sm">Loading display settings...</p>
      </div>
    );
  }

  return (
    <div data-testid="display-settings-tab">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-stone-900">Display Settings</h3>
          <p className="text-sm text-stone-500 mt-1">Control which categories and how many venues appear on the homepage</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            data-testid="reset-display-settings-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Show All
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              saved ? 'bg-emerald-500' : 'bg-brand-charcoal hover:bg-brand-charcoal/90'
            } disabled:opacity-50`}
            data-testid="save-display-settings-btn"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label, icon: Icon, color }) => {
          const s = settings[key] || { show: true, limit: 100 };
          const total = totalCounts[key] || 0;
          const c = colorMap[color];

          return (
            <div
              key={key}
              className={`border rounded-xl p-4 transition-all ${
                s.show ? `${c.bg} ${c.border}` : 'bg-stone-50 border-stone-200 opacity-60'
              }`}
              data-testid={`display-setting-${key}`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Icon + Label */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.show ? c.bg : 'bg-stone-100'}`}>
                    <Icon className={`w-5 h-5 ${s.show ? c.icon : 'text-stone-400'}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${s.show ? c.text : 'text-stone-400'}`}>{label}</p>
                    <p className="text-xs text-stone-500">{total} total venues</p>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-4">
                  {/* Limit input */}
                  {s.show && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Show</span>
                      <input
                        type="number"
                        min="1"
                        max={total}
                        value={s.limit}
                        onChange={(e) => handleLimitChange(key, e.target.value)}
                        className="w-16 px-2 py-1.5 text-sm text-center border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-slate/30"
                        data-testid={`limit-input-${key}`}
                      />
                      <span className="text-xs text-stone-500">of {total}</span>
                      {s.limit < total && (
                        <button
                          onClick={() => handleShowAll(key)}
                          className="text-xs text-brand-slate hover:underline ml-1"
                          data-testid={`show-all-btn-${key}`}
                        >
                          All
                        </button>
                      )}
                    </div>
                  )}

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      s.show ? c.toggle : 'bg-stone-300'
                    }`}
                    data-testid={`toggle-${key}`}
                    title={s.show ? 'Click to hide this category on the website' : 'Click to show this category on the website'}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        s.show ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-lg">
        <p className="text-xs text-stone-500">
          Changes take effect immediately on the homepage after saving. Toggle a category off to hide it completely, 
          or adjust the limit to control how many venues are displayed.
        </p>
      </div>
    </div>
  );
};
