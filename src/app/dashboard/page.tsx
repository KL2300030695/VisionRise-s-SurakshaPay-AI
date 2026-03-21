"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CloudRain, MessageCircle, Zap, IndianRupee, MapPin, Clock, ChevronRight, Eye, CalendarDays, Activity, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

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
  }>;
  totalPayouts: number;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);

    // Get workerId from localStorage (set during login)
    const workerId = typeof window !== 'undefined' ? localStorage.getItem('surakshapay_workerId') : null;
    const apiUrl = workerId ? `/api/dashboard?workerId=${workerId}` : '/api/dashboard';

    // Fetch dashboard data from MongoDB
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

  if (!dashData?.hasData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md shadow-2xl border-none text-center">
          <CardContent className="pt-10 pb-8 space-y-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-headline">No Policy Found</h2>
              <p className="text-muted-foreground">Complete the onboarding process to get your insurance policy and see your dashboard.</p>
            </div>
            <Button asChild className="h-12 rounded-xl shadow-lg px-8">
              <Link href="/onboarding">Get Insured Now →</Link>
            </Button>
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
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-primary font-headline">SurakshaPay AI</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-sm">
            <Link href="/disruptions"><CloudRain className="h-4 w-4" /> Live Triggers</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="gap-2 text-sm">
            <Link href="/chat"><MessageCircle className="h-4 w-4" /> Support</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-sm">
            <Link href="/login">Sign Out</Link>
          </Button>
        </nav>
      </header>

      <main className="p-6 md:p-12 max-w-6xl mx-auto space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-black font-headline text-primary">
            Welcome, {worker?.firstName || 'Rider'}! 🏍️
          </h1>
          <p className="text-muted-foreground">Here&apos;s your insurance overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg">
            <CardContent className="pt-5 text-center">
              <Shield className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-black text-green-600">{policy?.status || 'N/A'}</p>
              <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Policy Status</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg">
            <CardContent className="pt-5 text-center">
              <IndianRupee className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-black">₹{policy?.premiumAmount || 0}</p>
              <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Weekly Premium</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg">
            <CardContent className="pt-5 text-center">
              <Zap className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-black">₹{totalPayouts}</p>
              <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Total Payouts</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg">
            <CardContent className="pt-5 text-center">
              <Activity className="h-6 w-6 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-black">{weatherSummary?.activeAlerts || 0}</p>
              <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Active Alerts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Policy Card */}
          <Card className="lg:col-span-2 shadow-2xl border-none overflow-hidden">
            <div className="bg-primary text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8" />
                <div>
                  <p className="text-sm text-white/70 font-medium">Your Active Policy</p>
                  <p className="text-xl font-black">{policy?.id?.toString().slice(-12) || 'N/A'}</p>
                </div>
              </div>
              <Badge className="bg-green-400/20 text-green-200 border-green-400/30 hover:bg-green-400/30">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" /> {policy?.status}
              </Badge>
            </div>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Persona</p>
                  <p className="font-bold text-sm mt-1">{personaLabel}</p>
                  {personaPlatform && <p className="text-xs text-muted-foreground">{personaPlatform}</p>}
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">City</p>
                  <p className="font-bold text-sm mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {location?.city || 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Daily Coverage</p>
                  <p className="font-bold text-sm mt-1">₹{policy?.coveragePerDay || 500}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Start Date</p>
                  <p className="font-bold text-sm mt-1 flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {policy?.startDate ? formatDate(policy.startDate) : 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Weekly Premium</p>
                  <p className="font-bold text-sm mt-1">₹{policy?.premiumAmount || 0}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Next Payment</p>
                  <p className="font-bold text-sm mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {policy?.nextPayment ? formatDate(policy.nextPayment) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Quick View */}
          <Card className="shadow-xl border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" /> Weather Watch
              </CardTitle>
              <CardDescription>Live data for your city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {weatherSummary?.weather?.slice(0, 3).map((w: any) => (
                <div key={w.city} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold flex items-center gap-1"><MapPin className="h-3 w-3" /> {w.city}</p>
                    <p className="text-xs text-muted-foreground capitalize">{w.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{w.temp}°</p>
                    <p className="text-[10px] text-muted-foreground">{w.rainMm}mm rain</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-6">Loading weather...</p>
              )}
              <Button variant="outline" size="sm" className="w-full rounded-xl gap-2" asChild>
                <Link href="/disruptions"><CloudRain className="h-4 w-4" /> View All Triggers <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payouts */}
        <Card className="shadow-xl border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Recent Payouts
            </CardTitle>
            <CardDescription>Automatic parametric claim payouts to your UPI</CardDescription>
          </CardHeader>
          <CardContent>
            {paidClaims.length > 0 ? (
              <div className="space-y-3">
                {paidClaims.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Parametric Payout — {location?.city || 'City'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(c.date)} • {c.id.toString().slice(-8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-600">+₹{c.payout || c.amount}</p>
                      <Badge className="bg-green-100 text-green-700 text-[10px]">{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No payouts yet</p>
                <p className="text-sm">When a parametric trigger fires, your payouts will appear here automatically.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" asChild className="h-16 rounded-2xl justify-start gap-3 px-6 shadow-sm hover:shadow-md transition-all">
            <Link href="/chat">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-bold text-sm">AI Support Chat</p>
                <p className="text-xs text-muted-foreground">Ask about your policy</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-16 rounded-2xl justify-start gap-3 px-6 shadow-sm hover:shadow-md transition-all">
            <Link href="/disruptions">
              <CloudRain className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <p className="font-bold text-sm">Live Triggers</p>
                <p className="text-xs text-muted-foreground">Monitor weather alerts</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-16 rounded-2xl justify-start gap-3 px-6 shadow-sm hover:shadow-md transition-all">
            <Link href="/admin">
              <Activity className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <p className="font-bold text-sm">Insurer Analytics</p>
                <p className="text-xs text-muted-foreground">View admin dashboard</p>
              </div>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
