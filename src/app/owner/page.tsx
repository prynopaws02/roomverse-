'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PG } from '@/app/components/PGCard';

export default function OwnerDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Redirect if not owner
  useEffect(() => {
    if (!loading && (!user || user.role !== 'owner')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const [pg, setPg] = useState<PG | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Edit Listing States
  const [priceInput, setPriceInput] = useState<number>(0);
  const [saveListingLoading, setSaveListingLoading] = useState(false);
  const [saveListingSuccess, setSaveListingSuccess] = useState(false);

  // Edit Mess States
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [saveMessLoading, setSaveMessLoading] = useState(false);
  const [saveMessSuccess, setSaveMessSuccess] = useState(false);

  // Chat States
  const [chatStudent, setChatStudent] = useState('Aarav Sharma');
  const [ownerMsg, setOwnerMsg] = useState('');
  const [chatLogs, setChatLogs] = useState<Array<{ sender: 'student' | 'owner'; text: string; time: string }>>([
    { sender: 'student', text: 'Hello! Is there a double sharing room available at Ivy Heights?', time: '01:05 AM' },
    { sender: 'owner', text: 'Hi Aarav! Yes, we have two spots open for double sharing rooms. Rent is ₹14,000 including utilities.', time: '01:06 AM' },
    { sender: 'student', text: 'Great! Is high speed Wi-Fi included in that rent? Also, is the food spicy?', time: '01:07 AM' }
  ]);

  // Fetch PG details matching owner's PG ID
  const fetchOwnerPg = async () => {
    if (!user?.pgId) return;
    try {
      const response = await fetch('/api/pgs');
      const data = await response.json();
      const ownerPg = data.find((p: PG) => p.id === user.pgId);
      if (ownerPg) {
        setPg(ownerPg);
        setPriceInput(ownerPg.price);
        
        // Prefill mess inputs for selected day
        const dayMenu = ownerPg.messMenu[selectedDay] || { breakfast: '', lunch: '', dinner: '' };
        setBreakfast(dayMenu.breakfast);
        setLunch(dayMenu.lunch);
        setDinner(dayMenu.dinner);
      }
    } catch (err) {
      console.error('Failed to load owner PG data', err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'owner') {
      fetchOwnerPg();
    }
  }, [user]);

  // Sync menu fields on day change
  useEffect(() => {
    if (pg) {
      const dayMenu = pg.messMenu[selectedDay] || { breakfast: '', lunch: '', dinner: '' };
      setBreakfast(dayMenu.breakfast);
      setLunch(dayMenu.lunch);
      setDinner(dayMenu.dinner);
      setSaveMessSuccess(false);
    }
  }, [selectedDay, pg]);

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pg) return;
    setSaveListingLoading(true);
    setSaveListingSuccess(false);

    try {
      const response = await fetch('/api/pgs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pg.id,
          price: priceInput
        })
      });
      const data = await response.json();
      if (data.success) {
        setPg(data.pg);
        setSaveListingSuccess(true);
        setTimeout(() => setSaveListingSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveListingLoading(false);
    }
  };

  const handleSaveMess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pg) return;
    setSaveMessLoading(true);
    setSaveMessSuccess(false);

    try {
      const updatedMessMenu = {
        ...pg.messMenu,
        [selectedDay]: { breakfast, lunch, dinner }
      };

      const response = await fetch('/api/pgs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pg.id,
          messMenu: updatedMessMenu
        })
      });
      const data = await response.json();
      if (data.success) {
        setPg(data.pg);
        setSaveMessSuccess(true);
        setTimeout(() => setSaveMessSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveMessLoading(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerMsg.trim()) return;

    setChatLogs((prev) => [
      ...prev,
      {
        sender: 'owner',
        text: ownerMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setOwnerMsg('');
  };

  const getAverageFoodRating = () => {
    if (!pg || pg.reviews.length === 0) return 'N/A';
    const sum = pg.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / pg.reviews.length).toFixed(1);
  };

  if (loading || !user || user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060913]">
        <div className="w-10 h-10 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  if (fetchLoading) {
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
          <div className="p-2 bg-neon-purple/10 rounded-lg border border-neon-purple/20 text-neon-purple font-bold">🏫</div>
          <h1 className="text-xl font-black bg-gradient-to-r from-neon-blue via-neon-purple to-neon-teal bg-clip-text text-transparent">
            NestSeeker Owner Panel
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-semibold block">{pg?.name} Owner</span>
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

      {/* Owner Workspace Container */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: General Listing & Real-Time Chats */}
        <div className="space-y-6">
          
          {/* General Listing Info */}
          <div className="glass p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
            <h3 className="font-extrabold text-lg text-slate-200 mb-4 flex items-center gap-2">
              📝 Manage Rent Prices
            </h3>
            
            <form onSubmit={handleSaveListing} className="space-y-4">
              {saveListingSuccess && (
                <div className="p-3 bg-neon-teal/10 border border-neon-teal/20 text-neon-teal rounded-xl text-xs font-semibold">
                  ✓ Rent updated successfully!
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Monthly Rent Rate (₹)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(Number(e.target.value))}
                    className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-neon-blue/60 text-sm font-semibold"
                    required
                  />
                  <button
                    type="submit"
                    disabled={saveListingLoading}
                    className="px-5 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-xl text-xs hover:shadow-md cursor-pointer flex items-center justify-center"
                  >
                    {saveListingLoading ? 'Saving...' : 'Update Rent'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Student Chat Replies Panel */}
          <div className="glass p-6 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col h-[380px]">
            <h3 className="font-extrabold text-lg text-slate-200 mb-3 flex items-center gap-2">
              💬 Incoming Inquiries
            </h3>
            
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-teal animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300">Active chat with {chatStudent}</span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/40 mb-3 flex flex-col">
              {chatLogs.map((log, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    log.sender === 'owner'
                      ? 'bg-gradient-to-r from-neon-purple to-neon-purple/80 text-white self-end rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800/80 text-slate-200 self-start rounded-tl-none'
                  }`}
                >
                  <p className="font-medium">{log.text}</p>
                  <span className="block text-[8px] text-right opacity-60 mt-1">{log.time}</span>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                value={ownerMsg}
                onChange={(e) => setOwnerMsg(e.target.value)}
                placeholder={`Type reply to ${chatStudent.split(' ')[0]}...`}
                className="flex-1 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-neon-purple/60"
              />
              <button
                type="submit"
                className="px-4 bg-neon-purple text-white font-bold rounded-xl text-xs hover:shadow-md cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Weekly Mess Customizer & Ratings */}
        <div className="space-y-6">
          
          {/* Mess Menu Editor */}
          <div className="glass p-6 rounded-2xl border border-slate-800/80 shadow-lg space-y-5">
            <h3 className="font-extrabold text-lg text-slate-200 flex items-center gap-2">
              🍽️ Weekly Mess Customizer
            </h3>

            {/* Day Toggles */}
            <div className="flex flex-wrap gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    selectedDay === day
                      ? 'bg-neon-purple text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveMess} className="space-y-4">
              {saveMessSuccess && (
                <div className="p-3 bg-neon-teal/10 border border-neon-teal/20 text-neon-teal rounded-xl text-xs font-semibold animate-fade-in">
                  ✓ {selectedDay} Mess Menu saved!
                </div>
              )}

              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <span className="text-xs font-bold text-neon-purple uppercase tracking-wider">{selectedDay} Menu Inputs</span>
                
                <div className="space-y-1 mt-2">
                  <label className="text-[10px] font-bold text-slate-400 block">🍳 Breakfast Menu</label>
                  <input
                    type="text"
                    value={breakfast}
                    onChange={(e) => setBreakfast(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-neon-purple/60"
                    placeholder="e.g. Aloo Paratha & Chai"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">🍚 Lunch Menu</label>
                  <input
                    type="text"
                    value={lunch}
                    onChange={(e) => setLunch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-neon-purple/60"
                    placeholder="e.g. Rajma Chawal & Curd"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">🍲 Dinner Menu</label>
                  <input
                    type="text"
                    value={dinner}
                    onChange={(e) => setDinner(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-neon-purple/60"
                    placeholder="e.g. Butter Roti & Paneer Masala"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saveMessLoading}
                className="w-full py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold rounded-xl text-xs hover:shadow-md cursor-pointer flex items-center justify-center"
              >
                {saveMessLoading ? 'Saving Menu...' : `Save ${selectedDay} Mess Menu`}
              </button>
            </form>
          </div>

          {/* Student Food Reviews list */}
          <div className="glass p-6 rounded-2xl border border-slate-800/80 shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <h3 className="font-extrabold text-lg text-slate-200 flex items-center gap-2">
                ⭐ Student Food Ratings
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-sm font-extrabold">★ {getAverageFoodRating()}</span>
                <span className="text-slate-400 text-[10px] font-semibold">Average</span>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {pg?.reviews.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No food reviews left yet.</p>
              ) : (
                pg?.reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-300">{rev.studentName}</span>
                      <span className="text-amber-400">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">"{rev.comment}"</p>
                    <span className="block text-[8px] text-slate-600 text-right">{rev.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
