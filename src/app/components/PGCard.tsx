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
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
  // Filter for verified student reviews
  const verifiedReviews = pg.reviews.filter((r) => r.verified !== false);

  const nextReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentReviewIndex((prev) => (prev + 1) % verifiedReviews.length);
  };

  const prevReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentReviewIndex((prev) => (prev - 1 + verifiedReviews.length) % verifiedReviews.length);
  };

  // Calculate compatibility match percentage
  const calculateMatch = (): number | null => {
    const activePrefs = Object.entries(selectedPreferences).filter(([_, val]) => val);
    if (activePrefs.length === 0) return null; // No preferences selected, don't show match indicator

    let matches = 0;
    activePrefs.forEach(([key]) => {
      if (pg.compatibility[key as keyof Preferences]) {
        matches++;
      }
    });

    return Math.round((matches / activePrefs.length) * 100);
  };

  const matchPercent = calculateMatch();

  // Determine safety score color
  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 border-emerald-200 bg-emerald-50';
    if (score >= 80) return 'text-royal-green border-emerald-100 bg-emerald-50/50';
    return 'text-amber-700 border-amber-200 bg-amber-50';
  };

  // Get food rating average
  const getAverageFoodRating = () => {
    if (pg.reviews.length === 0) return 'N/A';
    const sum = pg.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / pg.reviews.length).toFixed(1);
  };

  return (
    <div className="bg-white rounded-[24px] overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-300 flex flex-col h-full group transform hover:-translate-y-1">
      {/* Listing Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Image
          src={pg.image}
          alt={pg.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />
        
        {/* Safety Score Tag */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSafetyColor(pg.safetyScore)} shadow-sm`}>
            🛡️ Safety: {pg.safetyScore}/100
          </span>
        </div>

        {/* Dynamic Compatibility Match Indicator */}
        {matchPercent !== null && (
          <div className="absolute top-4 right-4 flex items-center justify-center">
            <div className="relative w-12 h-12 rounded-full bg-white/95 border border-slate-200 shadow-sm backdrop-blur-md flex flex-col items-center justify-center">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase leading-none">Match</span>
              <span className={`text-xs font-black mt-0.5 leading-none ${
                matchPercent >= 80 ? 'text-emerald-600' : matchPercent >= 50 ? 'text-royal-green' : 'text-rose-600'
              }`}>
                {matchPercent}%
              </span>
              
              {/* Stroke highlight ring */}
              <div className={`absolute inset-0 rounded-full border-2 border-transparent ${
                matchPercent >= 80 ? 'border-t-emerald-500 border-r-emerald-500' : matchPercent >= 50 ? 'border-t-royal-green border-r-royal-green' : 'border-t-rose-500'
              } opacity-60 animate-spin`} style={{ animationDuration: '6s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Verified Reviews Carousel below Image */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 min-h-[96px] flex flex-col justify-between relative">
        {verifiedReviews.length > 0 ? (
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <span className="text-[8px] animate-pulse text-emerald-600">●</span> Verified Student
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-amber-500 text-xs font-black">
                {'★'.repeat(verifiedReviews[currentReviewIndex].rating)}
                {'☆'.repeat(5 - verifiedReviews[currentReviewIndex].rating)}
              </div>
            </div>
            
            <p className="text-[11px] text-slate-600 italic line-clamp-2 mt-1.5 leading-relaxed font-semibold">
              "{verifiedReviews[currentReviewIndex].comment}"
            </p>

            <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-500 font-bold">
                — {verifiedReviews[currentReviewIndex].studentName}
              </span>
              
              {verifiedReviews.length > 1 && (
                <div className="flex gap-1.5">
                  <button
                    onClick={prevReview}
                    className="p-1 hover:bg-slate-200/80 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent"
                    title="Previous review"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={nextReview}
                    className="p-1 hover:bg-slate-200/80 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent"
                    title="Next review"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No reviews yet</span>
            <p className="text-[10px] text-slate-500 mt-1">Be the first to leave a verified review!</p>
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="font-bold text-lg text-slate-800 group-hover:text-royal-green transition-colors leading-tight">
            {pg.name}
          </h4>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rent</span>
            <span className="font-black text-xl text-royal-green leading-none">₹{pg.price.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/mo</span></span>
          </div>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-royal-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {pg.location}
        </p>

        {/* Quick info row */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 p-3 bg-slate-50 rounded-[16px] border border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <span>🍽️ Food:</span>
            <span className="font-extrabold text-amber-600">★ {getAverageFoodRating()}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <span>⚡ Wi-Fi:</span>
            <span className="font-bold">{pg.compatibility.wifi ? 'Included' : 'No'}</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-auto space-y-2">
          <button
            onClick={() => onViewDetails(pg)}
            className="w-full py-2.5 bg-royal-green hover:bg-royal-green-hover text-white font-extrabold rounded-[14px] text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-emerald-800/10"
          >
            🔍 View Mess Menu & Safety details
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onCall(pg)}
              className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-[14px] text-xs transition-all border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
            >
              📞 Call Owner
            </button>
            <button
              onClick={() => onChat(pg)}
              className="py-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-royal-green font-bold rounded-[14px] text-xs transition-all border border-emerald-100 flex items-center justify-center gap-1 cursor-pointer"
            >
              💬 Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
