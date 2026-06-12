'use client';

import React, { useState, useEffect } from 'react';
import { PG } from './PGCard';

interface CallSimulatorProps {
  pg: PG;
  ownerName: string;
  onClose: () => void;
}

export default function CallSimulator({ pg, ownerName, onClose }: CallSimulatorProps) {
  const [status, setStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  // Handle ringing simulation to active call transition
  useEffect(() => {
    const ringTimeout = setTimeout(() => {
      setStatus('connected');
      setTranscript(`"Hello! ${ownerName.split(' ')[0]} here, owner of ${pg.name}. Thanks for calling! How can I help you today?"`);
    }, 2500);

    return () => clearTimeout(ringTimeout);
  }, [pg, ownerName]);

  // Handle call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'connected') {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Handle smart dialog triggers based on time elapsed
  useEffect(() => {
    if (status === 'connected') {
      if (seconds === 7) {
        setTranscript(`"Absolutely. We have double sharing rooms starting at ₹${pg.price.toLocaleString('en-IN')}/month which includes high-speed internet and standard access to the mess menu. We'd love to host you!"`);
      } else if (seconds === 15) {
        setTranscript(`"I'll tell you what, you can drop me a message in the chat box or visit us at ${pg.location.split(',')[0]} when you have time. I will show you around. Have a great day!"`);
      }
    }
  }, [seconds, status, pg, ownerName]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setStatus('ended');
    setTranscript('"Call ended by user"');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
      <div className="w-full max-w-sm glass-premium rounded-3xl p-8 border border-slate-800/80 shadow-2xl flex flex-col items-center justify-between min-h-[500px]">
        
        {/* Contact Info Header */}
        <div className="text-center space-y-3 mt-6">
          <div className="relative inline-block">
            {/* Pulsing ring animation while ringing */}
            {status === 'ringing' && (
              <div className="absolute inset-0 rounded-full bg-neon-teal/20 border border-neon-teal/40 animate-pulse-ring"></div>
            )}
            <div className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-3xl z-10 shadow-lg">
              🧔
            </div>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-100">{ownerName}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Calling: {pg.name}</p>
            <span className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 block">{pg.phone}</span>
          </div>

          <div className="flex justify-center pt-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase ${
              status === 'ringing'
                ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 animate-pulse'
                : status === 'connected'
                ? 'bg-neon-teal/10 text-neon-teal border border-neon-teal/20'
                : 'bg-neon-rose/10 text-neon-rose border border-neon-rose/20'
            }`}>
              {status === 'ringing' ? 'Ringing...' : status === 'connected' ? `Connected • ${formatTime(seconds)}` : 'Call Ended'}
            </span>
          </div>
        </div>

        {/* Audio Dialogue transcription box */}
        <div className="w-full px-4 py-4 bg-slate-900/60 border border-slate-800/60 rounded-2xl min-h-[100px] flex items-center justify-center text-center">
          {status === 'ringing' ? (
            <p className="text-xs text-slate-500 italic">Waiting for owner to connect...</p>
          ) : (
            <p className="text-xs text-slate-300 font-medium leading-relaxed italic animate-fade-in">
              {transcript}
            </p>
          )}
        </div>

        {/* In-Call Controls */}
        <div className="w-full space-y-8 mb-6">
          {/* Audio options */}
          <div className="flex justify-evenly items-center">
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full border transition-all duration-300 cursor-pointer ${
                isMuted
                  ? 'bg-slate-700/80 border-slate-600 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
              disabled={status !== 'connected'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Speaker button */}
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-4 rounded-full border transition-all duration-300 cursor-pointer ${
                isSpeaker
                  ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
              disabled={status !== 'connected'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* End Call button */}
          <div className="flex justify-center">
            <button
              onClick={handleEndCall}
              className="p-5 bg-neon-rose text-white rounded-full hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transform hover:scale-105 transition-all cursor-pointer shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
