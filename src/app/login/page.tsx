"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, LogIn, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          action: mode,
          firstName: mode === 'register' ? firstName : undefined,
          lastName: mode === 'register' ? lastName : undefined,
          phone: mode === 'register' ? phone : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Store workerId in localStorage for session persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('surakshapay_workerId', data.workerId);
          localStorage.setItem('surakshapay_workerName', data.worker?.firstName || '');
          localStorage.setItem('surakshapay_workerEmail', data.worker?.email || '');
        }

        setSuccess(data.message);
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          if (data.worker?.persona) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }, 800);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-black text-primary font-headline">SurakshaPay AI</span>
          </Link>
          <p className="text-muted-foreground">
            {mode === 'login' ? 'Sign in to manage your gig insurance' : 'Create your insurance account'}
          </p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold font-headline">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Enter your credentials to access your dashboard' 
                : 'Sign up to get started with SurakshaPay'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-bold">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Ravi"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 rounded-xl px-4"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-bold">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Kumar"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11 rounded-xl px-4"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-bold">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-xl px-4"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="rider@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl px-4"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-bold">Password</Label>
                  {mode === 'login' && (
                    <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl px-4 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl text-base shadow-lg gap-2" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {mode === 'login' ? 'Signing In...' : 'Creating Account...'}</>
                ) : mode === 'login' ? (
                  <><LogIn className="h-4 w-4" /> Sign In</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Create Account</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-muted-foreground">
                    {mode === 'login' ? 'New to SurakshaPay?' : 'Already have an account?'}
                  </span>
                </div>
              </div>
              {mode === 'login' ? (
                <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
                  <UserPlus className="h-4 w-4 mr-2" /> Create Account
                </Button>
              ) : (
                <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                  <LogIn className="h-4 w-4 mr-2" /> Sign In Instead
                </Button>
              )}
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 text-center space-y-1">
              <p className="font-bold">Quick Start</p>
              <p>Use any email to sign in. If you already completed onboarding, your data will be loaded from MongoDB.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
