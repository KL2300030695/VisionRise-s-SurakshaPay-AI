"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, CloudRain, BarChart3, AlertTriangle, TrendingUp, IndianRupee, MapPin, Zap, Loader2, ThermometerSun, BrainCircuit, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { simulateParametricTrigger } from '@/lib/parametric-engine';
import { useToast } from '@/hooks/use-toast';

const chartConfig = {
  payouts: {
    label: "Payouts",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AdminPage() {
  const { toast } = useToast();
  const [isSimulating, setIsSimulating] = useState(false);

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

      // Call Mock Guidewire ClaimCenter API
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
    { label: 'Active Policies', value: '12,482', icon: Shield, trend: '+12%', color: 'text-blue-600' },
    { label: 'Total Premiums', value: '₹18.2L', icon: IndianRupee, trend: '+8%', color: 'text-green-600' },
    { label: 'Loss Ratio', value: '34.2%', icon: Activity, trend: '-2.1%', color: 'text-orange-600' },
    { label: 'Fraud Prevention', value: '₹2.4L', icon: BrainCircuit, trend: '+15%', color: 'text-purple-600' },
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
    <div className="min-h-screen bg-background p-6 md:p-12 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline text-primary tracking-tight">Insurer Analytics</h1>
          <p className="text-muted-foreground text-lg">Predictive Risk & Parametric Oversight Dashboard</p>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2 bg-white/50 border p-1.5 rounded-2xl shadow-sm">
            <Button 
              size="sm" 
              className="rounded-xl shadow-lg gap-2" 
              onClick={() => handleTriggerSimulation('Rain')}
              disabled={isSimulating}
            >
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudRain className="h-4 w-4" />}
              Rain Trigger
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              className="rounded-xl shadow-lg gap-2" 
              onClick={() => handleTriggerSimulation('Heat')}
              disabled={isSimulating}
            >
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThermometerSun className="h-4 w-4" />}
              Heat Trigger
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-muted`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                  <TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}
                </Badge>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h2 className="text-3xl font-black mt-1">{stat.value}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-2xl border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline">Weekly Payout Overview</CardTitle>
            <CardDescription>Correlation between triggered disruptions and automated claim payouts (INR)</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-payouts)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-payouts)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="payouts" stroke="var(--color-payouts)" fillOpacity={1} fill="url(#colorPayout)" strokeWidth={3} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-2xl border-none bg-primary text-white overflow-hidden relative h-[250px]">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-white">Predictive Risk Alerts</CardTitle>
              <CardDescription className="text-white/60">AI signals for next week's disruptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
                  <p className="text-sm font-bold">Mumbai Monsoon Peak</p>
                </div>
                <span className="text-xs font-bold text-red-200">92% Prob.</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                  <p className="text-sm font-bold">Delhi Heat Surge</p>
                </div>
                <span className="text-xs font-bold text-orange-200">74% Prob.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-none p-6">
            <h3 className="text-lg font-bold mb-4 font-headline">Portfolio by Persona</h3>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={personaDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {personaDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {personaDistribution.map((p) => (
                <div key={p.name} className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{p.name}</p>
                  <p className="text-sm font-bold">{((p.value / 10500) * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-xl border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" /> Intelligent Fraud Analytics
            </CardTitle>
            <CardDescription>Detected anomalies using AI logic (GPS, Fake Weather, Duplicates)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'WKR-891', type: 'Location Spoofing', risk: 'Critical', status: 'Blocked' },
              { id: 'WKR-452', type: 'Fake Weather Data', risk: 'High', status: 'Blocked' },
              { id: 'WKR-112', type: 'Duplicate Identity', risk: 'Medium', status: 'Flagged' },
            ].map((fraud, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-bold text-xs">AI</div>
                  <div>
                    <p className="text-sm font-bold">{fraud.type}</p>
                    <p className="text-xs text-muted-foreground">ID: {fraud.id} • Risk: {fraud.risk}</p>
                  </div>
                </div>
                <Badge className={fraud.status === 'Blocked' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}>
                  {fraud.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="shadow-xl border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" /> Payout Efficiency
            </CardTitle>
            <CardDescription>Average time from trigger to worker payout</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[250px] space-y-4">
            <div className="relative h-48 w-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent -rotate-45"></div>
              <div className="text-center">
                <p className="text-4xl font-black text-primary">4.2m</p>
                <p className="text-xs text-muted-foreground font-bold uppercase">Avg. Payout Time</p>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground px-8 italic">
              "Parametric automation has reduced claim cycles by 99% compared to traditional models."
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
