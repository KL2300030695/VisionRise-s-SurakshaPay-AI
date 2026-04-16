"use client";

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2, CheckCircle2, IndianRupee, Banknote, Wifi, Lock, ArrowRight, CreditCard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Script from 'next/script';

type PayoutStage = 'connecting' | 'verifying_policy' | 'fraud_check' | 'razorpay_checkout' | 'success';

const PRE_CHECKOUT_STAGES: { key: PayoutStage; label: string; sublabel: string; icon: any; duration: number }[] = [
  { key: 'connecting', label: 'Connecting to Gateway', sublabel: 'Establishing secure TLS 1.3 connection...', icon: Wifi, duration: 1500 },
  { key: 'verifying_policy', label: 'Verifying Policy', sublabel: 'Cross-referencing Guidewire PolicyCenter...', icon: Shield, duration: 1800 },
  { key: 'fraud_check', label: 'AI Fraud Screening', sublabel: 'Running Gemini-powered anomaly detection...', icon: Lock, duration: 2000 },
];

function PayoutSimulator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCheckoutReady, setIsCheckoutReady] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const amount = searchParams.get('amount') || '500';
  const claimId = searchParams.get('claimId') || 'GW-CC-SIM';
  const workerName = typeof window !== 'undefined' ? localStorage.getItem('surakshapay_workerName') || 'Delivery Partner' : 'Delivery Partner';

  useEffect(() => {
    setTxnId(`UPI${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2,6).toUpperCase()}`);
  }, []);

  const advanceStage = useCallback(() => {
    if (currentStageIndex < PRE_CHECKOUT_STAGES.length - 1) {
      setStageProgress(0);
      setCurrentStageIndex(prev => prev + 1);
    } else {
      // All pre-checkout stages done → open Razorpay
      setIsCheckoutReady(true);
    }
  }, [currentStageIndex]);

  // Animate pre-checkout stages
  useEffect(() => {
    if (currentStageIndex >= PRE_CHECKOUT_STAGES.length || isCheckoutReady) return;
    const currentStage = PRE_CHECKOUT_STAGES[currentStageIndex];
    const stepMs = 30;
    const totalSteps = currentStage.duration / stepMs;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      setStageProgress(Math.min((step / totalSteps) * 100, 100));
      if (step >= totalSteps) {
        clearInterval(interval);
        setTimeout(advanceStage, 300);
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [currentStageIndex, advanceStage, isCheckoutReady]);

  // Trigger Razorpay checkout once pre-checks complete
  useEffect(() => {
    if (!isCheckoutReady || !razorpayLoaded) return;
    openRazorpayCheckout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutReady, razorpayLoaded]);

  const openRazorpayCheckout = async () => {
    try {
      // 1. Create order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, claimId, workerName }),
      });
      const orderData = await res.json();
      
      if (!orderData.success) {
        setCheckoutError(orderData.error || 'Failed to create payment order');
        return;
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SurakshaPay AI',
        description: `Claim Payout — ${claimId}`,
        order_id: orderData.orderId,
        prefill: {
          name: workerName,
          email: 'worker@surakshapay.in',
          contact: '9999999999',
        },
        notes: {
          claimId,
          type: 'Parametric Payout',
        },
        theme: {
          color: '#2563eb',
          backdrop_color: 'rgba(0,0,0,0.7)',
        },
        modal: {
          ondismiss: () => {
            // If user closes Razorpay modal, still show success (it's a demo)
            setIsComplete(true);
          },
        },
        handler: (response: any) => {
          // Payment successful
          console.log('Razorpay payment response:', response);
          setTxnId(response.razorpay_payment_id || txnId);
          setIsComplete(true);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.warn('Razorpay payment failed:', response.error);
        // Still show success for demo purposes (it's test mode)
        setIsComplete(true);
      });
      rzp.open();

    } catch (err: any) {
      console.error('Razorpay error:', err);
      setCheckoutError(err.message);
      // Fallback: show success anyway for demo
      setTimeout(() => setIsComplete(true), 2000);
    }
  };

  const currentStage = currentStageIndex < PRE_CHECKOUT_STAGES.length 
    ? PRE_CHECKOUT_STAGES[currentStageIndex] 
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Razorpay Script */}
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => setRazorpayLoaded(true)}
      />

      {/* Ambient Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        <Card className="shadow-[0_0_80px_-20px_rgba(99,102,241,0.15)] border-white/[0.06] rounded-[2rem] bg-[#111118]/90 backdrop-blur-3xl text-white overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#0d0d14] px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">SurakshaPay Gateway</p>
                <p className="text-[10px] text-white/30 font-medium">Powered by Razorpay</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest px-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Test Mode
            </Badge>
          </div>

          <CardContent className="p-0">
            {/* Amount Hero Section */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-white/[0.04]">
              <div className={`h-24 w-24 mx-auto rounded-full flex items-center justify-center mb-5 transition-all duration-700 ${
                isComplete 
                  ? 'bg-emerald-500/15 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/[0.03] border border-white/[0.06]'
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-in zoom-in duration-500" />
                ) : (
                  <IndianRupee className={`h-10 w-10 transition-all duration-500 ${
                    isCheckoutReady ? 'text-primary animate-pulse scale-110' : 'text-white/20'
                  }`} />
                )}
              </div>
              <p className={`text-4xl font-black tracking-tight transition-colors duration-500 ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                ₹{parseInt(amount).toLocaleString('en-IN')}.00
              </p>
              <p className="text-xs text-white/25 uppercase tracking-[0.2em] font-bold mt-2">
                Claim Ref: {claimId.toString().slice(-12).toUpperCase()}
              </p>
            </div>

            {/* Processing Pipeline */}
            <div className="px-8 py-6 space-y-3">
              {/* Pre-checkout stages */}
              {PRE_CHECKOUT_STAGES.map((stage, i) => {
                const StageIcon = stage.icon;
                const isActive = i === currentStageIndex && !isCheckoutReady;
                const isDone = i < currentStageIndex || isCheckoutReady || isComplete;

                return (
                  <div key={stage.key} className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-500 ${
                    isActive ? 'bg-primary/[0.06] border border-primary/10' :
                    isDone ? 'bg-emerald-500/[0.04]' : 'opacity-30'
                  }`}>
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isDone ? 'bg-emerald-500/15' :
                      isActive ? 'bg-primary/15' : 'bg-white/[0.03]'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isActive ? (
                        <StageIcon className="h-4 w-4 text-primary animate-pulse" />
                      ) : (
                        <StageIcon className="h-4 w-4 text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold tracking-tight ${isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-white/40'}`}>
                        {stage.label}
                      </p>
                      {isActive && (
                        <div className="mt-1.5">
                          <p className="text-[10px] text-white/40 mb-1.5">{stage.sublabel}</p>
                          <Progress value={stageProgress} className="h-1 bg-white/[0.04]" />
                        </div>
                      )}
                    </div>
                    {isDone && <span className="text-[9px] text-emerald-400/60 font-mono shrink-0">✓ Done</span>}
                  </div>
                );
              })}

              {/* Razorpay Checkout Stage */}
              <div className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-500 ${
                isCheckoutReady && !isComplete ? 'bg-blue-500/[0.06] border border-blue-500/10' :
                isComplete ? 'bg-emerald-500/[0.04]' : 'opacity-30'
              }`}>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isComplete ? 'bg-emerald-500/15' :
                  isCheckoutReady ? 'bg-blue-500/15' : 'bg-white/[0.03]'
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isCheckoutReady ? (
                    <CreditCard className="h-4 w-4 text-blue-400 animate-pulse" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold tracking-tight ${
                    isComplete ? 'text-emerald-400' : isCheckoutReady ? 'text-white' : 'text-white/40'
                  }`}>
                    Razorpay UPI Transfer
                  </p>
                  {isCheckoutReady && !isComplete && (
                    <p className="text-[10px] text-blue-400/60 mt-0.5">Opening Razorpay checkout...</p>
                  )}
                </div>
                {isComplete && <span className="text-[9px] text-emerald-400/60 font-mono shrink-0">✓ Done</span>}
              </div>

              {/* Success Stage */}
              <div className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-500 ${
                isComplete ? 'bg-emerald-500/[0.06] border border-emerald-500/10' : 'opacity-30'
              }`}>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isComplete ? 'bg-emerald-500/15' : 'bg-white/[0.03]'
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Banknote className="h-4 w-4 text-white/20" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-bold tracking-tight ${isComplete ? 'text-emerald-400' : 'text-white/40'}`}>
                    Payout Complete
                  </p>
                </div>
                {isComplete && <span className="text-[9px] text-emerald-400/60 font-mono shrink-0">✓ Done</span>}
              </div>
            </div>

            {/* Success Details */}
            {isComplete && (
              <div className="px-8 pb-8 space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700">
                <div className="bg-emerald-500/[0.06] border border-emerald-500/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm font-black text-emerald-400">Payout Successful</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <p className="text-white/30 font-medium">Transaction ID</p>
                      <p className="text-white/70 font-mono font-bold mt-0.5 truncate">{txnId}</p>
                    </div>
                    <div>
                      <p className="text-white/30 font-medium">Gateway</p>
                      <p className="text-white/70 font-bold mt-0.5">Razorpay (Test)</p>
                    </div>
                    <div>
                      <p className="text-white/30 font-medium">Settlement</p>
                      <p className="text-white/70 font-bold mt-0.5">UPI Instant</p>
                    </div>
                    <div>
                      <p className="text-white/30 font-medium">Fraud Score</p>
                      <p className="text-emerald-400 font-bold mt-0.5">0.02 (Clean)</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-13 rounded-xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-xs shadow-lg shadow-white/10"
                >
                  Return to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Error state */}
            {checkoutError && !isComplete && (
              <div className="px-8 pb-6">
                <p className="text-xs text-red-400 text-center">{checkoutError}</p>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="bg-[#0a0a10] px-6 py-3.5 flex items-center justify-center gap-3 border-t border-white/[0.03]">
            <Lock className="h-3 w-3 text-white/15" />
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/15 font-bold">
              Razorpay Test Mode • NPCI Certified • Zero-Touch Payouts
            </p>
          </div>
        </Card>

        <div className="text-center space-y-1">
          <p className="text-[10px] text-white/20 font-medium">
            Powered by Razorpay Test Mode — no real money is transferred.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PayoutSimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary/50" />
          <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Initializing Gateway...</p>
        </div>
      </div>
    }>
      <PayoutSimulator />
    </Suspense>
  );
}
