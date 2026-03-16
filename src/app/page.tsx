import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Shield, Zap, CloudRain, BarChart3, ChevronRight, LogIn } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-delivery');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header with Navigation and Login */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary font-headline">SurakshaPay AI</span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">How it Works</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/admin">Insurer Admin Dashboard</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard">My Dashboard</Link>
          <div className="h-4 w-px bg-border mx-2"></div>
          <Link className="text-sm font-bold text-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity" href="/login">
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </nav>
        <div className="flex items-center gap-3">
           <Button variant="ghost" asChild className="md:hidden">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full shadow-lg hover:shadow-primary/20 px-6">
            <Link href="/onboarding">Protect My Income</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-6 lg:px-12 bg-gradient-to-b from-accent/30 to-background">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-500/30 shadow-sm">
                  <span className="flex items-center gap-1.5 mr-2 border-r border-blue-500/30 pr-2 font-bold top-0">
                    🏆 DEVTrails 2026
                  </span>
                  <span className="mr-1">Powered by</span>
                  <span className="font-bold">Guidewire Cloud</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-7xl/none text-primary font-headline">
                  Secure Your Weekly Income, No Matter the Weather.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                  Protect your livelihoods from rain, floods, and curfews. SurakshaPay AI provides automated payouts for India's platform delivery partners (Zomato, Swiggy, Zepto, Amazon, etc.).
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl" asChild>
                  <Link href="/onboarding">Get Your Quote Now</Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg border-2" asChild>
                  <Link href="/admin">Insurer Admin Portal</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                      <Image src={`https://picsum.photos/seed/user${i}/32/32`} width={32} height={32} alt="User" />
                    </div>
                  ))}
                </div>
                <span>Trusted by 10,000+ delivery partners across Mumbai, Delhi & Bangalore</span>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 blur-2xl group-hover:opacity-100 transition duration-1000"></div>
              {heroImage && (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg flex items-center justify-between border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-primary">
                        <Zap className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">Disruption Detected: Rain &gt; 10mm</p>
                        <p className="text-xs text-muted-foreground">Automatic payout initiated via UPI</p>
                      </div>
                    </div>
                    <span className="text-primary font-black text-lg">₹500 Paid</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features / Explanation Section */}
        <section id="features" className="w-full py-24 px-6 lg:px-12 bg-white">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-headline text-primary">Designed for the Weekly Gig Life</h2>
              <p className="text-lg text-muted-foreground">Traditional insurance is too slow. SurakshaPay AI works at the speed of the gig economy.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="p-8 rounded-3xl bg-accent/20 border border-accent hover:shadow-xl transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CloudRain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-headline">Parametric Triggers</h3>
                <p className="text-muted-foreground">Payouts trigger automatically based on real-time weather and traffic data. No forms, no manual claims, no waiting for inspectors.</p>
              </div>
              <div className="p-8 rounded-3xl bg-accent/20 border border-accent hover:shadow-xl transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-headline">Weekly Pricing Model</h3>
                <p className="text-muted-foreground">Pay a small premium every week, aligned with your platform's payout cycle. Protect your earnings for the days that matter most.</p>
              </div>
              <div className="p-8 rounded-3xl bg-accent/20 border border-accent hover:shadow-xl transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-headline">AI-Powered Risk Assessment</h3>
                <p className="text-muted-foreground">Our AI calculates hyper-local premiums based on your persona (Food, Grocery, or E-commerce) and historical disruption patterns in your city.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 lg:px-12 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold font-headline leading-tight">Income Protection, No Paperwork.</h2>
              <p className="text-lg text-white/80">If it rains too hard or the city shuts down, we've got your back. Join the 10,000+ partners who delivery with peace of mind.</p>
            </div>
            <div className="flex flex-col gap-4">
              <Button size="lg" variant="secondary" className="h-16 px-10 rounded-full text-xl shadow-2xl hover:scale-105 transition-transform" asChild>
                <Link href="/onboarding">Get Started <ChevronRight className="ml-2 h-6 w-6" /></Link>
              </Button>
              <p className="text-center text-sm text-white/60 font-medium">Takes less than 2 minutes</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 lg:px-12 border-t bg-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">SurakshaPay AI</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">© 2026 SurakshaPay AI. Developed for Guidewire DEVTrails Hackathon.</p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Sign In</Link>
            <Link href="/onboarding" className="text-sm text-muted-foreground hover:text-primary">Onboarding</Link>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary">Insurer Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
