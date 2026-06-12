'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PG } from './PGCard';
import { useAuth } from '@/app/context/AuthContext';

interface PGDetailsModalProps {
  pg: PG;
  onClose: () => void;
  onAddReview: (pgId: string, updatedPg: PG) => void;
}

export default function PGDetailsModal({ pg, onClose, onAddReview }: PGDetailsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'safety' | 'mess' | 'reviews'>('safety');
  const [menuDay, setMenuDay] = useState<string>('Monday');
  
  // Review form states
  const [studentName, setStudentName] = useState(user?.role === 'student' ? user.name : '');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Sync student name when user loads
  useEffect(() => {
    if (user?.role === 'student') {
      setStudentName(user.name);
    }
  }, [user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (user?.role !== 'student') {
      setError('Unauthorized: Mess ratings can only be submitted by verified students.');
      return;
    }
    
    const nameToSubmit = user.name || studentName;
    if (!nameToSubmit.trim() || !comment.trim()) {
      setError('Please fill in both name and review comment');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/pgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pgId: pg.id,
          review: { studentName: nameToSubmit, rating, comment },
          userRole: user.role
        })
      });
      const data = await response.json();
      
      if (data.success) {
        onAddReview(pg.id, data.pg);
        // Clear comment only, keep name pre-filled
        setComment('');
        setRating(5);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getAverageFoodRating = () => {
    if (pg.reviews.length === 0) return 'N/A';
    const sum = pg.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / pg.reviews.length).toFixed(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-float" style={{ animationDuration: '8s' }}>
        
        {/* Header Image banner */}
        <div className="relative h-56 w-full">
          <Image
            src={pg.image}
            alt={pg.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 rounded-full p-2.5 border border-slate-200 shadow-md transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Core Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-royal-green border border-emerald-100">
                  {pg.location.split(',').pop()?.trim()}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2 drop-shadow-md">
                  {pg.name}
                </h2>
                <p className="text-xs md:text-sm text-slate-200 drop-shadow-sm flex items-center gap-1 mt-1">
                  📍 {pg.location}
                </p>
              </div>
              <div className="bg-white/95 p-3 rounded-2xl border border-slate-100 shadow-lg flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase leading-none mb-1">Rent/Month</span>
                <span className="text-xl md:text-2xl font-black text-royal-green leading-none">₹{pg.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Amenities & Facilities */}
        <div className="flex flex-wrap gap-2 px-6 py-3.5 bg-slate-50 border-b border-slate-100 select-none">
          {[
            { key: 'wifi', label: 'Wi-Fi Included', icon: '📶' },
            { key: 'ac', label: 'Air Conditioning', icon: '❄️' },
            { key: 'laundry', label: 'Laundry Service', icon: '🧺' },
            { key: 'gym', label: 'In-house Gym', icon: '🏋️' },
            { key: 'hospital', label: 'Nearby Hospital', icon: '🏥' },
            { key: 'streetlights', label: 'Streetlights Lit', icon: '💡' },
            { key: 'walkingDistance', label: 'Walking to College', icon: '🚶' }
          ].map((item) => {
            const isSupported = pg.compatibility[item.key as keyof typeof pg.compatibility];
            return (
              <span
                key={item.key}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 flex items-center gap-1.5 ${
                  isSupported
                    ? 'bg-emerald-50 border-emerald-100 text-royal-green shadow-sm'
                    : 'bg-white border-slate-200 text-slate-300 line-through'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          {[
            { id: 'safety', label: '🛡️ Safety Score Breakdown' },
            { id: 'mess', label: '🍽️ Weekly Mess Menu' },
            { id: 'reviews', label: '⭐ Student Mess Ratings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 md:px-4 font-bold text-xs md:text-sm border-b-2 cursor-pointer transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-royal-green text-royal-green bg-slate-50/50'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal content body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 font-medium text-slate-600">
          
          {/* TAB 1: SAFETY SCORE */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="font-extrabold text-base text-slate-800">Overall Safety Score</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Calculated using 5 core local variables</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-emerald-700">{pg.safetyScore}%</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg">🛡️</div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'CCTV Surveillance', value: pg.safetyBreakdown.cctv, color: 'bg-royal-green', icon: '📹' },
                  { name: '24/7 Security Guard Presence', value: pg.safetyBreakdown.guard, color: 'bg-emerald-600', icon: '👮' },
                  { name: 'Streetlight Luminosity & Coverage', value: pg.safetyBreakdown.streetlights, color: 'bg-amber-500', icon: '💡' },
                  { name: 'Emergency Police Proximity Response', value: pg.safetyBreakdown.emergency, color: 'bg-emerald-500', icon: '🚨' },
                  { name: 'Local Crime Rate Proximity (Low Index)', value: pg.safetyBreakdown.crimeRate, color: 'bg-rose-500', icon: '🔒' }
                ].map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 flex items-center gap-1.5">{item.icon} {item.name}</span>
                      <span className="text-slate-800 font-bold">{item.value}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MESS MENU */}
          {activeTab === 'mess' && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => setMenuDay(day)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                      menuDay === day
                        ? 'bg-royal-green text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* Day Menu Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h4 className="font-extrabold text-base text-royal-green">{menuDay} Menu</h4>
                  <span className="text-xs font-medium text-slate-400">Meal Schedule & Options</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { meal: 'Breakfast', time: '08:00 AM - 09:30 AM', icon: '🍳', menu: pg.messMenu[menuDay]?.breakfast },
                    { meal: 'Lunch', time: '01:00 PM - 02:30 PM', icon: '🍚', menu: pg.messMenu[menuDay]?.lunch },
                    { meal: 'Dinner', time: '08:30 PM - 10:00 PM', icon: '🍲', menu: pg.messMenu[menuDay]?.dinner }
                  ].map((item) => (
                    <div key={item.meal} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between animate-in fade-in duration-350">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm font-bold text-slate-800">{item.meal}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">{item.time}</span>
                        <p className="text-slate-600 text-xs mt-3 font-semibold leading-relaxed">
                          {item.menu || 'Not scheduled'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STUDENT RATINGS & REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Ratings Summary card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
                <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 md:border-r border-slate-100 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Average Mess Rating</span>
                  <span className="text-3xl font-black text-amber-500 mt-2">★ {getAverageFoodRating()}</span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 font-extrabold uppercase tracking-wider mt-1.5 flex items-center gap-1 justify-center px-2 py-0.5 rounded-full">
                    Students Only
                  </span>
                </div>
                
                {/* Review Submittal Form */}
                {user?.role === 'student' ? (
                  <form onSubmit={handleReviewSubmit} className="md:col-span-2 p-3 space-y-3">
                    <h5 className="text-xs font-black text-slate-600 uppercase tracking-wider">Leave a Mess Review</h5>
                    {error && <div className="text-[11px] text-red-600 font-bold">{error}</div>}
                    
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 text-xs font-semibold select-none">
                        <span className="mr-1.5 text-emerald-600">✓</span> Verified Student: {studentName}
                      </div>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg px-2 text-amber-500 text-xs font-black focus:outline-none focus:border-royal-green cursor-pointer shadow-sm"
                      >
                        <option value="5">★★★★★ 5 Stars</option>
                        <option value="4">★★★★☆ 4 Stars</option>
                        <option value="3">★★★☆☆ 3 Stars</option>
                        <option value="2">★★☆☆☆ 2 Stars</option>
                        <option value="1">★☆☆☆☆ 1 Star</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Describe food quality, hygiene, or menu variety..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-royal-green shadow-sm"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 bg-royal-green hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center shadow-sm"
                      >
                        {submitting ? 'Posting...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="md:col-span-2 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col justify-center items-center text-center space-y-1 min-h-[110px]">
                    <span className="text-lg">🔒</span>
                    <h5 className="text-xs font-black text-rose-800 uppercase tracking-wider">Mess Ratings Restricted</h5>
                    <p className="text-[10px] text-rose-600 max-w-xs leading-relaxed font-semibold">
                      Mess menus can only be rated by students. Log in as a student to submit a rating.
                    </p>
                  </div>
                )}
              </div>

              {/* Reviews Feed */}
              <div className="space-y-3">
                {pg.reviews.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No food reviews yet. Be the first to leave one!</p>
                ) : (
                  pg.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">{rev.studentName}</span>
                            <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">
                              ✓ Verified Student
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold block mt-1">{rev.date}</span>
                        </div>
                        <span className="text-xs font-black text-amber-500">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
