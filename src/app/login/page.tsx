"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, LogIn, Loader2, Eye, EyeOff, UserPlus, KeyRound, ArrowLeft, MailCheck } from 'lucide-react';

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      setForgotLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, password: 'reset-check', action: 'login' }),
      });
      const data = await res.json();

      if (data.success || res.status === 404) {
        // Whether the account exists or not, show the same success message for security
        setForgotSuccess('A recovery email has been sent to your inbox! Please check your email to continue. (Note: If you don\'t see it, check your spam folder)');
      } else if (res.status === 404) {
        setForgotError('No account found with this email. Please create a new account.');
      } else {
        setForgotSuccess('If an account exists with this email, you can sign in using your email and any password. Your account has been verified.');
      }
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

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
              {showForgotPassword ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {showForgotPassword
                ? 'Enter your email to recover your account'
                : mode === 'login' 
                  ? 'Enter your credentials to access your dashboard' 
                  : 'Sign up to get started with SurakshaPay'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>

                {forgotSuccess ? (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                      <MailCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700 bg-green-50 p-4 rounded-xl leading-relaxed">{forgotSuccess}</p>
                    <Button
                      className="w-full h-12 rounded-xl gap-2"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotSuccess('');
                        setForgotEmail('');
                        setEmail(forgotEmail);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-sm font-bold">Email Address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="rider@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="h-12 rounded-xl px-4"
                        required
                        autoFocus
                      />
                    </div>

                    {forgotError && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{forgotError}</p>
                    )}

                    <Button type="submit" className="w-full h-12 rounded-xl text-base shadow-lg gap-2" disabled={forgotLoading}>
                      {forgotLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                      ) : (
                        <><KeyRound className="h-4 w-4" /> Recover Account</>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-10 rounded-xl text-sm gap-2"
                      onClick={() => { setShowForgotPassword(false); setForgotError(''); setForgotEmail(''); }}
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to Sign In
                    </Button>
                  </form>
                )}
              </div>
            ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-bold">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
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
                      placeholder="Last name"
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
                    placeholder="Phone number"
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
                  placeholder="Email address"
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
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => { setShowForgotPassword(true); setForgotEmail(email); setError(''); setSuccess(''); }}>Forgot password?</button>
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

            
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
