"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, CloudRain, BarChart3, AlertTriangle, TrendingUp, IndianRupee, MapPin, Zap, Loader2, ThermometerSun, BrainCircuit, Activity, LogOut } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart } from 'recharts';
import { simulateParametricTrigger } from '@/lib/parametric-engine';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

const chartConfig = {
  payouts: {
    label: "Payouts",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminUser, setAdminUser] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('surakshapay_adminToken');
    const user = localStorage.getItem('surakshapay_adminUser');
    if (!token) {
      router.replace('/admin/login');
    } else {
      setIsAuthed(true);
      setAdminUser(user || 'Admin');
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('surakshapay_adminToken');
    localStorage.removeItem('surakshapay_adminUser');
    router.replace('/admin/login');
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
    { label: 'Active Policies', value: '12,482', icon: Shield, trend: '+12%', color: 'text-blue-500' },
    { label: 'Total Premiums', value: '₹18.2L', icon: IndianRupee, trend: '+8%', color: 'text-green-500' },
    { label: 'Loss Ratio', value: '34.2%', icon: Activity, trend: '-2.1%', color: 'text-orange-500' },
    { label: 'Fraud Prevention', value: '₹2.4L', icon: BrainCircuit, trend: '+15%', color: 'text-purple-500' },
  ];

  const chartData = [
    { name: 'Mon', claims: 12, payouts: 4500 },
    { name: 'Tue', claims: 19, payouts: 6200 },
    { name: 'Wed', claims: 45, payouts: 15400 },
    { name: 'Thu', claims: 32, payouts: 11000 },
    { name: 'Fri', claims: 28, payouts: 9800 },
    { name: 'Sat', claims: 55, payouts: 22000 },
    { name: 'Sun', claims: 48, payouts: 18500 },
  ];

  const personaDistribution = [
    { name: 'Food', value: 4500, color: 'hsl(var(--primary))' },
    { name: 'Grocery', value: 3200, color: 'hsl(var(--secondary))' },
    { name: 'E-commerce', value: 2800, color: '#3b82f6' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:bg-black/20 backdrop-blur-xl rounded-[2rem] transition-all hover:scale-105">
            <CardContent className="pt-8">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-muted/40 dark:bg-muted/10">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-none px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                  <TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}
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
            <CardDescription className="text-sm font-medium">Automatic parametric claim payouts vs. reserves (INR)</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-8">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-payouts)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-payouts)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="payouts" stroke="var(--color-payouts)" fillOpacity={1} fill="url(#colorPayout)" strokeWidth={4} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-2xl border-none bg-primary text-white overflow-hidden relative h-[280px] rounded-[2.5rem] p-4">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Activity className="h-40 w-40" />
            </div>
            <CardHeader>
              <CardTitle className="text-white text-xl font-black tracking-tight">AI Risk Signal</CardTitle>
              <CardDescription className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Next 72 Hours Forecast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.5)]"></div>
                  <p className="text-sm font-black tracking-tight">Mumbai Heavy Rain</p>
                </div>
                <span className="text-[10px] font-black text-red-100 bg-red-500/20 px-2.5 py-1 rounded-full border border-red-500/20">92% CONF.</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                  <p className="text-sm font-black tracking-tight">Delhi Heat Surge</p>
                </div>
                <span className="text-[10px] font-black text-orange-100 bg-orange-500/20 px-2.5 py-1 rounded-full border border-orange-500/20">74% CONF.</span>
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
            <CardDescription className="text-sm font-medium">Real-time anomaly detection logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {[
              { id: 'WKR-891', type: 'Location Spoofing', risk: 'Critical', status: 'Blocked' },
              { id: 'WKR-452', type: 'Synthetic Data', risk: 'High', status: 'Blocked' },
              { id: 'WKR-112', type: 'Dup-Identity', risk: 'Medium', status: 'Flagged' },
            ].map((fraud, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/20 dark:bg-muted/5 rounded-2xl group transition-all hover:bg-muted/40">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center font-black text-[10px]">AI</div>
                  <div>
                    <p className="text-sm font-black tracking-tight text-primary">{fraud.type}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">UID: {fraud.id} • Risk: {fraud.risk}</p>
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
    </div>
  );
}
