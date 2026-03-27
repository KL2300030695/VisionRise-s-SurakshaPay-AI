"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, ChevronLeft, ChevronRight, Loader2, Zap, MapPin, User, IndianRupee, Check, AlertCircle, Bike, ShoppingBag, Package } from 'lucide-react';
import { aiPoweredPremiumCalculation } from '@/ai/flows/ai-powered-premium-calculation';
import { validateUpiId } from '@/lib/upi-utils';

type Step = 1 | 2 | 3 | 4;

const PERSONAS = [
  { id: 'Food Delivery (Zomato/Swiggy)', label: 'Food Delivery', platform: 'Zomato / Swiggy', icon: Bike, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'Grocery Delivery (Zepto/Blinkit)', label: 'Grocery Delivery', platform: 'Zepto / Blinkit', icon: ShoppingBag, color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'E-commerce Delivery (Amazon/Flipkart)', label: 'E-commerce', platform: 'Amazon / Flipkart', icon: Package, color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];

const WEATHER_SUMMARIES: Record<string, string> = {
  Mumbai: 'Frequent heavy rain during monsoon (Jul-Sep), occasional flooding in low-lying areas, high humidity year-round.',
  Delhi: 'Extreme heat waves (May-Jun, 42-48°C), severe winters with fog, poor AQI (Nov-Feb), monsoon rain (Jul-Sep).',
  Bangalore: 'Moderate rainfall (Sep-Nov), occasional flooding, pleasant temperature year-round, rare extreme weather.',
  Hyderabad: 'Heavy monsoon rain with flash floods (Jul-Oct), moderate heat in summer, generally dry winters.',
  Chennai: 'Northeast monsoon (Oct-Dec) with heavy rain, cyclone risk, hot and humid summers.',
  Kolkata: 'Heavy monsoon (Jun-Sep), cyclone risk, hot and humid summers, winter fog.',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [persona, setPersona] = useState('');
  const [city, setCity] = useState('');
  const [upiId, setUpiId] = useState('');

  // Premium result
  const [premiumResult, setPremiumResult] = useState<{
    weeklyPremiumAmountINR: number;
    riskFactorsConsidered: string[];
    explanation: string;
  } | null>(null);

  // Policy result
  const [policyId, setPolicyId] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFirstName = localStorage.getItem('surakshapay_workerFirstName') || '';
      const storedLastName = localStorage.getItem('surakshapay_workerLastName') || '';
      const storedEmail = localStorage.getItem('surakshapay_workerEmail') || '';
      const storedPhone = localStorage.getItem('surakshapay_workerPhone') || '';
      const storedUpi = localStorage.getItem('surakshapay_workerUpi') || '';

      if (storedFirstName) setFirstName(storedFirstName);
      if (storedLastName) setLastName(storedLastName);
      if (storedEmail) setEmail(storedEmail);
      if (storedPhone) setPhone(storedPhone);
      if (storedUpi) setUpiId(storedUpi);

      // If everything is present, skip Step 1
      if (storedFirstName && storedLastName && storedEmail && storedPhone && storedUpi) {
        setStep(2);
      }
    }
  }, []);

  const handleGetQuote = async () => {
    if (!persona || !city) {
      setError('Please select both a delivery persona and city.');
      return;
    }
    setIsCalculating(true);
    setError('');

    try {
      const result = await aiPoweredPremiumCalculation({
        gigWorkerPersona: persona,
        operatingCity: city,
        historicalWeatherSummary: WEATHER_SUMMARIES[city] || 'Moderate weather patterns.',
        historicalTrafficSummary: `High congestion during peak hours (8-10 AM, 5-8 PM) in ${city}, frequent road closures for events.`,
        historicalDisruptionSummary: `Sporadic local disruptions, occasional festivals affecting delivery routes in ${city}.`,
      });

      setPremiumResult(result);
      setStep(3);
    } catch (err) {
      setError('Failed to generate your premium quote. Please check your internet connection and try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleActivatePolicy = async () => {
    setIsCreatingPolicy(true);
    setError('');

    try {
      // 1. Call Guidewire PolicyCenter mock API
      const gwRes = await fetch('/api/guidewire/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerName: `${firstName} ${lastName}`,
          email,
          phone,
          persona,
          city,
          weeklyPremium: premiumResult?.weeklyPremiumAmountINR,
          timestamp: new Date().toISOString(),
        }),
      });
      const gwData = await gwRes.json();

      if (!gwData.success) {
        setError('Failed to sync with Guidewire. Please try again.');
        setIsCreatingPolicy(false);
        return;
      }

      // 2. Save all data to MongoDB via /api/onboarding
      const dbRes = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          upiId,
          persona,
          city,
          weeklyPremium: premiumResult?.weeklyPremiumAmountINR,
          riskFactors: premiumResult?.riskFactorsConsidered,
          explanation: premiumResult?.explanation,
          guidewirePolicyId: gwData.policyCenterId,
        }),
      });
      const dbData = await dbRes.json();

      if (dbData.success) {
        // Store workerId for dashboard and session
        if (typeof window !== 'undefined') {
          localStorage.setItem('surakshapay_workerId', dbData.workerId);
          localStorage.setItem('surakshapay_workerName', firstName);
          localStorage.setItem('surakshapay_workerEmail', email);
          localStorage.setItem('surakshapay_workerUpi', upiId);
        }
        setPolicyId(dbData.policyCenterId);
        setStep(4);
      } else {
        setError(dbData.error || 'Failed to save data. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsCreatingPolicy(false);
    }
  };

  const selectedPersona = PERSONAS.find(p => p.id === persona);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/"><ChevronLeft className="h-6 w-6" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black font-headline text-primary">Get Insured in 2 Minutes</h1>
            <p className="text-muted-foreground text-sm">AI-powered weekly income protection</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`h-2 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
          Step {step} of 4 — {step === 1 ? 'Personal Info' : step === 2 ? 'Your Work Profile' : step === 3 ? 'Your AI Quote' : 'Policy Activated!'}
        </p>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <Card className="shadow-2xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Details
              </CardTitle>
              <CardDescription>Tell us a bit about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs">First Name</Label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs">Last Name</Label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="h-12 rounded-xl" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs">Phone Number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" className="h-12 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-primary/70">Payout UPI ID</Label>
                <div className="relative">
                  <Input 
                    value={upiId} 
                    onChange={e => setUpiId(e.target.value)} 
                    placeholder="e.g. name@okaxis" 
                    className="h-12 rounded-xl pr-10 border-primary/20 focus:border-primary transition-all font-medium" 
                    required 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Zap className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">Automatic payouts will be sent to this ID instantly.</p>
              </div>
              <Button
                onClick={() => {
                  if (!firstName || !lastName || !phone || !email || !upiId) {
                    setError('Please fill in all fields including your professional Payout UPI ID.');
                    return;
                  }
                  
                  if (!validateUpiId(upiId)) {
                    setError('Please enter a valid UPI ID (e.g. name@bank). Check for typos or special characters.');
                    return;
                  }

                  setError('');
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('surakshapay_workerFirstName', firstName);
                    localStorage.setItem('surakshapay_workerLastName', lastName);
                    localStorage.setItem('surakshapay_workerEmail', email);
                    localStorage.setItem('surakshapay_workerPhone', phone);
                    localStorage.setItem('surakshapay_workerUpi', upiId);
                  }
                  setStep(2);
                }}
                className="w-full h-12 rounded-xl shadow-lg gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Work Profile */}
        {step === 2 && (
          <Card className="shadow-2xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Your Work Profile
              </CardTitle>
              <CardDescription>Select your delivery persona and operating city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="font-bold text-sm">Delivery Persona</Label>
                <div className="grid gap-3">
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        persona === p.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-muted hover:border-primary/30'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${p.color}`}>
                        <p.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{p.platform}</p>
                      </div>
                      {persona === p.id && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-sm">Operating City</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleGetQuote}
                  className="flex-1 h-12 rounded-xl shadow-lg gap-2"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> AI Calculating Premium...</>
                  ) : (
                    <><Zap className="h-4 w-4" /> Get My AI Quote</>
                  )}
                </Button>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Premium Quote */}
        {step === 3 && premiumResult && (
          <div className="space-y-6">
            <Card className="shadow-2xl border-none overflow-hidden">
              <div className="bg-primary text-white p-8 text-center space-y-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">AI-Generated Quote</Badge>
                <p className="text-5xl font-black">₹{premiumResult.weeklyPremiumAmountINR.toFixed(0)}</p>
                <p className="text-white/80 font-medium">per week</p>
              </div>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground font-bold uppercase">Persona</p>
                    <p className="font-bold mt-1">{selectedPersona?.label}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground font-bold uppercase">City</p>
                    <p className="font-bold mt-1">{city}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl col-span-2">
                    <p className="text-xs text-muted-foreground font-bold uppercase">Daily Coverage</p>
                    <p className="font-bold mt-1">₹500 / disrupted day</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Risk Factors</p>
                  <div className="flex flex-wrap gap-2">
                    {premiumResult.riskFactorsConsidered.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs font-bold text-blue-700 mb-1">AI Explanation</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{premiumResult.explanation}</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 rounded-xl">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Revise
                  </Button>
                  <Button
                    onClick={handleActivatePolicy}
                    className="flex-1 h-12 rounded-xl shadow-lg gap-2"
                    disabled={isCreatingPolicy}
                  >
                    {isCreatingPolicy ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Creating Policy...</>
                    ) : (
                      <><Shield className="h-4 w-4" /> Activate My Policy</>
                    )}
                  </Button>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card className="shadow-2xl border-none text-center overflow-hidden">
            <div className="bg-green-500 text-white p-10 space-y-4">
              <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-black font-headline">You're Protected!</h2>
              <p className="text-white/80">Your weekly income protection is now active</p>
            </div>
            <CardContent className="space-y-6 pt-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Guidewire Policy ID</p>
                  <p className="font-black text-primary mt-1">{policyId}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Weekly Premium</p>
                  <p className="font-black mt-1">₹{premiumResult?.weeklyPremiumAmountINR.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Worker</p>
                  <p className="font-bold mt-1">{firstName} {lastName}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground font-bold uppercase">City</p>
                  <p className="font-bold mt-1">{city}</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl text-sm text-green-800">
                <p className="font-bold mb-1">🎉 What's Next?</p>
                <p>Your policy auto-monitors weather \& disruptions. If a parametric trigger fires (e.g., rain {'>'} 8mm), you'll get an instant ₹500 payout via UPI!</p>
              </div>

              <div className="flex gap-3">
                <Button asChild className="flex-1 h-12 rounded-xl shadow-lg">
                  <Link href="/dashboard">Go to My Dashboard</Link>
                </Button>
                <Button variant="outline" asChild className="h-12 rounded-xl">
                  <Link href="/disruptions">View Live Triggers</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
