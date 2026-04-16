"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, CloudRain, BarChart3, AlertTriangle, TrendingUp, TrendingDown, IndianRupee, MapPin, Zap, Loader2, ThermometerSun, BrainCircuit, Activity, LogOut, Plus, Trash2, Search, Eye, Droplets, Wind, Gauge } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart, CartesianGrid, Legend } from 'recharts';
import { simulateParametricTrigger } from '@/lib/parametric-engine';
import { validateUpiId } from '@/lib/upi-utils';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const chartConfig = {
  payouts: {
    label: "Payouts",
    color: "hsl(var(--primary))",
  },
  premiums: {
    label: "Premiums Collected",
    color: "#22c55e",
  },
} satisfies ChartConfig;

// Predictive analytics data — simulated ML forecast for next week
const predictiveData = [
  { city: 'Mumbai', riskType: 'Heavy Rainfall', probability: 92, expectedClaims: 145, estimatedPayout: 72500, trend: 'up', riskLevel: 'Critical' },
  { city: 'Delhi', riskType: 'Extreme Heat', probability: 78, expectedClaims: 89, estimatedPayout: 44500, trend: 'up', riskLevel: 'High' },
  { city: 'Chennai', riskType: 'Cyclone Watch', probability: 65, expectedClaims: 62, estimatedPayout: 46500, trend: 'stable', riskLevel: 'High' },
  { city: 'Kolkata', riskType: 'Flood Alert', probability: 54, expectedClaims: 38, estimatedPayout: 19000, trend: 'down', riskLevel: 'Medium' },
  { city: 'Bangalore', riskType: 'Waterlogging', probability: 41, expectedClaims: 22, estimatedPayout: 11000, trend: 'down', riskLevel: 'Medium' },
  { city: 'Hyderabad', riskType: 'Poor AQI', probability: 33, expectedClaims: 15, estimatedPayout: 7500, trend: 'stable', riskLevel: 'Low' },
];

