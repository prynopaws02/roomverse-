'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Preferences } from './CompatibilityQuiz';

export interface PG {
  id: string;
  name: string;
  price: number;
  location: string;
  image: string;
  phone: string;
  ownerEmail: string;
  safetyScore: number;
  safetyBreakdown: {
    cctv: number;
    guard: number;
    streetlights: number;
    emergency: number;
    crimeRate: number;
  };
  compatibility: {
    hospital: boolean;
    streetlights: boolean;
    walkingDistance: boolean;
    wifi: boolean;
    ac: boolean;
    laundry: boolean;
    gym: boolean;
  };
  messMenu: Record<string, { breakfast: string; lunch: string; dinner: string }>;
  reviews: Array<{ id: string; studentName: string; rating: number; comment: string; date: string; verified?: boolean }>;
}

interface PGCardProps {
  pg: PG;
  selectedPreferences: Preferences;
  onViewDetails: (pg: PG) => void;
  onCall: (pg: PG) => void;
  onChat: (pg: PG) => void;
}

export default function PGCard({ pg, selectedPreferences, onViewDetails, onCall, onChat }: PGCardProps) {
  const [showReviewsInline, setShowReviewsInline] = useState(false);

  // Filter for verified student reviews
  const verifiedReviews = pg.reviews.filter((r) => r.verified !== false);

  // Get food rating average
  const getAverageFoodRating = () => {
    if (pg.reviews.length === 0) return 'N/A';
    const sum = pg.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / pg.reviews.length).toFixed(1);
  };

  // Calculate compatibility match percentage
  const calculateMatch = (): number | null => {
    const activePrefs = Object.entries(selectedPreferences).filter(([_, val]) => val);
    if (activePrefs.length === 0) return null;

    let matches = 0;
    activePrefs.forEach(([key]) => {
      if (pg.compatibility[key as keyof Preferences]) {
        matches++;
      }
    });

    return Math.round((matches / activePrefs.length) * 100);
  };

  const matchPercent = calculateMatch();

  return (
    <div className="bg-white rounded-[24px] overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-300 flex flex-col h-full group transform hover:-translate-y-0.5">
      {/* 1. Image first */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-100 shrink-0">
        <Image
          src={pg.image}
          alt={pg.name}
          fill
          sizes="(max-width: 768px) 100vw, 15vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />
        
        {/* Compatibility Match Indicator on image */}
        {matchPercent !== null && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black backdrop-blur-md border border-white/20 shadow-sm text-white ${
              matchPercent >= 80 ? 'bg-emerald-600/90' : matchPercent >= 50 ? 'bg-emerald-700/90' : 'bg-rose-600/90'
            }`}>
              {matchPercent}% Match
            </span>
          </div>
        )}
      </div>

      {/* Card Details Area */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* 2. PG Name and Rent */}
          <div className="flex justify-between items-start gap-1">
            <h4 className="font-extrabold text-[13px] text-slate-800 group-hover:text-royal-green transition-colors leading-tight line-clamp-1">
              {pg.name}
            </h4>
            <div className="text-right shrink-0">
              <span className="font-black text-xs text-royal-green leading-none">
                ₹{pg.price.toLocaleString('en-IN')}
                <span className="text-[9px] font-normal text-slate-400">/m</span>
              </span>
            </div>
          </div>

          {/* 3. Section Divider */}
          <div className="border-t border-slate-100"></div>

          {/* 4. Location */}
          <p className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold line-clamp-1">
            📍 {pg.location.split(',')[0]}
          </p>

          {/* 5. Food Rating */}
          <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold">
            <span>🍽️ Food:</span>
            <span className="font-black text-amber-500">★ {getAverageFoodRating()}</span>
          </div>

          {/* 6. Standout Badges (Wifi, Nestseeker verified, CCTV) */}
          <div className="flex flex-wrap gap-1 pt-1">
            <span className="text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
              ✓ Verified
            </span>
            {pg.compatibility.wifi && (
              <span className="text-[8px] font-black bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-md shrink-0">
                📶 Wi-Fi
              </span>
            )}
            {pg.safetyBreakdown.cctv >= 80 && (
              <span className="text-[8px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded-md shrink-0">
                📹 CCTV
              </span>
            )}
          </div>
        </div>

        {/* 7. Details Link (toggles inline reviews) */}
        <div className="flex flex-col">
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReviewsInline(!showReviewsInline);
              }}
              className="text-[10px] font-extrabold text-royal-green hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{showReviewsInline ? 'Hide Reviews' : 'Details & Reviews'}</span>
              <span>{showReviewsInline ? '▲' : '▼'}</span>
            </button>
            
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onCall(pg); }}
                className="p-1 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer text-[10px]"
                title="Call Owner"
              >
                📞
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onChat(pg); }}
                className="p-1 hover:bg-emerald-50 rounded-lg border border-emerald-100 text-royal-green hover:bg-emerald-100/50 cursor-pointer text-[10px]"
                title="Live Chat"
              >
                💬
              </button>
            </div>
          </div>

          {/* Inline Standout Reviews (generated upon details click) */}
          {showReviewsInline && (
            <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-[12px] animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Standout Reviews</span>
              {verifiedReviews.length > 0 ? (
                <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                  {verifiedReviews.slice(0, 2).map((rev) => (
                    <div key={rev.id} className="text-[9px] text-slate-600 bg-white p-1 rounded-md border border-slate-100">
                      <div className="flex justify-between items-center text-slate-400 text-[7px] font-bold">
                        <span>— {rev.studentName}</span>
                        <span className="text-amber-500">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p className="italic font-medium mt-0.5 line-clamp-2">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 italic">No reviews found.</p>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(pg);
                }}
                className="w-full mt-2 py-1 bg-royal-green hover:bg-royal-green-hover text-white text-[9px] font-extrabold rounded-lg transition-colors text-center cursor-pointer"
              >
                Full Details & Mess Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
