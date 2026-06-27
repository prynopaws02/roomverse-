'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PG } from '@/app/components/PGCard';

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const [pgs, setPgs] = useState<PG[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activePgEditId, setActivePgEditId] = useState<string | null>(null);
  
  // Track sliders locally for fast updates, sync on change
  const [bdCctv, setBdCctv] = useState(100);
  const [bdGuard, setBdGuard] = useState(100);
  const [bdStreetlights, setBdStreetlights] = useState(100);
  const [bdEmergency, setBdEmergency] = useState(100);
  const [bdCrimeRate, setBdCrimeRate] = useState(100);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPgs = async () => {
    try {
      const response = await fetch('/api/pgs');
      const data = await response.json();
      setPgs(data);
    } catch (err) {
      console.error('Failed to fetch PGs in admin', err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPgs();
    }
  }, [user]);

  // Open sliders and set initial values
  const handleEditSafety = (pgItem: PG) => {
    if (activePgEditId === pgItem.id) {
      setActivePgEditId(null);
    } else {
      setActivePgEditId(pgItem.id);
      setBdCctv(pgItem.safetyBreakdown.cctv);
      setBdGuard(pgItem.safetyBreakdown.guard);
      setBdStreetlights(pgItem.safetyBreakdown.streetlights);
      setBdEmergency(pgItem.safetyBreakdown.emergency);
      setBdCrimeRate(pgItem.safetyBreakdown.crimeRate);
    }
  };

  const handleSliderUpdate = async (pgItem: PG, breakdownUpdates: Record<string, number>) => {
    // Optimistically update local UI breakdown state
    const newBreakdown = {
      cctv: breakdownUpdates.cctv !== undefined ? breakdownUpdates.cctv : bdCctv,
      guard: breakdownUpdates.guard !== undefined ? breakdownUpdates.guard : bdGuard,
      streetlights: breakdownUpdates.streetlights !== undefined ? breakdownUpdates.streetlights : bdStreetlights,
      emergency: breakdownUpdates.emergency !== undefined ? breakdownUpdates.emergency : bdEmergency,
      crimeRate: breakdownUpdates.crimeRate !== undefined ? breakdownUpdates.crimeRate : bdCrimeRate,
    };
    
    // Recalculate average safety score
    const newScore = Math.round(
      (newBreakdown.cctv + newBreakdown.guard + newBreakdown.streetlights + newBreakdown.emergency + newBreakdown.crimeRate) / 5
    );

    // Update state variables
    if (breakdownUpdates.cctv !== undefined) setBdCctv(breakdownUpdates.cctv);
    if (breakdownUpdates.guard !== undefined) setBdGuard(breakdownUpdates.guard);
    if (breakdownUpdates.streetlights !== undefined) setBdStreetlights(breakdownUpdates.streetlights);
    if (breakdownUpdates.emergency !== undefined) setBdEmergency(breakdownUpdates.emergency);
    if (breakdownUpdates.crimeRate !== undefined) setBdCrimeRate(breakdownUpdates.crimeRate);

    // Optimistically update PGs list
    setPgs((prev) =>
      prev.map((p) =>
        p.id === pgItem.id
          ? { ...p, safetyScore: newScore, safetyBreakdown: newBreakdown }
          : p
      )
    );

    setUpdatingId(pgItem.id);

    try {
      await fetch('/api/pgs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pgItem.id,
          safetyBreakdown: newBreakdown,
        }),
      });
    } catch (err) {
      console.error('Failed to sync safety score with API', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Analytics Helpers
  const getAverageRent = () => {
    if (pgs.length === 0) return 0;
    const sum = pgs.reduce((acc, p) => acc + p.price, 0);
    return Math.round(sum / pgs.length);
  };

  const getAverageSafety = () => {
    if (pgs.length === 0) return 0;
    const sum = pgs.reduce((acc, p) => acc + p.safetyScore, 0);
    return Math.round(sum / pgs.length);
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060913]">
        <div className="w-10 h-10 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] relative overflow-hidden dot-grid flex flex-col">
      {/* Glow overlays */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-neon-blue/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-neon-purple/5 blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="glass border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-neon-rose/10 rounded-lg border border-neon-rose/20 text-neon-rose font-bold">🛡️</div>
          <h1 className="text-xl font-black bg-gradient-to-r from-neon-blue via-neon-purple to-neon-teal bg-clip-text text-transparent">
            NestSeeker Control Center
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-semibold block">Platform Administrator</span>
            <span className="text-sm font-bold text-slate-200">{user.name}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-neon-rose/40 hover:text-neon-rose text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Admin Body Container */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-8 flex-1 space-y-8">
        
        {/* Analytical Cards */}
        {fetchLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="w-6 h-6 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Platform Signups', value: '1,240', desc: 'Active student users', color: 'text-neon-blue' },
              { title: 'Total Listings', value: pgs.length, desc: 'Verified student PGs', color: 'text-neon-purple' },
              { title: 'Avg Monthly Rent', value: `₹${getAverageRent().toLocaleString('en-IN')}`, desc: 'Platform rent average', color: 'text-neon-teal' },
              { title: 'Avg Safety Index', value: `${getAverageSafety()}%`, desc: 'Average safety score', color: 'text-neon-rose' }
            ].map((card, i) => (
              <div key={i} className="glass p-5 rounded-[24px] border border-slate-800/80 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{card.title}</span>
                  <span className={`block text-3xl font-black ${card.color} mt-2`}>{card.value}</span>
                </div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase mt-3">{card.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Safety Score Configuration Board */}
        <div className="glass p-6 rounded-[24px] border border-slate-800/80 shadow-lg">
          <div>
            <h2 className="text-lg font-black text-slate-200">Safety Score Configurator</h2>
            <p className="text-xs text-slate-400 mt-0.5">Override and adjust security attributes to recalculate PG safety metrics</p>
          </div>

          <div className="mt-6 space-y-4">
            {fetchLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-3 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin"></div>
              </div>
            ) : (
              pgs.map((pgItem) => (
                <div key={pgItem.id} className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-[24px] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-200 text-sm">{pgItem.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Location: {pgItem.location.split(',')[0]}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {updatingId === pgItem.id && (
                        <span className="text-[10px] text-neon-teal font-semibold animate-pulse">Syncing...</span>
                      )}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-semibold uppercase">Current Safety Score</span>
                        <span className="text-sm font-black text-neon-teal">{pgItem.safetyScore}%</span>
                      </div>
                      <button
                        onClick={() => handleEditSafety(pgItem)}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10px] rounded-[14px] transition-all cursor-pointer"
                      >
                        {activePgEditId === pgItem.id ? 'Close Settings' : 'Adjust Safety Metrics'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Sliders Panel */}
                  {activePgEditId === pgItem.id && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                      
                      {[
                        { label: 'CCTV Coverage', val: bdCctv, key: 'cctv', color: 'accent-neon-blue' },
                        { label: 'Security Guard Presence', val: bdGuard, key: 'guard', color: 'accent-neon-purple' },
                        { label: 'Streetlight Luminosity', val: bdStreetlights, key: 'streetlights', color: 'accent-amber-400' },
                        { label: 'Emergency Proximity Response', val: bdEmergency, key: 'emergency', color: 'accent-neon-teal' },
                        { label: 'Crime Rate low-index', val: bdCrimeRate, key: 'crimeRate', color: 'accent-neon-rose' }
                      ].map((slider) => (
                        <div key={slider.key} className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-slate-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">{slider.label}</span>
                            <span className="text-slate-200 font-bold">{slider.val}/100</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={slider.val}
                            onChange={(e) => handleSliderUpdate(pgItem, { [slider.key]: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
