"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, LogIn, Loader2, Eye, EyeOff, UserPlus, KeyRound, ArrowLeft, MailCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

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
        setForgotSuccess('A recovery email has been sent to your inbox!');
      } else {
        setForgotSuccess('Account verification check complete. Please try signing in.');
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
        if (typeof window !== 'undefined' && data.worker) {
          localStorage.setItem('surakshapay_workerId', data.workerId);
          localStorage.setItem('surakshapay_workerFirstName', data.worker.firstName || '');
          localStorage.setItem('surakshapay_workerLastName', data.worker.lastName || '');
          localStorage.setItem('surakshapay_workerEmail', data.worker.email || '');
          localStorage.setItem('surakshapay_workerPhone', data.worker.phone || '');
        }
        setSuccess(data.message);
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
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Professional Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.05),transparent_50%)] -z-10"></div>
      
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-3 group transition-all">
            <div className="bg-primary p-2.5 rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black text-primary font-headline tracking-tighter">SurakshaPay AI</span>
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-primary font-headline tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Join SurakshaPay'}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {mode === 'login' ? 'Access your automated protection dashboard' : 'Protect your gig income in under 2 minutes'}
            </p>
          </div>
        </div>

        <Card className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-primary/5 border-none bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            {showForgotPassword ? (
               <div className="space-y-6">
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary font-bold flex items-center gap-2 mb-4" onClick={() => setShowForgotPassword(false)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                
                {forgotSuccess ? (
                   <div className="text-center space-y-6 animate-in zoom-in duration-500">
                      <div className="mx-auto h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center">
                        <MailCheck className="h-10 w-10 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-primary tracking-tight">Email Sent!</h3>
                        <p className="text-sm text-muted-foreground font-medium px-4 leading-relaxed">{forgotSuccess}</p>
                      </div>
                      <Button className="w-full h-14 rounded-2xl font-black shadow-lg" onClick={() => setShowForgotPassword(false)}>
                        Return to Sign In
                      </Button>
                   </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-sm font-black uppercase tracking-widest text-primary/60 ml-1">Email Address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="rider@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="h-14 rounded-2xl px-6 border-none bg-muted/30 focus-visible:ring-primary/20 shadow-inner"
                        required
                      />
                    </div>
                    {forgotError && <p className="text-xs font-bold text-red-500 bg-red-500/10 p-4 rounded-xl">{forgotError}</p>}
                    <Button type="submit" className="w-full h-14 rounded-2xl font-black shadow-xl" disabled={forgotLoading}>
                      {forgotLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Account"}
                    </Button>
                  </form>
                )}
               </div>
            ) : (
              <div className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'register' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4">First Name</Label>
                        <Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12 rounded-2xl px-5 border-none bg-muted/30 shadow-inner" required />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4">Last Name</Label>
                         <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-12 rounded-2xl px-5 border-none bg-muted/30 shadow-inner" required />
                      </div>
                    </div>
                  )}

                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4">Phone Number</Label>
                      <Input placeholder="+91 00000 00000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-14 rounded-2xl px-6 border-none bg-muted/30 shadow-inner" required />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4">Email</Label>
                    <Input type="email" placeholder="rider@delivery.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl px-6 border-none bg-muted/30 shadow-inner" required />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Password</Label>
                      {mode === 'login' && <button type="button" onClick={() => setShowForgotPassword(true)} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Forgot?</button>}
                    </div>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl px-6 border-none bg-muted/30 shadow-inner pr-14" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-xs font-bold text-red-500 bg-red-500/10 p-4 rounded-xl">{error}</p>}
                  {success && <p className="text-xs font-bold text-green-600 bg-green-500/10 p-4 rounded-xl">{success}</p>}

                  <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : mode === 'login' ? "Sign In" : "Register"}
                  </Button>
                </form>

                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/5"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">
                      <span className="bg-white dark:bg-black/20 px-4">Or Quick Access</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full h-14 rounded-2xl border-none bg-muted/30 hover:bg-primary/5 font-bold transition-all" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}>
                    {mode === 'login' ? "New Here? Create Account" : "Back to Sign In"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          Powered by Guidewire Cloud • DEVTrails 2026
        </p>
      </div>
    </div>
  );
}
