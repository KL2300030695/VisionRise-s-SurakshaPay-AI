"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield, ChevronLeft, Loader2, Zap, Clock, CheckCircle2,
  AlertCircle, IndianRupee, BarChart3, FileText, CloudRain,
  ThermometerSun, Wind, BrainCircuit, Activity, ExternalLink,
  TrendingUp, RefreshCw, Cpu, ArrowRight,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ReportIssueDialog } from '@/components/report-issue-dialog';

interface ClaimItem {
  id: string;
  date: string;
  status: string;
  amount: number;
  payout: number;
  isAutomated: boolean;
  triggerSource: string;
  triggerType: string;
  upiPayoutUrl: string | null;
  fraudScore: number | null;
  guidewireClaimId: string;
  disruption: {
    type: string;
    subType: string;
    severity: string;
    source: string;
  } | null;
}

interface ClaimStats {
  totalClaims: number;
  paidClaims: number;
  totalPayouts: number;
  automatedClaims: number;
  automatedPercentage: number;
  avgProcessingTime: string;
  successRate: number;
}

export default function ClaimsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [workerId, setWorkerId] = useState('');
  const [workerCity, setWorkerCity] = useState('');

  const fetchClaims = async () => {
    const wId = typeof window !== 'undefined' ? localStorage.getItem('surakshapay_workerId') : null;
    if (!wId) {
      setError('No worker ID found. Please complete onboarding first.');
      setLoading(false);
      return;
    }
    setWorkerId(wId);

    try {
      const res = await fetch(`/api/claims?workerId=${wId}`);
      const data = await res.json();
      if (data.success) {
        setClaims(data.claims);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load claims');
      }

      // Also fetch dashboard for city info
      const dashRes = await fetch(`/api/dashboard?workerId=${wId}`);
      const dashData = await dashRes.json();
      if (dashData.success) {
        setWorkerCity(dashData.location?.city || 'Unknown');
      }
    } catch {
      setError('Network error fetching claims');
    } finally {
      setLoading(false);
    }
  };

  const runAutoScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/triggers/auto-scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScanResult(data);
        // Refresh claims list after scan
        await fetchClaims();
      }
    } catch {
      // Non-critical
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchClaims();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading your claims...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">{error}</h2>
        <Button asChild><Link href="/onboarding">Get Protected</Link></Button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const getTriggerIcon = (triggerType: string) => {
    const t = triggerType.toLowerCase();
    if (t.includes('rain') || t.includes('flood') || t.includes('water')) return <CloudRain className="h-5 w-5" />;
    if (t.includes('heat') || t.includes('temp')) return <ThermometerSun className="h-5 w-5" />;
    if (t.includes('wind')) return <Wind className="h-5 w-5" />;
    if (t.includes('aqi') || t.includes('air')) return <Activity className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-500/10 text-green-500';
      case 'Initiated': return 'bg-blue-500/10 text-blue-500';
      case 'Under Review': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-lg font-black font-headline text-primary tracking-tight">Claims Management</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Zero-Touch Protection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={runAutoScan} 
            disabled={scanning}
            className="rounded-xl gap-2 font-bold text-xs"
          >
            {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Cpu className="h-3.5 w-3.5" />}
            {scanning ? 'Scanning...' : 'Run Auto-Scan'}
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl gap-2 font-bold text-xs">
            <Link href="/policy"><Shield className="h-3.5 w-3.5" /> My Policy</Link>
          </Button>
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">      
        {/* Zero-Touch Pipeline Visualization */}
        <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 text-white">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="h-6 w-6" />
              <h2 className="text-2xl font-black font-headline tracking-tight">Zero-Touch Claim Pipeline</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-2">
              {[
                { step: 1, icon: '🌧️', title: 'Disruption Detected', desc: 'Live APIs monitor weather, floods & civil alerts 24/7', status: 'auto' },
                { step: 2, icon: '🤖', title: 'AI Validates Claim', desc: 'Gemini-powered fraud detection & risk assessment', status: 'ai' },
                { step: 3, icon: '🛡️', title: 'Guidewire Synced', desc: 'Auto-adjudicated via ClaimCenter integration', status: 'sync' },
                { step: 4, icon: '💰', title: 'UPI Payout Sent', desc: 'Instant ₹500 to your registered UPI in 4.2 min', status: 'paid' },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-center space-y-3 hover:bg-white/15 transition-all h-full">
                    <div className="text-3xl">{item.icon}</div>
                    <p className="text-sm font-black tracking-tight">{item.title}</p>
                    <p className="text-[10px] text-white/60 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-300">Active</span>
                    </div>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-5 w-5 text-white/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto-Scan Result */}
        {scanResult && (
          <Card className="shadow-xl border-none rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 animate-in fade-in slide-in-from-top-4 duration-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm text-green-800 dark:text-green-300">Auto-Scan Complete — {scanResult.scanId}</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Scanned {scanResult.citiesScanned} cities across {scanResult.sourcesPolled?.length || 4} API sources in {scanResult.duration}. 
                    {scanResult.triggersDetected?.length > 0 
                      ? ` Detected ${scanResult.triggersDetected.length} trigger(s), created ${scanResult.totalClaimsCreated} claim(s), total ₹${scanResult.totalPayoutsINR} in payouts.`
                      : ' No active triggers detected at this time. All zones clear.'
                    }
                  </p>
                  {scanResult.triggersDetected?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {scanResult.triggersDetected.map((t: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-xs bg-white dark:bg-black/20 p-3 rounded-xl">
                          <Badge className={t.severity === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}>{t.severity}</Badge>
                          <span className="font-bold text-green-800 dark:text-green-200">{t.triggerType}</span>
                          <span className="text-green-600 dark:text-green-400">— {t.city}</span>
                          <span className="ml-auto font-black text-green-700 dark:text-green-300">₹{t.totalPayoutINR}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
              <CardContent className="pt-6 text-center">
                <FileText className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-2xl font-black">{stats.totalClaims}</p>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">Total Claims</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
              <CardContent className="pt-6 text-center">
                <IndianRupee className="h-5 w-5 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-black text-green-500">₹{stats.totalPayouts}</p>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">Total Paid</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
              <CardContent className="pt-6 text-center">
                <Cpu className="h-5 w-5 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-black">{stats.automatedPercentage}%</p>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">Automated</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
              <CardContent className="pt-6 text-center">
                <Clock className="h-5 w-5 mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-black">{stats.avgProcessingTime}</p>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">Avg Time</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-white/50 dark:bg-muted/30 backdrop-blur-md rounded-2xl transition-all hover:scale-105">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-black">{stats.successRate}%</p>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">Success Rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Sources Card */}
        <Card className="shadow-xl border-none rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-xl">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-base font-black font-headline tracking-tight flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Automated Trigger Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { name: 'Heavy Rainfall', api: 'Open-Meteo', threshold: '> 8mm/hr', color: 'bg-blue-500/10 text-blue-600', live: true },
                { name: 'Extreme Heat', api: 'Open-Meteo', threshold: '> 42°C', color: 'bg-orange-500/10 text-orange-600', live: true },
                { name: 'Poor AQI', api: 'Open-Meteo AQI', threshold: '> 400', color: 'bg-purple-500/10 text-purple-600', live: true },
                { name: 'Flood Alert', api: 'IMD (Mock)', threshold: '≥ Orange', color: 'bg-red-500/10 text-red-600', live: false },
                { name: 'Urban Curfew', api: 'Civil API (Mock)', threshold: '≥ High', color: 'bg-slate-500/10 text-slate-600', live: false },
              ].map((s, i) => (
                <div key={i} className={`p-3 rounded-xl ${s.color} text-center space-y-1`}>
                  <p className="text-[10px] font-black uppercase tracking-widest">{s.name}</p>
                  <p className="text-[9px] font-medium">{s.api}</p>
                  <p className="text-[9px] font-bold">{s.threshold}</p>
                  <Badge variant="outline" className="text-[8px] px-1.5">
                    {s.live ? '🟢 Live' : '🟡 Mock'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card className="shadow-2xl border-none rounded-3xl bg-white/50 dark:bg-black/20 backdrop-blur-2xl">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black font-headline tracking-tight flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" /> Claim History
              </CardTitle>
              <CardDescription className="font-medium mt-1">All automated and manual claims with full lifecycle tracking</CardDescription>
            </div>
            <ReportIssueDialog
              workerId={workerId}
              location={workerCity}
              onSuccess={fetchClaims}
            />
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {claims.length > 0 ? (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div 
                    key={claim.id} 
                    className="flex items-center gap-5 p-5 bg-muted/15 dark:bg-muted/5 rounded-2xl border border-transparent hover:border-primary/10 transition-all group"
                  >
                    {/* Icon */}
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
                      claim.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 
                      claim.status === 'Under Review' ? 'bg-orange-500/10 text-orange-500' : 
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {getTriggerIcon(claim.triggerType)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-sm tracking-tight text-primary truncate">
                          {claim.triggerType || 'Disruption Claim'} — {workerCity}
                        </p>
                        {claim.isAutomated && (
                          <Badge className="bg-blue-500/10 text-blue-500 border-none text-[9px] font-black uppercase px-2 shrink-0">
                            <Cpu className="h-2.5 w-2.5 mr-1" /> Auto
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <span>{formatDate(claim.date)}</span>
                        <span>•</span>
                        <span>{formatTime(claim.date)}</span>
                        <span>•</span>
                        <span>GW: {claim.guidewireClaimId}</span>
                        {claim.triggerSource && claim.triggerSource !== 'Manual' && (
                          <>
                            <span>•</span>
                            <span className="text-primary">{claim.triggerSource}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right shrink-0 space-y-2">
                      <p className={`font-black text-xl tracking-tighter ${claim.status === 'Paid' ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {claim.status === 'Paid' ? '+' : ''}₹{claim.payout || claim.amount}
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <Badge className={`${getStatusColor(claim.status)} border-none font-black text-[9px] uppercase tracking-widest px-2`}>
                          {claim.status}
                        </Badge>
                        {claim.upiPayoutUrl && (
                          <Button
                            size="sm"
                            variant="default"
                            asChild
                            className="h-6 px-2 text-[9px] font-black uppercase rounded-full"
                          >
                            <Link href={`/payout/simulate?amount=${claim.payout || claim.amount}&claimId=${claim.id}`}>
                              <ExternalLink className="h-2.5 w-2.5 mr-1" /> Collect
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-6">
                <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-xl text-muted-foreground/40 uppercase tracking-tight">No Claims Yet</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Your policy is actively monitoring weather, flood, and civil disruption data. When a parametric trigger fires, a claim will be auto-created here.
                  </p>
                </div>
                <Button onClick={runAutoScan} disabled={scanning} className="rounded-xl gap-2 font-black text-xs uppercase">
                  {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
                  Run Manual Scan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
