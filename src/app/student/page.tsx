'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import PGCard, { PG } from '@/app/components/PGCard';
import { Preferences } from '@/app/components/CompatibilityQuiz';
import PGDetailsModal from '@/app/components/PGDetailsModal';
import ChatSimulator from '@/app/components/ChatSimulator';
import CallSimulator from '@/app/components/CallSimulator';

// Premium MessCard Component for light theme
interface MessCardProps {
  pg: PG;
  selectedDay: string;
  onViewDetails: (pg: PG) => void;
  onChat: (pg: PG) => void;
}

function MessCard({ pg, selectedDay, onViewDetails, onChat }: MessCardProps) {
  const getAverageFoodRating = () => {
    if (pg.reviews.length === 0) return 'N/A';
    const sum = pg.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / pg.reviews.length).toFixed(1);
  };

  const dayMenu = pg.messMenu[selectedDay] || { breakfast: 'Not available', lunch: 'Not available', dinner: 'Not available' };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full overflow-hidden transform hover:-translate-y-1">
      {/* Mess Header Banner */}
      <div className="bg-gradient-to-r from-royal-green to-emerald-800 p-5 text-white relative">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded text-emerald-100">
              🍽️ PG Mess Services
            </span>
            <h4 className="font-bold text-lg mt-1 tracking-tight">{pg.name} Mess</h4>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 text-center">
            <span className="text-xs text-emerald-100 font-bold block">Rating</span>
            <span className="text-sm font-black text-amber-300">★ {getAverageFoodRating()}</span>
          </div>
        </div>
        <p className="text-xs text-emerald-100/80 flex items-center gap-1 mt-2">
          📍 {pg.location}
        </p>
      </div>

      {/* Selected Day's Menu */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {selectedDay} Menu
            </h5>
            <span className="text-[10px] bg-emerald-50 text-royal-green px-2 py-0.5 rounded-full font-bold">
              Today's Meal Plan
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-[16px] bg-slate-50 border border-slate-100">
              <span className="text-lg">🍳</span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Breakfast</span>
                <span className="text-xs font-semibold text-slate-800">{dayMenu.breakfast || 'Not Set'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-[16px] bg-slate-50 border border-slate-100">
              <span className="text-lg">🍚</span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lunch</span>
                <span className="text-xs font-semibold text-slate-800">{dayMenu.lunch || 'Not Set'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-[16px] bg-slate-50 border border-slate-100">
              <span className="text-lg">🍲</span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dinner</span>
                <span className="text-xs font-semibold text-slate-800">{dayMenu.dinner || 'Not Set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <button
            onClick={() => onViewDetails(pg)}
            className="w-full py-2.5 bg-royal-green hover:bg-royal-green-hover text-white font-bold rounded-[14px] text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-800/10"
          >
            📋 View Weekly Menu & Reviews
          </button>
          <button
            onClick={() => onChat(pg)}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-royal-green font-extrabold rounded-[14px] text-xs transition-colors border border-emerald-200/60 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            💬 Discuss Mess with Owner
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Redirect if not student
  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // PG Listings State
  const [pgs, setPgs] = useState<PG[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [priceRange, setPriceRange] = useState<number>(25000);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Redesign Tab & Filter States
  const [activeSection, setActiveSection] = useState<'pg' | 'mess'>('pg');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Preferences State
  const [preferences, setPreferences] = useState<Preferences>({
    hospital: false,
    streetlights: false,
    walkingDistance: false,
    wifi: false,
    ac: false,
    laundry: false,
    gym: false,
  });

  // Modal / Overlay States
  const [selectedPg, setSelectedPg] = useState<PG | null>(null);
  const [activeChatPg, setActiveChatPg] = useState<PG | null>(null);
  const [activeCallPg, setActiveCallPg] = useState<PG | null>(null);

  // Fetch PGs from API
  const fetchPgs = async () => {
    try {
      const response = await fetch('/api/pgs');
      const data = await response.json();
      setPgs(data);
    } catch (err) {
      console.error('Failed to load PGs', err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchPgs();
    }
  }, [user]);

  const handlePreferenceChange = (key: keyof Preferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddReview = (pgId: string, updatedPg: PG) => {
    setPgs((prev) => prev.map((p) => (p.id === pgId ? updatedPg : p)));
    setSelectedPg(updatedPg); // Update selected modal state if open
  };

  // Filter and Sort Listings
  const getFilteredPgs = () => {
    let result = [...pgs];

    // Text Search (common)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    // Compatibility Preferences Filter
    const activePrefs = Object.entries(preferences).filter(([_, val]) => val);
    if (activePrefs.length > 0) {
      result = result.filter((p) => {
        return activePrefs.every(([key]) => p.compatibility[key as keyof Preferences]);
      });
    }

    if (activeSection === 'pg') {
      // Price Filter
      result = result.filter((p) => p.price <= priceRange);

      // Price Sorting
      if (sortOrder === 'asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (sortOrder === 'desc') {
        result.sort((a, b) => b.price - a.price);
      }
    } else {
      // Mess Rating Filter
      if (minRating > 0) {
        result = result.filter((p) => {
          if (p.reviews.length === 0) return false;
          const sum = p.reviews.reduce((acc, r) => acc + r.rating, 0);
          const avg = sum / p.reviews.length;
          return avg >= minRating;
        });
      }
    }

    return result;
  };

  const filteredPgs = getFilteredPgs();

  if (loading || !user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-royal-green rounded-full animate-spin"></div>
      </div>
    );
  }

  const isFilterActive = sortOrder || priceRange < 25000 || minRating > 0 || Object.values(preferences).some(Boolean);

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden dot-grid flex flex-col">
      {/* Soft Green overlays */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-royal-green/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none"></div>

      {/* Navbar / Display Header Window - White background & drop shadow */}
      <nav className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40 shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-all">
        {/* Left: Brand Logo & Section Menu Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-royal-green font-bold shadow-sm">🏠</div>
            <span className="text-lg font-black bg-gradient-to-r from-royal-green to-emerald-800 bg-clip-text text-transparent">
              NestSeeker
            </span>
          </div>
          
          {/* PG Accommodation / Mess tabs switcher shifted inside header */}
          <div className="flex items-center gap-4 border-l border-slate-200/80 pl-4 sm:pl-6">
            <button
              onClick={() => {
                setActiveSection('pg');
                setShowFilterDropdown(false);
              }}
              className={`flex items-center gap-1.5 pb-1 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeSection === 'pg'
                  ? 'border-royal-green text-royal-green'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>🏠</span>
              <span>Accommodation</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('mess');
                setShowFilterDropdown(false);
              }}
              className={`flex items-center gap-1.5 pb-1 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeSection === 'mess'
                  ? 'border-royal-green text-royal-green'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>🍽️</span>
              <span>Mess Menu</span>
            </button>
          </div>
        </div>

        {/* Center: Consolidated Search & Filter Menu adjacent to search bar */}
        <div className="flex items-center gap-2 w-full md:w-auto max-w-md relative">
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full px-4.5 py-2 transition-all shadow-sm">
            <svg className="w-4 h-4 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={activeSection === 'pg' ? "Search PG or location..." : "Search mess menu or location..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-slate-800 focus:outline-none text-xs font-bold w-full placeholder-slate-400 p-0"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="text-slate-400 hover:text-slate-600 font-extrabold text-xs px-1 cursor-pointer shrink-0"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdown Icon Button - shifted right besides search bar */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${
                showFilterDropdown || isFilterActive
                  ? 'bg-emerald-50 border-royal-green text-royal-green shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
              title="Filter Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
            </button>

            {/* Floating Filter Dropdown Popover */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-100 rounded-[24px] shadow-xl p-5 z-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filter Settings</span>
                  {isFilterActive && (
                    <button
                      onClick={() => {
                        setSortOrder('');
                        setPriceRange(25000);
                        setMinRating(0);
                        setSelectedDay('Monday');
                        setPreferences({
                          hospital: false,
                          streetlights: false,
                          walkingDistance: false,
                          wifi: false,
                          ac: false,
                          laundry: false,
                          gym: false,
                        });
                      }}
                      className="text-[10px] text-royal-green hover:underline font-extrabold cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {activeSection === 'pg' ? (
                  <>
                    {/* Sort Rent Price */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sort Rent Price</label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-royal-green cursor-pointer font-bold"
                      >
                        <option value="">Default (None)</option>
                        <option value="asc">Price: Low to High</option>
                        <option value="desc">Price: High to Low</option>
                      </select>
                    </div>

                    {/* Price Range Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <label className="text-[9px] font-black uppercase tracking-wider">Max Rent Price</label>
                        <span className="text-royal-green font-bold">₹{priceRange.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="25000"
                        step="500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-royal-green"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>₹5,000</span>
                        <span>₹25,000</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Selected Menu Day */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Mess Menu Day</label>
                      <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-royal-green cursor-pointer font-bold"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>

                    {/* Min Mess Rating */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Min Mess Rating</label>
                      <select
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-royal-green cursor-pointer font-bold"
                      >
                        <option value="0">Any Rating</option>
                        <option value="3">3.0+ Stars</option>
                        <option value="4">4.0+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Compatibility Preferences Selector inside Dropdown */}
                <div className="space-y-2 pt-2.5 border-t border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Amenities & Compatibility</label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {[
                      { key: 'wifi', label: 'Wi-Fi Included', icon: '📶' },
                      { key: 'ac', label: 'Air Conditioning', icon: '❄️' },
                      { key: 'laundry', label: 'Laundry Service', icon: '🧺' },
                      { key: 'gym', label: 'In-house Gym', icon: '🏋️' },
                      { key: 'hospital', label: 'Nearby Hospital', icon: '🏥' },
                      { key: 'streetlights', label: 'Streetlights Lit', icon: '💡' },
                      { key: 'walkingDistance', label: 'Walk to College', icon: '🚶' }
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all duration-200 text-xs font-semibold ${
                          preferences[item.key as keyof Preferences]
                            ? 'bg-emerald-50/60 border-royal-green/30 text-royal-green'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={preferences[item.key as keyof Preferences]}
                          onChange={(e) => handlePreferenceChange(item.key as keyof Preferences, e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-royal-green border-slate-300 focus:ring-royal-green accent-royal-green cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Profile Info & Logout */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Student</span>
            <span className="text-xs font-bold text-slate-800">{user.name}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-red-200 hover:text-red-600 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Workspace - Full Width without Sidebar */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col gap-6 relative z-10">
        
        {/* display header only showing Accommodation / Mess detail */}
        <div className="flex justify-between items-center bg-white p-4 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {activeSection === 'pg' ? 'Available PG Accommodations' : 'Verified Mess & Food Plans'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeSection === 'pg' 
                ? 'Showing accommodation options matching your filters' 
                : `Browse weekly breakfast, lunch, and dinner plans for ${selectedDay}`}
            </p>
          </div>
          <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-bold shadow-sm shrink-0">
            {filteredPgs.length} {activeSection === 'pg' ? 'listings' : 'mess options'} found
          </span>
        </div>

        {/* Listings Display Grid - Expanded to full width 3-column setup */}
        {fetchLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-3 border-emerald-100 border-t-royal-green rounded-full animate-spin"></div>
          </div>
        ) : filteredPgs.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-4">
            <span className="text-4xl">🔍</span>
            <h4 className="font-extrabold text-lg text-slate-800">No options match your filters</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try widening your price range, resetting filters in the dropdown next to the search bar, or searching for a different location.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredPgs.map((pg) => 
              activeSection === 'pg' ? (
                <PGCard
                  key={pg.id}
                  pg={pg}
                  selectedPreferences={preferences}
                  onViewDetails={setSelectedPg}
                  onCall={setActiveCallPg}
                  onChat={setActiveChatPg}
                />
              ) : (
                <MessCard
                  key={pg.id}
                  pg={pg}
                  selectedDay={selectedDay}
                  onViewDetails={setSelectedPg}
                  onChat={setActiveChatPg}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Floating Modals and Interactive Panels */}
      {selectedPg && (
        <PGDetailsModal
          pg={selectedPg}
          onClose={() => setSelectedPg(null)}
          onAddReview={handleAddReview}
        />
      )}

      {activeCallPg && (
        <CallSimulator
          pg={activeCallPg}
          ownerName={activeCallPg.id === 'pg-1' ? 'Vikram Malhotra' : activeCallPg.id === 'pg-3' ? 'Rajesh Kumar' : 'Accommodations Owner'}
          onClose={() => setActiveCallPg(null)}
        />
      )}

      {activeChatPg && (
        <ChatSimulator
          pg={activeChatPg}
          ownerName={activeChatPg.id === 'pg-1' ? 'Vikram Malhotra' : activeChatPg.id === 'pg-3' ? 'Rajesh Kumar' : 'Accommodations Owner'}
          onClose={() => setActiveChatPg(null)}
        />
      )}
    </div>
  );
}
