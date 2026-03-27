"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CloudRain, MessageCircle, Zap, IndianRupee, MapPin, Clock, ChevronRight, Eye, CalendarDays, Activity, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { ReportIssueDialog } from '@/components/report-issue-dialog';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardData {
  hasData: boolean;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    persona: string;
    onboardingDate: string;
  } | null;
  policy: {
    id: string;
    status: string;
    premiumAmount: number;
    coveragePerDay: number;
    coverageTotal: number;
    startDate: string;
    endDate: string;
    nextPayment: string;
    isPaid: boolean;
  } | null;
  location: {
    city: string;
    state: string;
  } | null;
  claims: Array<{
    id: string;
    date: string;
    status: string;
    amount: number;
    payout: number;
    isAutomated: boolean;
    upiPayoutUrl?: string;
  }>;
  totalPayouts: number;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchDashboardData = () => {
    // Get workerId from localStorage (set during login)
    const workerId = typeof window !== 'undefined' ? localStorage.getItem('surakshapay_workerId') : null;
    const apiUrl = workerId ? `/api/dashboard?workerId=${workerId}` : '/api/dashboard';

    // Fetch dashboard data
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDashData(data);
        } else {
          setError(data.error || 'Failed to load dashboard');
        }
      })
      .catch(() => setError('Network error loading dashboard'))
      .finally(() => setLoading(false));

    // Fetch latest weather summary
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => {
        if (data.success) setWeatherSummary(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Error loading dashboard</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!dashData?.hasData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="absolute top-8 right-8"><ThemeToggle /></div>
        <Card className="max-w-md shadow-2xl border-none text-center bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem]">
          <CardContent className="pt-10 pb-8 space-y-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-headline tracking-tight">Setup Incomplete</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">We couldn&apos;t find an active account for you. Please complete the setup to access your protection dashboard.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="h-14 rounded-2xl shadow-lg px-8 font-black">
                <Link href="/onboarding">Complete Setup Now →</Link>
              </Button>
              <Button variant="ghost" asChild className="font-bold">
                <Link href="/login">Sign In / Switch Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { worker, policy, location, claims, totalPayouts } = dashData;

  // Extract persona label from the full persona string
  const personaLabel = worker?.persona?.split('(')[0]?.trim() || worker?.persona || 'Delivery Partner';
  const personaPlatform = worker?.persona?.match(/\(([^)]+)\)/)?.[1] || '';

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const paidClaims = claims.filter(c => c.status === 'Paid');

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2 group transition-all" href="/">
          <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-primary font-headline tracking-tighter">SurakshaPay AI</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <div className="h-4 w-px bg-border hidden md:block mx-2"></div>
          <Button variant="ghost" size="sm" asChild className="gap-2 text-xs md:text-sm hidden sm:flex font-bold">
            <Link href="/disruptions"><CloudRain className="h-4 w-4" /> Triggers</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="gap-2 text-xs md:text-sm hidden sm:flex font-bold">
            <Link href="/chat"><MessageCircle className="h-4 w-4" /> Support</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs md:text-sm font-bold text-destructive hover:bg-destructive/10">
            <Link href="/login" onClick={() => localStorage.removeItem('surakshapay_workerId')}>Sign Out</Link>
          </Button>
        </nav>
      </header>

      <main className="p-6 md:p-12 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Greeting */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-headline text-primary tracking-tight">
            Welcome, {worker?.firstName || 'Rider'}! 🏍️
          </h1>
          <p className="text-muted-foreground font-medium small-caps tracking-widest text-xs">Real-time parametric protection active</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
            <CardContent className="pt-6 text-center">
              <Shield className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-black text-green-500">{policy?.status || 'N/A'}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Status</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
            <CardContent className="pt-6 text-center">
              <IndianRupee className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-black">₹{policy?.premiumAmount || 0}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Premium</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
            <CardContent className="pt-6 text-center">
              <Zap className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-black">₹{totalPayouts}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Total Paid</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
            <CardContent className="pt-6 text-center">
              <Activity className="h-6 w-6 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-black">{weatherSummary?.activeAlerts || 0}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Alerts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Policy Card */}
          <Card className="lg:col-span-2 shadow-2xl border-none overflow-hidden rounded-3xl bg-white/50 dark:bg-black/20 backdrop-blur-2xl">
            <div className="bg-primary text-white p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xl">
                  <Shield className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs text-white/60 font-black uppercase tracking-widest">Active Policy ID</p>
                  <p className="text-2xl font-black tracking-tighter">{policy?.id?.toString().slice(-12) || 'N/A'}</p>
                </div>
              </div>
              <Badge className="bg-green-400/20 text-green-300 border-none px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" /> {policy?.status}
              </Badge>
            </div>
            <CardContent className="space-y-4 pt-8 p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Persona</p>
                  <p className="font-bold text-base">{personaLabel}</p>
                  {personaPlatform && <p className="text-xs text-muted-foreground font-medium">{personaPlatform}</p>}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Region</p>
                  <p className="font-bold text-base flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {location?.city || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Daily Payout</p>
                  <p className="font-black text-primary text-base">₹{policy?.coveragePerDay || 500}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Effective Since</p>
                  <p className="font-bold text-sm flex items-center gap-1"><CalendarDays className="h-3 w-3 text-muted-foreground" /> {policy?.startDate ? formatDate(policy.startDate) : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Cycle Premium</p>
                  <p className="font-bold text-sm">₹{policy?.premiumAmount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Renewal Date</p>
                  <p className="font-bold text-sm flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" /> {policy?.nextPayment ? formatDate(policy.nextPayment) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Quick View */}
          <Card className="shadow-2xl border-none p-2 rounded-3xl bg-white/50 dark:bg-black/20 backdrop-blur-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black font-headline flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" /> Weather Watch
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest">Regional Monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weatherSummary?.weather?.slice(0, 3).map((w: any) => (
                <div key={w.city} className="flex items-center justify-between p-4 bg-muted/30 dark:bg-muted/10 rounded-2xl hover:bg-muted/50 transition-colors group">
                  <div>
                    <p className="text-sm font-black flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {w.city}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{w.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tighter">{w.temp}°</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{w.rainMm}mm rain</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-10 space-y-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/20" />
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Syncing Data...</p>
                </div>
              )}
              <Button variant="outline" size="lg" className="w-full rounded-2xl gap-2 font-black text-xs uppercase tracking-widest border-none bg-muted hover:bg-primary/10 transition-all mt-2" asChild>
                <Link href="/disruptions">Full AI Risk Map <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payouts */}
        <Card className="shadow-2xl border-none rounded-3xl bg-white/50 dark:bg-black/20 backdrop-blur-2xl">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="flex items-center gap-2 text-xl font-black font-headline">
              <TrendingUp className="h-6 w-6 text-primary" /> Automated Payout History
            </CardTitle>
            <CardDescription className="font-medium text-sm">Direct to UPI transfers triggered by environmental data</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {paidClaims.length > 0 ? (
              <div className="space-y-4">
                {paidClaims.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-5 bg-muted/20 dark:bg-muted/5 rounded-[1.5rem] border border-transparent hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-base text-primary tracking-tight">Income Protection — {location?.city || 'City'}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{formatDate(c.date)} • COMPL-ID: {c.id.toString().slice(-8)}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-black text-2xl text-green-500 tracking-tighter cursor-default">+₹{c.payout || c.amount}</p>
                      <div className="flex gap-2">
                        {c.upiPayoutUrl ? (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest px-3 h-7 rounded-full shadow-lg transition-all hover:scale-105"
                            onClick={() => window.open(c.upiPayoutUrl, '_blank')}
                          >
                            Collect Payout
                          </Button>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-500 border-none font-black text-[10px] uppercase tracking-widest px-3">VERIFIED</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-6">
                <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto grayscale opacity-50">
                  <Zap className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-xl text-primary tracking-tight text-muted-foreground/40 uppercase">Awaiting Trigger</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">When our AI detects rain or heat disruptions in {location?.city || 'your city'}, verified payouts will appear here in seconds.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <ReportIssueDialog 
            workerId={worker?.id || ""} 
            location={location?.city || "Unknown"} 
            onSuccess={fetchDashboardData}
          />
          <Button variant="outline" asChild className="h-20 rounded-[1.5rem] justify-start gap-4 px-6 shadow-xl border-none bg-white dark:bg-black/40 hover:bg-primary/5 transition-all group">
            <Link href="/chat">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">AI Concierge</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Insurance Help</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-20 rounded-[1.5rem] justify-start gap-4 px-6 shadow-xl border-none bg-white dark:bg-black/40 hover:bg-primary/5 transition-all group">
            <Link href="/disruptions">
               <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                <CloudRain className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">Live Map</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Alerts</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-20 rounded-[1.5rem] justify-start gap-4 px-6 shadow-xl border-none bg-white dark:bg-black/40 hover:bg-primary/5 transition-all group">
            <Link href="/admin">
               <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">Provider Hub</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Insurer View</p>
              </div>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
