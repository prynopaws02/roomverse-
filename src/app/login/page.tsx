'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('student@college.edu');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'owner') router.push('/owner');
      else router.push('/student');
    }
  }, [user, router]);

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      setEmail('student@college.edu');
      setPassword('••••••••');
    } else if (selectedRole === 'owner') {
      setEmail('owner@ivyheights.com');
      setPassword('••••••••');
    } else if (selectedRole === 'admin') {
      setEmail('admin@rentspace.com');
      setPassword('••••••••');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, role);
      if (!success) {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060913]">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-neon-blue/20 border-t-neon-blue animate-spin"></div>
          <p className="mt-4 text-slate-400 text-sm font-medium tracking-wide">Securing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#060913] relative overflow-hidden dot-grid">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-blue/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-purple/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-premium p-8 rounded-2xl relative z-10 animate-float">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-neon-blue/10 rounded-xl mb-4 border border-neon-blue/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neon-blue via-neon-purple to-neon-teal bg-clip-text text-transparent">
            NestSeeker
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Premium student PG finder and mess rating portal
          </p>
        </div>

        {/* Role Select Tabs */}
        <div className="flex p-1 bg-slate-900/80 rounded-lg mb-6 border border-slate-800/80">
          {(['student', 'owner', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all capitalize duration-300 ${
                role === r
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-neon-rose/10 border border-neon-rose/20 text-neon-rose rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-blue/60 focus:ring-1 focus:ring-neon-blue/30 text-sm transition-all duration-300"
              placeholder="name@college.edu"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <span className="text-xs text-neon-blue cursor-pointer hover:underline">
                Demo Mode Active
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-blue/60 focus:ring-1 focus:ring-neon-blue/30 text-sm transition-all duration-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                Entering portal...
              </>
            ) : (
              `Access Portal as ${role}`
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500">
            For demonstration, simply click the tabs above to toggle prefilled roles, and click access.
          </p>
        </div>
      </div>
    </div>
  );
}
