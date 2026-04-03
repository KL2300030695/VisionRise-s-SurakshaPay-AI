"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, ChevronLeft, Loader2, IndianRupee, MapPin, 
  CalendarDays, Clock, RefreshCw, TrendingDown, TrendingUp,
  Zap, BrainCircuit, ChevronRight, FileText, BarChart3,
  CheckCircle2, AlertCircle, ArrowDown, ArrowUp, Minus
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PricingFactor {
  factor: string;
  label: string;
  adjustment: number;
  description: string;
  confidence: number;
  icon: string;
}

interface DynamicPremiumData {
  basePremium: number;
  adjustedPremium: number;
  totalAdjustment: number;
  factors: PricingFactor[];
  riskScore: number;
  nextRecalculation: string;
  modelVersion: string;
}

export default function PolicyPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [dashData, setDashData] = useState<any>(null);
  const [premiumData, setPremiumData] = useState<DynamicPremiumData | null>(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const workerId = typeof window !== 'undefined' ? localStorage.getItem('surakshapay_workerId') : null;
    if (!workerId) {
      setError('No worker ID found. Please complete onboarding first.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/dashboard?workerId=${workerId}`);
      const data = await res.json();
      if (data.success) {
        setDashData(data);
        // Auto-fetch dynamic premium
        await fetchPremium(workerId);
      } else {
        setError('Failed to load policy data');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPremium = async (workerId: string) => {
    try {
      const res = await fetch('/api/premium/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      });
      const data = await res.json();
      if (data.success) {
        setPremiumData(data);
      }
    } catch {
      // Non-critical, premium breakdown just won't show
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    const workerId = typeof window !== 'undefined' ? localStorage.getItem('surakshapay_workerId') : null;
    if (workerId) {
      await fetchPremium(workerId);
    }
    setRecalculating(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (error || !dashData?.hasData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">{error || 'No policy found'}</h2>
        <Button asChild><Link href="/onboarding">Get Protected Now</Link></Button>
      </div>
    );
  }

  const { worker, policy, location, claims, totalPayouts } = dashData;
  const personaLabel = worker?.persona?.split('(')[0]?.trim() || 'Delivery Partner';

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const policyProgress = (() => {
    if (!policy?.startDate || !policy?.endDate) return 50;
    const start = new Date(policy.startDate).getTime();
    const end = new Date(policy.endDate).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-lg font-black font-headline text-primary tracking-tight">Policy Management</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI-Powered Coverage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-xl gap-2 font-bold text-xs">
            <Link href="/claims"><FileText className="h-3.5 w-3.5" /> My Claims</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl gap-2 font-bold text-xs">
            <Link href="/dashboard"><BarChart3 className="h-3.5 w-3.5" /> Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Policy Card Hero */}
        <Card className="shadow-2xl border-none overflow-hidden rounded-3xl">
          <div className="bg-gradient-to-br from-primary via-primary to-primary/80 text-white p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl">
                  <Shield className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Active Policy ID</p>
                  <p className="text-3xl font-black tracking-tighter">{policy?.id?.toString().slice(-12) || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-400/20 text-green-300 border-none px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                  <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" /> {policy?.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
              <div className="space-y-1">
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Persona</p>
                <p className="font-bold text-base">{personaLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Region</p>
                <p className="font-bold text-base flex items-center gap-1"><MapPin className="h-3 w-3" /> {location?.city || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Daily Coverage</p>
                <p className="font-black text-xl">₹{policy?.coveragePerDay || 500}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Total Paid Out</p>
                <p className="font-black text-xl text-green-300">₹{totalPayouts}</p>
              </div>
            </div>
          </div>

          {/* Policy Timeline */}
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <span>Coverage Period</span>
                <span>{Math.round(policyProgress)}% elapsed</span>
              </div>
              <Progress value={policyProgress} className="h-3 rounded-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {policy?.startDate ? formatDate(policy.startDate) : 'N/A'}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Renewal: {policy?.nextPayment ? formatDate(policy.nextPayment) : 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-2xl text-center">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Premium</p>
                <p className="text-2xl font-black text-primary mt-1">₹{policy?.premiumAmount || 0}</p>
                <p className="text-[10px] text-muted-foreground font-medium">per week</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl text-center">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Max Coverage</p>
                <p className="text-2xl font-black mt-1">₹{policy?.coverageTotal || 3500}</p>
                <p className="text-[10px] text-muted-foreground font-medium">per cycle</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl text-center">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Claims</p>
                <p className="text-2xl font-black mt-1">{claims?.length || 0}</p>
                <p className="text-[10px] text-muted-foreground font-medium">total filed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Premium Breakdown */}
        <Card className="shadow-2xl border-none rounded-3xl bg-white/50 dark:bg-black/20 backdrop-blur-2xl overflow-hidden">
          <CardHeader className="p-8 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black font-headline tracking-tight flex items-center gap-3">
                <BrainCircuit className="h-7 w-7 text-primary" /> AI Dynamic Pricing
              </CardTitle>
              <CardDescription className="font-medium mt-1">
                Your premium is personalized using 5 ML-powered risk factors
              </CardDescription>
            </div>
            <Button 
              onClick={handleRecalculate} 
              disabled={recalculating}
              className="rounded-xl gap-2 font-black text-xs uppercase tracking-widest h-11 px-5"
            >
              {recalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Recalculate
            </Button>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {premiumData ? (
              <>
                {/* Premium Summary */}
                <div className="flex items-center gap-8 p-6 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent rounded-2xl border border-primary/10">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Base</p>
                    <p className="text-3xl font-black text-muted-foreground">₹{premiumData.basePremium}</p>
                  </div>
                  <div className="text-center">
                    {premiumData.totalAdjustment > 0 ? (
                      <ArrowUp className="h-5 w-5 text-red-500 mx-auto" />
                    ) : premiumData.totalAdjustment < 0 ? (
                      <ArrowDown className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                    <p className={`text-lg font-black ${premiumData.totalAdjustment > 0 ? 'text-red-500' : premiumData.totalAdjustment < 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {premiumData.totalAdjustment > 0 ? '+' : ''}₹{premiumData.totalAdjustment.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center bg-primary text-white px-6 py-4 rounded-2xl shadow-xl">
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Your Premium</p>
                    <p className="text-4xl font-black">₹{premiumData.adjustedPremium}</p>
                    <p className="text-[10px] text-white/60 font-medium">per week</p>
                  </div>
                  <div className="ml-auto text-center">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Risk Score</p>
                    <p className={`text-3xl font-black ${premiumData.riskScore > 60 ? 'text-red-500' : premiumData.riskScore > 35 ? 'text-orange-500' : 'text-green-500'}`}>
                      {premiumData.riskScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">/ 100</p>
                  </div>
                </div>

                {/* Factor Breakdown */}
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Premium Adjustment Factors</p>
                  {premiumData.factors.map((factor, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-muted/20 dark:bg-muted/5 rounded-2xl hover:bg-muted/30 transition-all group">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        {factor.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-sm tracking-tight">{factor.label}</p>
                          <Badge variant="outline" className="text-[9px] px-2 py-0 font-bold">
                            {Math.round(factor.confidence * 100)}% conf.
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{factor.description}</p>
                      </div>
                      <div className={`text-right font-black text-lg shrink-0 ${factor.adjustment > 0 ? 'text-red-500' : factor.adjustment < 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {factor.adjustment > 0 ? '+' : ''}₹{factor.adjustment.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Model Info */}
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl text-xs text-muted-foreground">
                  <span className="font-bold">Model: {premiumData.modelVersion}</span>
                  <span>Next auto-recalculation: {formatDate(premiumData.nextRecalculation)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/30" />
                <p className="text-sm text-muted-foreground">Loading premium breakdown...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="outline" asChild className="h-20 rounded-2xl justify-start gap-4 px-6 shadow-xl border-none bg-white dark:bg-black/40 hover:bg-primary/5 transition-all group">
            <Link href="/claims">
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">Claims History</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">View All Payouts</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-20 rounded-2xl justify-start gap-4 px-6 shadow-xl border-none bg-white dark:bg-black/40 hover:bg-primary/5 transition-all group">
            <Link href="/disruptions">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">Live Triggers</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weather Monitoring</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-20 rounded-2xl justify-start gap-4 px-6 shadow-xl border-none bg-white dark:bg-black/40 hover:bg-primary/5 transition-all group">
            <Link href="/chat">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">AI Support</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Policy Help</p>
              </div>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
