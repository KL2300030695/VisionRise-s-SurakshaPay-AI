"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, LogIn, Loader2, Eye, EyeOff, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [requirePin, setRequirePin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, pin }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.requirePin) {
          setRequirePin(true);
          setIsLoading(false);
          return;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('surakshapay_adminToken', data.token);
          localStorage.setItem('surakshapay_adminUser', data.admin.username);
        }
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/20 group-hover:scale-110 transition-transform">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white font-headline tracking-tight">Admin Portal</h1>
            <p className="text-white/50 text-sm">SurakshaPay AI — Insurer Analytics Access</p>
          </div>
        </div>

        <Card className="shadow-2xl border-none bg-white/10 backdrop-blur-2xl border border-white/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-3">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Authorized Access Only</CardTitle>
            <CardDescription className="text-white/40">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!requirePin ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="admin-username" className="text-sm font-bold text-white/70">Username</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <Input
                        id="admin-username"
                        placeholder="Enter admin username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-12 rounded-xl pl-11 bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-secondary focus:ring-secondary"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-sm font-bold text-white/70">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl pl-11 pr-12 bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-secondary focus:ring-secondary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right duration-500">
                  <div className="p-4 bg-primary/20 border border-primary/30 rounded-2xl flex items-center gap-3">
                    <Shield className="h-6 w-6 text-white" />
                    <div>
                      <p className="text-sm font-bold text-white">Security PIN Required</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest">Two-Step Verification Active</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-pin" className="text-sm font-bold text-white/70">6-Digit PIN</Label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <Input
                        id="admin-pin"
                        type="password"
                        placeholder="••••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="h-14 rounded-xl pl-11 bg-white/10 border-white/10 text-white text-2xl tracking-[1em] text-center placeholder:tracking-normal placeholder:text-base focus:border-secondary focus:ring-secondary"
                        maxLength={6}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <div className="h-2 w-2 rounded-full bg-red-400 shrink-0"></div>
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base shadow-2xl gap-2 bg-white text-primary hover:bg-white/90 font-bold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
                ) : (
                  requirePin ? <><Shield className="h-4 w-4" /> Verify & Access</> : <><LogIn className="h-4 w-4" /> Access Dashboard</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                ← Back to SurakshaPay Home
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/20">
          Protected by SurakshaPay AI Security
        </p>
      </div>
    </div>
  );
}
