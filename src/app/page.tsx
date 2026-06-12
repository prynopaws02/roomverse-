'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PGCard, { PG } from '@/app/components/PGCard';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Search Screen Phase States
  const [searchPhase, setSearchPhase] = useState<'initial' | 'transitioning' | 'completed'>('initial');
  const [pgType, setPgType] = useState<'girls' | 'boys' | 'unisex'>('unisex');
  const [locationInput, setLocationInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // PG Listings State
  const [pgs, setPgs] = useState<PG[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Automatic redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'owner') router.push('/owner');
      else router.push('/student');
    }
  }, [user, loading, router]);

  // Fetch mock PGs for landing page display
  useEffect(() => {
    const fetchPgs = async () => {
      try {
        const response = await fetch('/api/pgs');
        const data = await response.json();
        setPgs(data);
      } catch (err) {
        console.error('Failed to load listings', err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchPgs();
  }, []);

  // Click outside listener for autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete Suggestions Mock matching user visual image
  const suggestions = [
    { city: "Nearby", state: "Find what's around you", icon: "🧭", type: "Current location" },
    { city: "Guwahati", state: "Assam", icon: "🏢", type: "Popular with travelers" },
    { city: "Jorhat", state: "Assam", icon: "📍", type: "Popular with travelers" },
    { city: "Kolkata", state: "West Bengal", icon: "🌉", type: "Popular with travelers" },
    { city: "Shillong", state: "Meghalaya", icon: "📍", type: "Popular with travelers" },
    { city: "Dibrugarh", state: "Assam", icon: "📍", type: "Popular with travelers" },
    { city: "Darjeeling", state: "West Bengal", icon: "⛰️", type: "Popular with travelers" },
  ];

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.city.toLowerCase().includes(locationInput.toLowerCase()) ||
      s.state.toLowerCase().includes(locationInput.toLowerCase())
  );

  const handleSearchSubmit = (locationValue: string) => {
    setSelectedLocation(locationValue);
    setShowAutocomplete(false);
    setSearchPhase('transitioning');
    
    // Slow transition to main page content
    setTimeout(() => {
      setSearchPhase('completed');
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit(locationInput);
    }
  };

  // Filter listings based on gender type and location
  const getFilteredPgs = () => {
    let result = [...pgs];

    // Gender Filter
    result = result.filter((p) => {
      const isGirls = p.name.toLowerCase().includes('girls') || p.id === 'pg-3';
      const isBoys = p.name.toLowerCase().includes('boys') || p.id === 'pg-5';
      
      if (pgType === 'girls') return isGirls;
      if (pgType === 'boys') return isBoys;
      return !isGirls && !isBoys; // Unisex
    });

    // Location Filter
    if (selectedLocation.trim()) {
      const loc = selectedLocation.toLowerCase();
      result = result.filter(
        (p) =>
          p.location.toLowerCase().includes(loc) ||
          p.name.toLowerCase().includes(loc)
      );
    }

    return result;
  };

  const filteredPgs = getFilteredPgs();

  // Preferences blank mocks for listings display
  const mockPreferences = {
    hospital: false,
    streetlights: false,
    walkingDistance: false,
    wifi: false,
    ac: false,
    laundry: false,
    gym: false,
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden dot-grid flex flex-col items-center">
      {/* Soft Green Glow overlays */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-royal-green/3 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-600/3 blur-[120px] pointer-events-none"></div>
      
      {/* MONOSPACE GREEN OUTLINE LOGO at top left */}
      <div className="absolute top-8 left-8 z-30">
        <div className="border-2 border-royal-green px-3 py-1 font-mono text-lg font-black tracking-widest text-royal-green select-none">
          ROOMVERSE
        </div>
      </div>

      {/* Access Portals Header Button */}
      <div className="absolute top-8 right-8 z-30">
        <Link
          href="/login"
          className="px-5 py-2.5 bg-white border border-slate-200 hover:border-royal-green hover:text-royal-green text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Access Portals
        </Link>
      </div>

      {/* DYNAMIC POSITION SEARCH BAR WRAPPER */}
      <div 
        className={`fixed z-40 px-6 w-full max-w-2xl text-center transition-all duration-1000 ease-in-out ${
          searchPhase === 'initial' 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
            : 'bottom-10 left-1/2 -translate-x-1/2'
        }`}
      >
        {searchPhase === 'initial' && (
          <h2 className="text-xs font-black tracking-widest text-royal-green mb-3 uppercase text-left select-none ml-4 animate-in fade-in duration-300">
            Where?
          </h2>
        )}

        {/* Search Bar container styled with peach outline backdrop */}
        <div className="relative w-full bg-[#fdf2f2] border-2 border-[#f5b7b1]/80 hover:border-royal-green rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.06)] flex items-center p-1.5 transition-all focus-within:bg-white focus-within:border-royal-green">
          
          {/* Option Selector: Girls PG / Boys PG / Unisex PG */}
          <div className="flex gap-1 p-1 border-r border-slate-200/80 pr-2 shrink-0 select-none">
            {(['girls', 'boys', 'unisex'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPgType(type)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  pgType === type
                    ? 'bg-royal-green text-white shadow-sm'
                    : 'bg-white border border-slate-200/60 text-slate-500 hover:text-slate-700 shadow-sm'
                }`}
              >
                {type === 'unisex' ? 'Unisex' : type === 'girls' ? 'Girls' : 'Boys'}
              </button>
            ))}
          </div>

          {/* Location text input */}
          <div className="flex-1 px-4 py-1.5 flex flex-col text-left relative min-w-0">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Enter location or campus landmark..."
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowAutocomplete(true);
              }}
              onFocus={() => setShowAutocomplete(true)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none text-slate-800 focus:outline-none text-xs font-bold p-0 placeholder-slate-400 w-full"
            />
          </div>

          {/* Search trigger icon button */}
          <button 
            onClick={() => handleSearchSubmit(locationInput)}
            className="h-10 w-10 rounded-full bg-royal-green text-white flex items-center justify-center cursor-pointer hover:bg-emerald-800 transition-colors shrink-0 shadow-md ml-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* AutocompleteDropdown matches picture style */}
        {showAutocomplete && (
          <div 
            ref={autocompleteRef}
            className="absolute left-6 right-6 mt-3 bg-white border border-slate-200 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 p-2.5 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-250"
          >
            {filteredSuggestions.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4 font-semibold">No locations found</p>
            ) : (
              filteredSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const val = item.city === 'Nearby' ? '' : item.city;
                    setLocationInput(val);
                    handleSearchSubmit(val);
                  }}
                  className="flex items-center gap-3.5 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors"
                >
                  <span className="text-xl bg-slate-100 p-2 rounded-xl text-slate-500 shadow-sm flex items-center justify-center w-10 h-10 select-none">
                    {item.icon}
                  </span>
                  <div className="text-left flex-1 min-w-0">
                    <span className="font-extrabold text-xs text-slate-800 block truncate">
                      {item.city}{item.city !== 'Nearby' ? `, ${item.state}` : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block mt-0.5">
                      {item.city === 'Nearby' ? item.state : item.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* DYNAMIC FADE IN MAIN CONTENT AREA */}
      {searchPhase !== 'initial' && (
        <main 
          className={`w-full flex-1 max-w-6xl px-4 md:px-8 py-24 flex flex-col gap-8 transition-opacity duration-1000 select-none ${
            searchPhase === 'completed' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Search Result Headers */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black text-royal-green uppercase bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 select-none">
                ROOMVERSE listings
              </span>
              <h2 className="text-2xl font-black text-slate-800 mt-2">
                Popular homes {selectedLocation ? `in ${selectedLocation}` : 'nearby'}
              </h2>
            </div>
            <div className="flex gap-2">
              <span className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-bold shadow-sm">
                Type: {pgType === 'unisex' ? 'Unisex' : pgType === 'girls' ? 'Girls Only' : 'Boys Only'}
              </span>
              <span className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-bold shadow-sm">
                {filteredPgs.length} spaces matching
              </span>
            </div>
          </div>

          {/* Listings Display Grid */}
          {fetchLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-3 border-emerald-100 border-t-royal-green rounded-full animate-spin"></div>
            </div>
          ) : filteredPgs.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
              <span className="text-4xl">🔍</span>
              <h4 className="font-extrabold text-lg text-slate-800">No ROOMVERSE spaces found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No matching accommodations. Try changing your search query or selecting a different gender option.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPgs.map((pg) => (
                <PGCard
                  key={pg.id}
                  pg={pg}
                  selectedPreferences={mockPreferences}
                  onViewDetails={() => router.push('/login')}
                  onCall={() => router.push('/login')}
                  onChat={() => router.push('/login')}
                />
              ))}
            </div>
          )}

          {/* Product Highlights Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-slate-100">
            {[
              { title: '💰 Pay & Sorting', desc: 'Adjust prices to match your exact monthly budget thresholds.', icon: '🏷️' },
              { title: '🧩 Compatibility Index', desc: 'Verify safety factors, wifi availability, and walking distances.', icon: '🧬' },
              { title: '🛡️ Local Safety Scores', desc: 'Examine metrics on CCTV, emergency support, and local guards.', icon: '🔒' },
              { title: '🍽️ Daily Mess Menus', desc: 'Browse full daily breakfast, lunch, and dinner plans.', icon: '⭐' }
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
              >
                <span className="text-2xl">{feat.icon}</span>
                <h4 className="font-extrabold text-slate-800 text-sm mt-3">{feat.title}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-semibold">{feat.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-8 border-t border-slate-150 relative z-10 bg-white mt-auto">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          © 2026 ROOMVERSE Accommodation Systems. Built for student comfort & safety.
        </p>
      </footer>
    </div>
  );
}
