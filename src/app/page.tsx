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
  Sparkles, 
  ChevronRight,
  Shield,
  Wifi,
  Coins,
  Utensils
} from 'lucide-react';

// Large collection of mock student homes / PGs with varying aspect ratios
const BACKGROUND_CARDS = [
  { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80', x: '5%', y: '10%', rot: -6, ratio: 'aspect-[4/3]', speed: 0.02 },
  { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80', x: '22%', y: '8%', rot: 4, ratio: 'aspect-[16/10]', speed: -0.015 },
  { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80', x: '40%', y: '12%', rot: -3, ratio: 'aspect-square', speed: 0.025 },
  { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80', x: '60%', y: '6%', rot: 8, ratio: 'aspect-[3/2]', speed: -0.01 },
  { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80', x: '82%', y: '14%', rot: -5, ratio: 'aspect-[4/3]', speed: 0.018 },
  
  { url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80', x: '3%', y: '35%', rot: 8, ratio: 'aspect-[16/10]', speed: -0.022 },
  { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', x: '18%', y: '32%', rot: -4, ratio: 'aspect-[3/2]', speed: 0.012 },
  { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80', x: '35%', y: '38%', rot: 5, ratio: 'aspect-square', speed: -0.018 },
  { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80', x: '52%', y: '28%', rot: -7, ratio: 'aspect-[4/3]', speed: 0.03 },
  { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80', x: '70%', y: '34%', rot: 6, ratio: 'aspect-[16/10]', speed: -0.014 },
  { url: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=400&q=80', x: '88%', y: '30%', rot: -8, ratio: 'aspect-[3/2]', speed: 0.02 },

  { url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80', x: '6%', y: '62%', rot: -5, ratio: 'aspect-[3/2]', speed: 0.015 },
  { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', x: '24%', y: '58%', rot: 7, ratio: 'aspect-square', speed: -0.025 },
  { url: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=400&q=80', x: '42%', y: '65%', rot: -4, ratio: 'aspect-[16/10]', speed: 0.012 },
  { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80', x: '58%', y: '55%', rot: 9, ratio: 'aspect-[4/3]', speed: -0.02 },
  { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', x: '78%', y: '60%', rot: -6, ratio: 'aspect-[3/2]', speed: 0.018 },
  { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=400&q=80', x: '92%', y: '58%', rot: 5, ratio: 'aspect-square', speed: -0.01 },

  { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', x: '10%', y: '84%', rot: 8, ratio: 'aspect-[16/10]', speed: -0.018 },
  { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80', x: '30%', y: '82%', rot: -6, ratio: 'aspect-[4/3]', speed: 0.02 },
  { url: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=400&q=80', x: '50%', y: '85%', rot: -3, ratio: 'aspect-[3/2]', speed: -0.015 },
  { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=400&q=80', x: '72%', y: '80%', rot: 6, ratio: 'aspect-square', speed: 0.025 },
  { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80', x: '88%', y: '86%', rot: -4, ratio: 'aspect-[16/10]', speed: -0.012 },
];

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

  // Tracking mouse coordinate offsets for parallax and cursor glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 600, y: 400 });
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize cursor coordinate offset between -0.5 and 0.5 for parallax
      const x = (e.clientX / (dimensions.width || 1)) - 0.5;
      const y = (e.clientY / (dimensions.height || 1)) - 0.5;
      setMousePos({ x, y });
      
      // Update coordinates for cursor glow position
      setGlowPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dimensions]);

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
    { city: "Nearby", state: "Find what's around you", icon: <Compass className="w-5 h-5 text-blue-400" />, type: "Current location" },
    { city: "Guwahati", state: "Assam", icon: <Building2 className="w-5 h-5 text-blue-400" />, type: "Popular with students" },
    { city: "Jorhat", state: "Assam", icon: <MapPin className="w-5 h-5 text-blue-400" />, type: "Popular with students" },
    { city: "Kolkata", state: "West Bengal", icon: <Building2 className="w-5 h-5 text-blue-400" />, type: "Popular with students" },
    { city: "Shillong", state: "Meghalaya", icon: <MapPin className="w-5 h-5 text-blue-400" />, type: "Popular with students" },
    { city: "Dibrugarh", state: "Assam", icon: <MapPin className="w-5 h-5 text-blue-400" />, type: "Popular with students" },
    { city: "Darjeeling", state: "West Bengal", icon: <Compass className="w-5 h-5 text-blue-400" />, type: "Popular with students" },
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
    
    setTimeout(() => {
      setSearchPhase('completed');
    }, 450);
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

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 relative overflow-x-hidden flex flex-col items-center selection:bg-blue-900/40 selection:text-blue-200">
      
      {/* Spotlight follower overlay reveals the grid / background cards under the cursor */}
      <div 
        className="cursor-glow-element hidden md:block" 
        style={{
          left: `${glowPos.x}px`,
          top: `${glowPos.y}px`
        }} 
      />

      {/* Sparse Background SVG Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full stroke-blue-500/[0.06] [mask-image:radial-gradient(90%_90%_at_50%_45%,white,transparent_80%)]">
          <defs>
            <pattern id="bg-grid-svg" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-grid-svg)" />
        </svg>
      </div>

      {/* Dark overlay mask that gets removed around the cursor spotlight */}
      <div 
        className="absolute inset-0 pointer-events-none z-1" 
        style={{
          background: `radial-gradient(450px circle at ${glowPos.x}px ${glowPos.y}px, rgba(9, 10, 15, 0.15) 0%, rgba(9, 10, 15, 0.78) 55%, rgba(9, 10, 15, 0.96) 100%)`
        }}
      />

      {/* Scattered Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none z-0"></div>

      {/* DENSE ZOOMED-OUT SCATTERED INTERACTIVE BACKGROUND IMAGE GRID */}
      <AnimatePresence>
        {searchPhase === 'initial' && (
          <div className="absolute inset-0 pointer-events-none z-2 overflow-hidden select-none">
            {BACKGROUND_CARDS.map((card, idx) => {
              // Calculate custom parallax shifts for each card based on speed modifier
              const xOffset = mousePos.x * card.speed * dimensions.width;
              const yOffset = mousePos.y * card.speed * dimensions.height;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.7, filter: 'blur(3px)' }}
                  animate={{ 
                    opacity: 0.18, 
                    scale: 0.75, 
                    x: xOffset,
                    y: yOffset,
                    rotate: card.rot,
                    filter: 'blur(2.2px)'
                  }}
                  whileHover={{
                    opacity: 0.82,
                    scale: 0.92,
                    rotate: 0,
                    filter: 'blur(0px)',
                    zIndex: 20,
                    transition: { duration: 0.35, ease: 'easeOut' }
                  }}
                  exit={{ opacity: 0, scale: 0.5, y: -50, transition: { duration: 0.4, ease: 'easeInOut' } }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 55, 
                    damping: 24, 
                    delay: idx * 0.015 
                  }}
                  style={{
                    position: 'absolute',
                    top: card.y,
                    left: card.x,
                    transformOrigin: 'center center'
                  }}
                  className={`pointer-events-auto w-20 sm:w-28 md:w-32 ${card.ratio} rounded-2xl overflow-hidden glass border border-white/5 p-1 shadow-2xl hover:border-blue-500/35 cursor-pointer`}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden relative">
                    <img 
                      src={card.url} 
                      alt="PG preview" 
                      className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300 hover:grayscale-0"
                    />
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
            <div className="border border-blue-500/40 bg-blue-950/20 px-3.5 py-1.5 font-mono text-sm font-black tracking-widest text-blue-400 rounded-xl transition-all shadow-sm group-hover:bg-blue-600 group-hover:text-white select-none">
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
            className="px-5 py-2.5 bg-slate-900/60 hover:bg-blue-600 hover:text-white border border-slate-800 hover:border-blue-600 text-slate-300 font-extrabold text-xs rounded-xl transition-all duration-300 shadow-sm backdrop-blur-md cursor-pointer"
          >
            Access Portals
          </Link>
        </motion.div>
      </header>

      {/* CENTRAL HERO & SEARCH COMPONENT */}
      <div className="w-full flex-1 flex flex-col items-center justify-start pt-20 md:pt-28 relative z-40 px-4">
        
        {/* Animated Headline (only in initial phase) */}
        <AnimatePresence>
          {searchPhase === 'initial' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
              className="text-center mb-8 max-w-xl select-none"
            >
              <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-blue-950/40 border border-blue-800/30 text-blue-400 rounded-full inline-flex items-center gap-1.5 mb-4 shadow-sm backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Premium Student Living
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Find the perfect room <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  near your campus.
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-3 font-semibold max-w-md mx-auto leading-relaxed">
                Browse verified girls, boys, and unisex student PGs with smart preferences, mess menu integration, and safety scores.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DYNAMIC POSITION SEARCH BAR WRAPPER */}
        <motion.div 
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
              className="text-xs font-black tracking-widest text-blue-400 mb-3.5 uppercase text-left select-none ml-4 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 animate-spin-slow" /> Search location
            </motion.h2>
          )}

          {/* Search Bar container with Glassmorphism */}
          <div className="relative w-full glass-premium border border-white/10 rounded-[2rem] shadow-[0_15px_45px_rgba(0,0,0,0.4)] flex items-center p-1.5 transition-all focus-within:border-blue-500/50 focus-within:shadow-[0_20px_50px_rgba(59,130,246,0.15)]">
            
            {/* Option Selector: Girls PG / Boys PG / Unisex PG */}
            <div className="flex gap-1 p-1 border-r border-slate-800 pr-2 shrink-0 select-none">
              {(['girls', 'boys', 'unisex'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPgType(type)}
                  className={`px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    pgType === type
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 shadow-sm'
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
                className="bg-transparent border-none text-white focus:outline-none text-xs font-bold p-0 placeholder-slate-500 w-full"
              />

              {/* Autocomplete Dropdown with ease-out Framer Motion */}
              <AnimatePresence>
                {showAutocomplete && (
                  <motion.div 
                    ref={autocompleteRef}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 right-0 top-full mt-4 bg-slate-950/95 border border-slate-800/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 p-2.5 max-h-72 overflow-y-auto backdrop-blur-xl"
                  >
                    {filteredSuggestions.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-4 font-semibold">No locations found</p>
                    ) : (
                      filteredSuggestions.slice(0, 3).map((item, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ backgroundColor: 'rgba(59,130,246,0.06)' }}
                          onClick={() => {
                            const val = item.city === 'Nearby' ? '' : item.city;
                            setLocationInput(val);
                            handleSearchSubmit(val);
                          }}
                          className="flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-colors text-left"
                        >
                          <span className="bg-blue-950/60 p-2.5 rounded-xl text-blue-400 shadow-sm flex items-center justify-center w-10 h-10 select-none border border-blue-900/40">
                            {item.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-extrabold text-xs text-slate-200 block truncate">
                              {item.city}{item.city !== 'Nearby' ? `, ${item.state}` : ''}
                            </span>
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block mt-0.5">
                              {item.city === 'Nearby' ? item.state : item.type}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search trigger button */}
            <button 
              onClick={() => handleSearchSubmit(locationInput)}
              className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shrink-0 shadow-md shadow-blue-500/10 ml-auto"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-black text-blue-400 uppercase bg-blue-950/50 px-2.5 py-1 rounded border border-blue-900/40 select-none">
                ROOMVERSE listings
              </span>
              <h2 className="text-2xl font-black text-white mt-2">
                Popular homes {selectedLocation ? `in ${selectedLocation}` : 'nearby'}
              </h2>
            </div>
            <div className="flex gap-2">
              <span className="px-3.5 py-2 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-300 font-bold shadow-sm">
                Type: {pgType === 'unisex' ? 'Unisex' : pgType === 'girls' ? 'Girls Only' : 'Boys Only'}
              </span>
              <span className="px-3.5 py-2 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-300 font-bold shadow-sm">
                {filteredPgs.length} spaces matching
              </span>
            </div>
          </div>

          {/* Listings Display Grid */}
          {fetchLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-3 border-blue-900/50 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredPgs.length === 0 ? (
            <div className="bg-slate-900/40 p-20 rounded-3xl border border-slate-800 shadow-sm text-center space-y-4">
              <span className="text-4xl">🔍</span>
              <h4 className="font-extrabold text-lg text-white">No ROOMVERSE spaces found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-slate-800">
            {[
              { title: '💰 Budget Sorting', desc: 'Adjust prices to match your exact monthly budget thresholds.', icon: <Coins className="w-5 h-5 text-blue-400" /> },
              { title: '🧩 Compatibility Index', desc: 'Verify safety factors, wifi availability, and walking distances.', icon: <Wifi className="w-5 h-5 text-blue-400" /> },
              { title: '🛡️ Local Safety Scores', desc: 'Examine metrics on CCTV, emergency support, and local guards.', icon: <Shield className="w-5 h-5 text-blue-400" /> },
              { title: '🍽️ Daily Mess Menus', desc: 'Browse full daily breakfast, lunch, and dinner plans.', icon: <Utensils className="w-5 h-5 text-blue-400" /> }
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-sm backdrop-blur-md hover:border-blue-500/45 transition-all duration-300"
              >
                <span className="bg-blue-950/50 p-2.5 rounded-xl inline-block border border-blue-900/40">{feat.icon}</span>
                <h4 className="font-extrabold text-white text-sm mt-3">{feat.title}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-semibold">{feat.desc}</p>
              </div>
            ))}
          </div>
        </motion.main>
      )}
    </div>
  );
}