// Weekly loss ratio trend
const lossRatioTrend = [
  { week: 'W1', lossRatio: 28, premiums: 312000, claims: 87360 },
  { week: 'W2', lossRatio: 32, premiums: 318000, claims: 101760 },
  { week: 'W3', lossRatio: 45, premiums: 324000, claims: 145800 },
  { week: 'W4', lossRatio: 38, premiums: 330000, claims: 125400 },
  { week: 'W5', lossRatio: 34, premiums: 336000, claims: 114240 },
  { week: 'W6', lossRatio: 31, premiums: 342000, claims: 106020 },
];

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  
  // Worker management state
  const [workers, setWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    upiId: '',
    persona: 'Food Delivery (Zomato/Swiggy)'
  });

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const res = await fetch('/api/admin/workers');
      const data = await res.json();
      if (data.success) setWorkers(data.workers);
    } catch (err) {
      console.error("Failed to fetch workers", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handleAddWorker = async () => {
    if (!newWorker.firstName || !newWorker.lastName || !newWorker.email || !newWorker.upiId) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required partner details." });
      return;
    }

    if (!validateUpiId(newWorker.upiId)) {
      toast({ variant: "destructive", title: "Invalid UPI ID", description: "Please enter a valid UPI format (e.g. name@bank)." });
      return;
    }

    try {
      const res = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorker)
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Worker Added", description: `${newWorker.firstName} has been registered.` });
        setIsAddDialogOpen(false);
        setNewWorker({ firstName: '', lastName: '', email: '', phoneNumber: '', upiId: '', persona: 'Food Delivery (Zomato/Swiggy)' });
        fetchWorkers();
      } else {
        toast({ variant: "destructive", title: "Error", description: data.error });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Network error" });
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (!confirm("Are you sure you want to remove this worker?")) return;
    try {
      const res = await fetch(`/api/admin/workers?workerId=${workerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Worker Removed", description: "The worker has been deleted from the records." });
        fetchWorkers();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete worker" });
    }
  };

  useEffect(() => {
    // Middleware handles the heavy lifting, but we still need the username for the UI
    const adminUser = localStorage.getItem('surakshapay_adminUser');
    setAdminUser(adminUser || 'Admin');
    setIsAuthed(true); // Since middleware already verified the cookie
    fetchWorkers();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin-auth/logout', { method: 'POST' });
      localStorage.removeItem('surakshapay_adminUser');
      router.replace('/admin/login');
    } catch (err) {
      console.error("Logout failed", err);
      // Fallback redirect
      router.replace('/admin/login');
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  const handleTriggerSimulation = async (type: 'Rain' | 'Heat') => {
    setIsSimulating(true);
    try {
      if (type === 'Rain') {
        await simulateParametricTrigger({
          type: 'Environmental',
          subType: 'Heavy Rain',
          severity: 'High',
          location: 'Mumbai',
          description: 'Flash flooding detected. Rainfall > 15mm/hr in suburban zones.',
        });
      } else {
        await simulateParametricTrigger({
          type: 'Environmental',
          subType: 'Extreme Heat',
          severity: 'Critical',
          location: 'Delhi',
          description: 'Temperatures exceeded 45°C. Health warning issued for outdoor workers.',
        });
      }

      const claimResponse = await fetch('/api/guidewire/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType: type, timestamp: new Date().toISOString() })
      });
      const claimData = await claimResponse.json();

      toast({
        title: "Simulation & Guidewire Sync Successful",
        description: `Parametric engine processed claims for affected ${type === 'Rain' ? 'Mumbai' : 'Delhi'} policies. Guidewire ClaimCenter ID: ${claimData.claimCenterId}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Simulation Failed",
        description: "Could not trigger the parametric engine.",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const stats = [
    { label: 'Active Policies', value: '12,482', icon: Shield, trend: '+12%', color: 'text-blue-500', trendDir: 'up' },
    { label: 'Total Premiums', value: '₹18.2L', icon: IndianRupee, trend: '+8%', color: 'text-green-500', trendDir: 'up' },
    { label: 'Loss Ratio', value: '34.2%', icon: Gauge, trend: '-2.1%', color: 'text-orange-500', trendDir: 'down' },
    { label: 'Fraud Prevented', value: '₹2.4L', icon: BrainCircuit, trend: '+15%', color: 'text-purple-500', trendDir: 'up' },
  ];

  const chartData = [
    { name: 'Mon', claims: 12, payouts: 4500, premiums: 8200 },
    { name: 'Tue', claims: 19, payouts: 6200, premiums: 8400 },
    { name: 'Wed', claims: 45, payouts: 15400, premiums: 8600 },
    { name: 'Thu', claims: 32, payouts: 11000, premiums: 8800 },
    { name: 'Fri', claims: 28, payouts: 9800, premiums: 9000 },
    { name: 'Sat', claims: 55, payouts: 22000, premiums: 9200 },
    { name: 'Sun', claims: 48, payouts: 18500, premiums: 9400 },
  ];

  const personaDistribution = [
    { name: 'Food', value: 4500, color: 'hsl(var(--primary))' },
    { name: 'Grocery', value: 3200, color: '#22c55e' },
    { name: 'E-commerce', value: 2800, color: '#3b82f6' },
  ];

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default: return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-headline text-primary tracking-tighter">Insurer Analytics</h1>
          <p className="text-muted-foreground font-medium">Predictive Risk & Parametric Oversight • <span className="text-primary font-bold">Guidewire Cloud Verified</span></p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex gap-2 bg-muted/50 dark:bg-muted/10 p-1.5 rounded-[1.25rem] backdrop-blur-md">
            <Button 
              size="sm" 
              className="rounded-xl shadow-lg gap-2 font-black text-xs uppercase tracking-widest px-4" 
              onClick={() => handleTriggerSimulation('Rain')}
              disabled={isSimulating}
            >
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudRain className="h-4 w-4" />}
              Rain Trigger
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              className="rounded-xl shadow-lg gap-2 font-black text-xs uppercase tracking-widest px-4 border-none" 
              onClick={() => handleTriggerSimulation('Heat')}
              disabled={isSimulating}
            >
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThermometerSun className="h-4 w-4" />}
              Heat Trigger
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-xl gap-2 text-muted-foreground font-bold hover:text-red-500 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-2xl border-none h-12 w-fit">
          <TabsTrigger value="analytics" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <BarChart3 className="h-3.5 w-3.5 mr-2" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="predictive" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Eye className="h-3.5 w-3.5 mr-2" /> Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="workers" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Users className="h-3.5 w-3.5 mr-2" /> Manage Workers
          </TabsTrigger>
        </TabsList>

        {/* ========== ANALYTICS TAB ========== */}
        <TabsContent value="analytics" className="space-y-10 focus-visible:ring-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:bg-black/20 backdrop-blur-xl rounded-[2rem] transition-all hover:scale-105">
                <CardContent className="pt-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-2xl bg-muted/40 dark:bg-muted/10">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge className={`${stat.trendDir === 'down' && stat.label === 'Loss Ratio' ? 'bg-green-500/10 text-green-500' : 'bg-green-500/10 text-green-500'} border-none px-3 py-1 font-black text-[10px] tracking-widest uppercase`}>
                      {stat.trendDir === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />} {stat.trend}
                    </Badge>
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <h2 className="text-4xl font-black tracking-tighter">{stat.value}</h2>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 shadow-2xl border-none rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-2xl overflow-hidden p-6">
              <CardHeader className="px-4">
                <CardTitle className="text-2xl font-black font-headline tracking-tight">System Liquidity Overview</CardTitle>
                <CardDescription className="text-sm font-medium">Automatic parametric claim payouts vs. premium reserves (INR)</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] pt-8">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-payouts)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-payouts)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPremiums" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="premiums" stroke="#22c55e" fillOpacity={1} fill="url(#colorPremiums)" strokeWidth={2} strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="payouts" stroke="var(--color-payouts)" fillOpacity={1} fill="url(#colorPayout)" strokeWidth={4} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {/* Loss Ratio Detailed Card */}
              <Card className="shadow-2xl border-none bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden relative rounded-[2.5rem] p-4">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Gauge className="h-40 w-40" />
                </div>
                <CardHeader>
                  <CardTitle className="text-white text-xl font-black tracking-tight">Loss Ratio Analysis</CardTitle>
                  <CardDescription className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Premiums vs Claims Paid</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="text-center py-2">
                    <p className="text-6xl font-black tracking-tighter">34.2%</p>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-2">Current Loss Ratio</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xl border border-white/5 text-center">
                      <p className="text-lg font-black">₹18.2L</p>
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Premiums</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xl border border-white/5 text-center">
                      <p className="text-lg font-black">₹6.2L</p>
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Claims Paid</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/5">
                    <TrendingDown className="h-4 w-4 text-green-300" />
                    <p className="text-[11px] font-bold text-white/80">Loss ratio improved by 2.1% vs last week due to AI fraud prevention.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white dark:bg-black/20 backdrop-blur-xl p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black font-headline tracking-tight">Portfolio Allocation</h3>
                    <Activity className="h-4 w-4 text-primary" />
                 </div>
                <div className="h-[140px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={personaDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {personaDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xl font-black text-primary">12.4k</p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-8">
                  {personaDistribution.map((p) => (
                    <div key={p.name} className="text-center">
                      <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">{p.name}</p>
                      <p className="text-xs font-black text-primary">{((p.value / 10500) * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-2xl p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black font-headline">
                  <BrainCircuit className="h-6 w-6 text-primary" /> Cognitive Fraud Shield
                </CardTitle>
                <CardDescription className="text-sm font-medium">AI-powered anomaly detection — GPS spoofing, fake weather, duplicates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {[
                  { id: 'WKR-891', type: 'GPS Spoofing', risk: 'Critical', status: 'Blocked', detail: 'Location jumped 15km in 2min' },
                  { id: 'WKR-452', type: 'Fake Weather Claim', risk: 'High', status: 'Blocked', detail: 'Historical data shows clear skies' },
                  { id: 'WKR-223', type: 'Duplicate Claim', risk: 'High', status: 'Blocked', detail: 'Same event claimed twice in 1hr' },
                  { id: 'WKR-112', type: 'Activity Mismatch', risk: 'Medium', status: 'Flagged', detail: 'Worker inactive during claimed period' },
                ].map((fraud, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/20 dark:bg-muted/5 rounded-2xl group transition-all hover:bg-muted/40">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center font-black text-[10px]">AI</div>
                      <div>
                        <p className="text-sm font-black tracking-tight text-primary">{fraud.type}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">UID: {fraud.id} • {fraud.detail}</p>
                      </div>
                    </div>
                    <Badge className={fraud.status === 'Blocked' ? 'bg-red-500/10 text-red-500 border-none font-black text-[10px] uppercase tracking-widest px-3' : 'bg-orange-500/10 text-orange-500 border-none font-black text-[10px] uppercase tracking-widest px-3'}>
                      {fraud.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-2xl p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black font-headline">
                  <TrendingUp className="h-6 w-6 text-primary" /> Settlement Velocity
                </CardTitle>
                <CardDescription className="text-sm font-medium">Average parametric payout reconciliation time</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[300px] space-y-8 pt-4">
                <div className="relative h-44 w-44 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[12px] border-muted dark:border-muted/10"></div>
                  <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent -rotate-45 shadow-[0_0_20px_rgba(var(--primary),0.2)]"></div>
                  <div className="text-center">
                    <p className="text-5xl font-black text-primary tracking-tighter">4.2m</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">E2E Flow</p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground/60 px-10 font-bold uppercase tracking-widest leading-relaxed">
                  Automation has reduced legacy claim cycles by 1,200x
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== PREDICTIVE ANALYTICS TAB ========== */}
        <TabsContent value="predictive" className="space-y-8 focus-visible:ring-0">
          {/* Predictive Header */}
          <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary via-primary to-violet-700 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Predictive Analytics Engine</h2>
                <p className="text-white/60 font-medium text-sm max-w-lg">
                  AI-powered forecast of next week&apos;s likely weather and disruption claims across all 6 monitored cities. Uses historical patterns, seasonal data, and live forecast APIs.
                </p>
              </div>
              <Badge className="bg-white/10 text-white/80 border-white/10 font-black text-[10px] uppercase tracking-widest px-4 py-2">
                <Activity className="h-3 w-3 mr-1.5 animate-pulse" /> Live Model
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xl border border-white/5">
                <p className="text-3xl font-black">371</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Expected Claims Next Week</p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xl border border-white/5">
                <p className="text-3xl font-black">₹2.01L</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Estimated Payouts</p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xl border border-white/5">
                <p className="text-3xl font-black">3/6</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Cities At High Risk</p>
              </div>
            </div>
          </Card>

          {/* City-Wise Disruption Forecast Table */}
          <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-2xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black font-headline tracking-tight flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" /> City-Wise Disruption Forecast
              </CardTitle>
              <CardDescription>Next week&apos;s likely weather/disruption claims by city with AI confidence scores</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-muted/20">
                    <TableHead className="font-black uppercase tracking-widest text-[10px] pl-8">City</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Predicted Risk</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">AI Confidence</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Est. Claims</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Est. Payout</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Trend</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px] pr-8 text-right">Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictiveData.map((city, i) => (
                    <TableRow key={i} className="hover:bg-primary/5 transition-colors border-muted/10">
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <p className="font-black text-sm">{city.city}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold">{city.riskType}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={city.probability} className="h-2 w-16" />
                          <span className="text-xs font-black">{city.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-black">{city.expectedClaims}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-black text-primary">₹{city.estimatedPayout.toLocaleString('en-IN')}</p>
                      </TableCell>
                      <TableCell>
                        {city.trend === 'up' ? (
                          <Badge className="bg-red-500/10 text-red-500 border-none text-[9px] font-black uppercase gap-1">
                            <TrendingUp className="h-3 w-3" /> Rising
                          </Badge>
                        ) : city.trend === 'down' ? (
                          <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] font-black uppercase gap-1">
                            <TrendingDown className="h-3 w-3" /> Falling
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500/10 text-blue-500 border-none text-[9px] font-black uppercase gap-1">
                            Stable
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge className={`${getRiskColor(city.riskLevel)} border font-black text-[10px] uppercase tracking-widest px-3`}>
                          {city.riskLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Loss Ratio Weekly Trend */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-2xl p-6">
              <CardHeader>
                <CardTitle className="text-xl font-black font-headline tracking-tight flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" /> Loss Ratio Weekly Trend
                </CardTitle>
                <CardDescription className="font-medium">6-week loss ratio trend showing premiums vs claims efficiency</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lossRatioTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="week" stroke="#888" fontSize={10} fontWeight="900" />
                    <YAxis stroke="#888" fontSize={10} fontWeight="900" tickFormatter={(v) => `${v}%`} />
                    <Tooltip />
                    <Bar dataKey="lossRatio" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Predictive Alerts */}
            <Card className="shadow-2xl border-none bg-primary text-white overflow-hidden relative rounded-[2.5rem] p-4">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Activity className="h-40 w-40" />
              </div>
              <CardHeader>
                <CardTitle className="text-white text-xl font-black tracking-tight">Predictive Risk Alerts</CardTitle>
                <CardDescription className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Next week&apos;s likely weather/disruption claims</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {predictiveData.filter(d => d.probability >= 50).map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        alert.riskLevel === 'Critical' ? 'bg-red-400 animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.5)]' :
                        alert.riskLevel === 'High' ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]' :
                        'bg-yellow-400'
                      }`}></div>
                      <div>
                        <p className="text-sm font-black tracking-tight">{alert.city} — {alert.riskType}</p>
                        <p className="text-[10px] text-white/40 font-medium">{alert.expectedClaims} claims expected • ₹{alert.estimatedPayout.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      alert.riskLevel === 'Critical' ? 'text-red-100 bg-red-500/20 border-red-500/20' :
                      alert.riskLevel === 'High' ? 'text-orange-100 bg-orange-500/20 border-orange-500/20' :
                      'text-yellow-100 bg-yellow-500/20 border-yellow-500/20'
                    }`}>{alert.probability}% CONF.</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== WORKERS TAB ========== */}
        <TabsContent value="workers" className="space-y-6 focus-visible:ring-0">
          <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-2xl overflow-hidden">
            <CardHeader className="p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black font-headline tracking-tight">Gig Workforce</CardTitle>
                <CardDescription>Manage active delivery partners and their accounts</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl font-black text-xs uppercase tracking-widest gap-2 h-12 px-6">
                    <Plus className="h-4 w-4" /> Add Partner
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-none shadow-2xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black font-headline">Register New Partner</DialogTitle>
                    <DialogDescription>Manually add a worker to the protection system.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">First Name</Label>
                        <Input value={newWorker.firstName} onChange={e => setNewWorker({...newWorker, firstName: e.target.value})} className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Last Name</Label>
                        <Input value={newWorker.lastName} onChange={e => setNewWorker({...newWorker, lastName: e.target.value})} className="rounded-xl h-12" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                      <Input value={newWorker.email} onChange={e => setNewWorker({...newWorker, email: e.target.value})} className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">UPI ID (for payouts)</Label>
                      <Input value={newWorker.upiId} onChange={e => setNewWorker({...newWorker, upiId: e.target.value})} placeholder="id@bank" className="rounded-xl h-12" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddWorker} className="w-full h-12 rounded-xl font-black uppercase tracking-widest">Register Partner</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-muted/20">
                    <TableHead className="w-[200px] font-black uppercase tracking-widest text-[10px] pl-8">Worker Details</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Persona</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">UPI Info</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                    <TableHead className="text-right font-black uppercase tracking-widest text-[10px] pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingWorkers ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-muted-foreground">Loading workforce data...</p>
                      </TableCell>
                    </TableRow>
                  ) : workers.map((worker) => (
                    <TableRow key={worker.id} className="hover:bg-primary/5 transition-colors border-muted/10">
                      <TableCell className="py-6 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                            {worker.firstName[0]}{worker.lastName[0]}
                          </div>
                          <div>
                            <p className="font-black text-sm tracking-tight">{worker.firstName} {worker.lastName}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{worker.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-black uppercase border-muted/50">
                          {worker.deliveryPartnerCategory?.[0]?.split('(')[0] || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-mono text-muted-foreground">{worker.upiId || 'NOT_SET'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-none font-black text-[10px] uppercase tracking-widest">ACTIVE</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteWorker(worker.id)}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
