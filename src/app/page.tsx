'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PGCard, { PG } from '@/app/components/PGCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Compass, 
  Building2, 
  GraduationCap, 
  Sparkles, 
  ChevronRight,
  ArrowRight,
  Shield,
  Wifi,
  Coins,
  Utensils
} from 'lucide-react';

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

  // Mouse position tracking for parallax background
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize between -0.5 and 0.5
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  // Autocomplete Suggestions
  const suggestions = [
    { city: "Nearby", state: "Find what's around you", icon: "🧭", type: "Current location" },
    { city: "Guwahati", state: "Assam", icon: "🏢", type: "Popular with students" },
    { city: "Jorhat", state: "Assam", icon: "📍", type: "Popular with students" },
    { city: "Kolkata", state: "West Bengal", icon: "🌉", type: "Popular with students" },
    { city: "Shillong", state: "Meghalaya", icon: "📍", type: "Popular with students" },
    { city: "Dibrugarh", state: "Assam", icon: "📍", type: "Popular with students" },
    { city: "Darjeeling", state: "West Bengal", icon: "⛰️", type: "Popular with students" },
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
    }, 800000); // Set high or handle via layout
    setSearchPhase('completed');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit(locationInput);
    }
  };

  const getFilteredPgs = () => {
    let result = [...pgs];

    result = result.filter((p) => {
      const isGirls = p.name.toLowerCase().includes('girls') || p.id === 'pg-3';
      const isBoys = p.name.toLowerCase().includes('boys') || p.id === 'pg-5';
      
      if (pgType === 'girls') return isGirls;
      if (pgType === 'boys') return isBoys;
      return !isGirls && !isBoys; // Unisex
    });

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

  const mockPreferences = {
    hospital: false,
    streetlights: false,
    walkingDistance: false,
    wifi: false,
    ac: false,
    laundry: false,
    gym: false,
  };

  // Sparse, scattered images definitions with lots of white space
  const scatteredImages = [
    {
      url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
      title: 'Cozy Study Corner',
      top: '15%',
      left: '7%',
      rotate: '-8deg',
      parallaxFactor: 30, // px max offset
    },
    {
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
      title: 'Premium Lounge Room',
      top: '22%',
      right: '8%',
      rotate: '6deg',
      parallaxFactor: -25,
    },
    {
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
      title: 'Student Suite Apartment',
      bottom: '30%',
      left: '12%',
      rotate: '10deg',
      parallaxFactor: 35,
    },
    {
      url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80',
      title: 'Comfort Bedding',
      bottom: '18%',
      right: '10%',
      rotate: '-5deg',
      parallaxFactor: -40,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 relative overflow-x-hidden flex flex-col items-center selection:bg-blue-100 selection:text-blue-800">
      
      {/* premium SVG Grid background with radial fade-out mask */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full stroke-blue-500/[0.04] [mask-image:radial-gradient(85%_85%_at_50%_45%,white,transparent_80%)]">
          <defs>
            <pattern id="bg-grid-svg" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-grid-svg)" />
        </svg>
      </div>

      {/* Decorative Glow Overlays */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[130px] pointer-events-none z-0"></div>

      {/* Scattered PG Image Previews (Background Parallax) */}
      <AnimatePresence>
        {searchPhase === 'initial' && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
            {scatteredImages.map((img, idx) => {
              const xOffset = mousePos.x * img.parallaxFactor;
              const yOffset = mousePos.y * img.parallaxFactor;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8, y: 40 }}
                  animate={{ 
                    opacity: 0.28, 
                    scale: 1, 
                    y: 0,
                    x: xOffset,
                    z: yOffset,
                    rotate: img.rotate,
                  }}
                  exit={{ opacity: 0, scale: 0.8, y: -40, transition: { duration: 0.5, ease: 'easeInOut' } }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 70, 
                    damping: 20, 
                    delay: idx * 0.15 
                  }}
                  style={{
                    position: 'absolute',
                    top: img.top,
                    left: img.left,
                    right: img.right,
                  }}
                  className="w-48 h-60 rounded-3xl overflow-hidden glass border-2 border-white/60 p-2 shadow-2xl transition-shadow duration-500 hover:shadow-blue-500/5 select-none"
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden relative">
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      className="w-full h-full object-cover grayscale opacity-80"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/50 to-transparent p-3 pt-8">
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                        {img.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <header className="w-full max-w-7xl px-8 py-6 flex justify-between items-center z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="border border-blue-600 bg-blue-50/50 px-3.5 py-1.5 font-mono text-sm font-black tracking-widest text-blue-600 rounded-xl transition-all shadow-sm group-hover:bg-blue-600 group-hover:text-white select-none">
              ROOMVERSE
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Link
            href="/login"
            className="px-5 py-2.5 bg-white/70 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 text-slate-700 font-extrabold text-xs rounded-xl transition-all duration-300 shadow-sm backdrop-blur-md cursor-pointer"
          >
            Access Portals
          </Link>
        </motion.div>
      </header>

      {/* CENTRAL HERO & SEARCH COMPONENT */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-40 px-4">
        
        {/* Animated Headline (only in initial phase) */}
        <AnimatePresence>
          {searchPhase === 'initial' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
              className="text-center mb-8 max-w-xl select-none"
            >
              <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-blue-100/60 border border-blue-200/50 text-blue-700 rounded-full inline-flex items-center gap-1.5 mb-4 shadow-sm backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Premium Student Living
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                Find the perfect room <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  near your campus.
                </span>
              </h1>
              <p className="text-slate-500 text-sm mt-3 font-semibold max-w-md mx-auto leading-relaxed">
                Browse verified girls, boys, and unisex student PGs with smart preferences, mess menu integration, and safety scores.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DYNAMIC POSITION SEARCH BAR WRAPPER */}
        <motion.div 
          layout
          transition={{
            type: 'spring',
            stiffness: 85,
            damping: 18,
            mass: 1
          }}
          className={`w-full max-w-2xl px-2 text-center ${
            searchPhase === 'initial' 
              ? 'my-4' 
              : 'fixed bottom-8 left-1/2 -translate-x-1/2 z-50'
          }`}
        >
          {searchPhase === 'initial' && (
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-black tracking-widest text-blue-600 mb-3.5 uppercase text-left select-none ml-4 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 animate-spin-slow" /> Search location
            </motion.h2>
          )}

          {/* Search Bar container with Glassmorphism */}
          <div className="relative w-full glass-premium border border-white/70 rounded-[2rem] shadow-[0_15px_45px_rgba(37,99,235,0.06)] flex items-center p-1.5 transition-all focus-within:border-blue-400 focus-within:shadow-[0_20px_50px_rgba(37,99,235,0.1)]">
            
            {/* Option Selector: Girls PG / Boys PG / Unisex PG */}
            <div className="flex gap-1 p-1 border-r border-slate-200/50 pr-2 shrink-0 select-none">
              {(['girls', 'boys', 'unisex'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPgType(type)}
                  className={`px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    pgType === type
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white/60 border border-slate-200/40 text-slate-500 hover:text-slate-800 hover:bg-white/90 shadow-sm'
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

            {/* Search trigger button */}
            <button 
              onClick={() => handleSearchSubmit(locationInput)}
              className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shrink-0 shadow-md shadow-blue-500/10 ml-auto"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Autocomplete Dropdown with ease-out Framer Motion */}
          <AnimatePresence>
            {showAutocomplete && (
              <motion.div 
                ref={autocompleteRef}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-2 right-2 mt-3 bg-white/95 border border-slate-200/80 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] z-50 p-2.5 max-h-72 overflow-y-auto backdrop-blur-xl"
              >
                {filteredSuggestions.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4 font-semibold">No locations found</p>
                ) : (
                  filteredSuggestions.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ backgroundColor: 'rgba(37,99,235,0.04)' }}
                      onClick={() => {
                        const val = item.city === 'Nearby' ? '' : item.city;
                        setLocationInput(val);
                        handleSearchSubmit(val);
                      }}
                      className="flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-colors text-left"
                    >
                      <span className="text-xl bg-blue-50 p-2.5 rounded-xl text-blue-600 shadow-sm flex items-center justify-center w-10 h-10 select-none">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-extrabold text-xs text-slate-800 block truncate">
                          {item.city}{item.city !== 'Nearby' ? `, ${item.state}` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block mt-0.5">
                          {item.city === 'Nearby' ? item.state : item.type}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* DYNAMIC FADE IN MAIN CONTENT AREA */}
      {searchPhase !== 'initial' && (
        <motion.main 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="w-full flex-1 max-w-6xl px-4 md:px-8 py-20 flex flex-col gap-8 select-none z-10"
        >
          {/* Search Result Headers */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded border border-blue-100 select-none">
                ROOMVERSE listings
              </span>
              <h2 className="text-2xl font-black text-slate-800 mt-2">
                Popular homes {selectedLocation ? `in ${selectedLocation}` : 'nearby'}
              </h2>
            </div>
            <div className="flex gap-2">
              <span className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 font-bold shadow-sm">
                Type: {pgType === 'unisex' ? 'Unisex' : pgType === 'girls' ? 'Girls Only' : 'Boys Only'}
              </span>
              <span className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 font-bold shadow-sm">
                {filteredPgs.length} spaces matching
              </span>
            </div>
          </div>

          {/* Listings Display Grid */}
          {fetchLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-slate-200">
            {[
              { title: '💰 Budget Sorting', desc: 'Adjust prices to match your exact monthly budget thresholds.', icon: <Coins className="w-5 h-5 text-blue-600" /> },
              { title: '🧩 Compatibility Index', desc: 'Verify safety factors, wifi availability, and walking distances.', icon: <Wifi className="w-5 h-5 text-blue-600" /> },
              { title: '🛡️ Local Safety Scores', desc: 'Examine metrics on CCTV, emergency support, and local guards.', icon: <Shield className="w-5 h-5 text-blue-600" /> },
              { title: '🍽️ Daily Mess Menus', desc: 'Browse full daily breakfast, lunch, and dinner plans.', icon: <Utensils className="w-5 h-5 text-blue-600" /> }
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-white/70 border border-slate-200/80 p-5 rounded-2xl shadow-sm backdrop-blur-md hover:border-blue-400 transition-all duration-300"
              >
                <span className="bg-blue-50 p-2.5 rounded-xl inline-block">{feat.icon}</span>
                <h4 className="font-extrabold text-slate-800 text-sm mt-3">{feat.title}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-semibold">{feat.desc}</p>
              </div>
            ))}
          </div>
        </motion.main>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-8 border-t border-slate-200/80 relative z-10 bg-white mt-auto">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          © 2026 ROOMVERSE Accommodation Systems. Built for student comfort & safety.
        </p>
      </footer>
    </div>
  );
}
