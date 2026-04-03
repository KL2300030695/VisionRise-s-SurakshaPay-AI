import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Shield, Zap, CloudRain, BarChart3, ChevronRight, LogIn, BrainCircuit, Cpu, Activity, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const images = PlaceHolderImages;
  const heroImage = images.find(img => img.id === 'hero-delivery');
  const featParametric = images.find(img => img.id === 'feature-parametric');
  const featRisk = images.find(img => img.id === 'feature-risk');

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Premium Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b bg-white/70 dark:bg-black/70 backdrop-blur-xl sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <div className="bg-primary p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-primary font-headline">SurakshaPay AI</span>
        </Link>
        <nav className="hidden lg:flex gap-10 items-center">
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="#features">How it Works</Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="/admin/login">Insurer Portal</Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="/dashboard">My Dashboard</Link>
          <div className="h-4 w-px bg-border"></div>
          <Link className="flex items-center gap-2 text-sm font-black text-primary hover:opacity-80" href="/login">
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild className="rounded-2xl shadow-xl hover:shadow-primary/30 px-8 h-12 font-bold transition-all hover:scale-105 active:scale-95">
            <Link href="/onboarding">Protect My Income</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section: The "Wow" Factor */}
        <section className="relative w-full py-20 md:py-32 lg:py-48 px-6 lg:px-12 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.05),transparent_50%)] -z-10"></div>
          
          <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col justify-center space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-2xl bg-primary/5 px-4 py-2 text-sm font-black text-primary ring-1 ring-inset ring-primary/20 shadow-sm animate-in fade-in slide-in-from-left-4 duration-700">
                  <span className="flex items-center gap-2 mr-3 border-r border-primary/20 pr-3 font-black uppercase tracking-tighter">
                    <Zap className="h-4 w-4 fill-primary" /> DEVTrails 2026
                  </span>
                  <span className="flex items-center gap-1.5 opacity-80 decoration-primary font-bold">
                    Powered by <span className="text-secondary font-black">Guidewire Cloud</span>
                  </span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter sm:text-6xl xl:text-8xl/none text-primary font-headline animate-in fade-in slide-in-from-left-6 duration-1000 delay-150">
                  Secure Your Income <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-secondary">Automatically.</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed font-medium animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
                  The world&apos;s first parametric insurance designed for India&apos;s delivery partners. No forms. No delays. Just instant payouts when weather disrupts your day.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-5 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-black shadow-2xl hover:scale-105 transition-all text-white bg-primary" asChild>
                  <Link href="/onboarding">Get Protected Now</Link>
                </Button>
                <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold border-2 hover:bg-muted/50 transition-all" asChild>
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground/60 pt-4 border-t w-fit animate-in fade-in duration-1000 delay-700">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-sm">
                      <Image src={`https://picsum.photos/seed/partner${i}/40/40`} width={40} height={40} alt="User" />
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full border-4 border-background bg-primary text-white flex items-center justify-center text-[10px] font-black">+10k</div>
                </div>
                <span>Protecting 10,000+ Partners Daily</span>
              </div>
            </div>

            <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
              <div className="absolute -inset-10 rounded-full bg-primary/10 blur-[120px] -z-10 animate-pulse"></div>
              {heroImage && (
                <div className="relative group perspective-1000">
                  <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[12px] border-white/80 backdrop-blur-sm transform hover:rotate-y-2 hover:rotate-x-2 transition-transform duration-700 ease-out">
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      fill
                      className="object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
                      priority
                    />
                    
                    {/* Floating Glass UI Element */}
                    <div className="absolute inset-x-8 bottom-8 bg-white/60 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between border border-white/40 animate-bounce-slow">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-secondary/80 rounded-2xl flex items-center justify-center text-primary shadow-lg">
                          <Zap className="h-6 w-6 fill-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-primary">Trigger: Heavy Rain &gt; 12mm</p>
                          <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">Payout Dispatched via UPI</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-primary font-black text-2xl tracking-tighter">₹500.00</span>
                        <div className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black uppercase mt-1">Instant</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* The Edge: Why SurakshaPay */}
        <section id="features" className="py-32 px-6 lg:px-12 bg-white relative">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl space-y-4">
                <Badge className="bg-secondary text-primary font-black rounded-lg px-3 py-1 mb-2 hover:bg-secondary border-none">THE CORE ENGINE</Badge>
                <h2 className="text-4xl md:text-6xl font-black font-headline text-primary leading-tight tracking-tighter mt-4">Built for Speed, Powered by Intelligence.</h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-sm font-medium border-l-4 border-primary/10 pl-6 py-2">
                Traditional insurance relies on forms. SurakshaPay AI relies on data. 
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Parametric Automation",
                  desc: "We monitor hyper-local weather sensors in real-time. When triggers met, Guidewire ClaimCenter initiates payouts instantly.",
                  icon: CloudRain,
                  image: featParametric?.imageUrl,
                  color: "from-blue-500 to-blue-600"
                },
                {
                  title: "Hyper-Local Risk Map",
                  desc: "Our AI analyzes city geography and persona patterns (Zomato vs Amazon) to calculate fair, micro-premiums down to the neighborhood.",
                  icon: BarChart3,
                  image: featRisk?.imageUrl,
                  color: "from-purple-500 to-purple-600"
                },
                {
                  title: "Fraud-Proof Claims",
                  desc: "Using advanced GPS anti-spoofing and multi-source weather verification, we ensure every payout is honest and 100% automated.",
                  icon: Shield,
                  image: "https://picsum.photos/seed/shield/600/400",
                  color: "from-emerald-500 to-emerald-600"
                }
              ].map((feat, i) => (
                <Card key={i} className="group border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden hover:translate-y-[-8px] transition-all duration-500">
                  <div className="aspect-video relative overflow-hidden">
                    <Image src={feat.image || ""} fill className="object-cover group-hover:scale-110 transition-transform duration-700" alt={feat.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                        <feat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-black text-white font-headline">{feat.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <p className="text-muted-foreground leading-relaxed font-medium">{feat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 px-6 lg:px-12 bg-slate-50">
          <div className="container mx-auto">
             <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="text-4xl font-black font-headline text-primary tracking-tighter">Your Protection Flow</h2>
                <p className="text-muted-foreground">Seamlessly integrated with your weekly gig schedule</p>
             </div>
             
             <div className="grid md:grid-cols-4 gap-8">
                {[
                  { step: "01", title: "Select Profile", desc: "Choose your persona (Zomato, Swiggy, Amazon, etc.) and operating city." },
                  { step: "02", title: "AI Dynamic Quote", desc: "Get a personalized weekly premium using 5 ML-powered risk factors including zone safety & weather forecasts." },
                  { step: "03", title: "5-Source Monitoring", desc: "Our engine auto-scans weather, AQI, flood alerts, and civil disruptions across 5 live APIs." },
                  { step: "04", title: "Zero-Touch Payout", desc: "Trigger detected → AI validates → Guidewire syncs → ₹500 UPI payout in 4.2 minutes. No forms." },
                ].map((s, i) => (
                  <div key={i} className="relative p-8 bg-white rounded-3xl shadow-xl hover:shadow-primary/5 transition-all">
                    <span className="text-6xl font-black text-primary/5 absolute top-4 right-4">{s.step}</span>
                    <div className="relative z-10 space-y-3">
                      <h4 className="text-xl font-black text-primary font-headline">{s.title}</h4>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Phase 2: Automation & Protection Features */}
        <section className="py-24 px-6 lg:px-12 bg-white">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <Badge className="bg-green-100 text-green-700 font-black rounded-lg px-3 py-1 mb-2 hover:bg-green-100 border-none">PHASE 2 — AUTOMATION</Badge>
              <h2 className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tighter">Protect Your Worker. Automatically.</h2>
              <p className="text-muted-foreground text-lg font-medium">Five layers of automated protection powered by real APIs and AI</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: BrainCircuit,
                  title: "Dynamic AI Pricing",
                  desc: "ML-powered premiums that adjust based on zone-level weather history, seasonal patterns, and your claim track record. Workers in safe zones pay ₹2-3 less per week.",
                  color: "bg-purple-500/10 text-purple-600",
                  tag: "AI/ML"
                },
                {
                  icon: CloudRain,
                  title: "Live Weather Triggers",
                  desc: "Open-Meteo API monitors rain (>8mm), heat (>42°C), and wind (>20m/s) across 6 Indian cities in real-time.",
                  color: "bg-blue-500/10 text-blue-600",
                  tag: "Live API"
                },
                {
                  icon: Activity,
                  title: "Air Quality Monitoring",
                  desc: "Open-Meteo AQI API tracks pollution levels. When Indian AQI exceeds 400, claims are auto-created for affected delivery partners.",
                  color: "bg-orange-500/10 text-orange-600",
                  tag: "Live API"
                },
                {
                  icon: Zap,
                  title: "Flood & Cyclone Alerts",
                  desc: "Mock IMD API detects flood warnings and cyclone alerts. Orange/Red level alerts trigger instant income protection.",
                  color: "bg-red-500/10 text-red-600",
                  tag: "Mock API"
                },
                {
                  icon: Shield,
                  title: "Urban Disruption Shield",
                  desc: "Civil Alert API monitors bandhs, curfews, and VIP movement closures. Major disruptions auto-trigger payouts for all city workers.",
                  color: "bg-slate-500/10 text-slate-600",
                  tag: "Mock API"
                },
                {
                  icon: Cpu,
                  title: "Zero-Touch Claims",
                  desc: "The entire pipeline — detect, validate, adjudicate, pay — runs without any human intervention. Average payout time: 4.2 minutes.",
                  color: "bg-green-500/10 text-green-600",
                  tag: "Automated"
                },
              ].map((feat, i) => (
                <Card key={i} className="border-none shadow-xl bg-white rounded-[2rem] p-8 hover:translate-y-[-4px] transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`h-14 w-14 rounded-2xl ${feat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <feat.icon className="h-7 w-7" />
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest">{feat.tag}</Badge>
                  </div>
                  <h3 className="text-lg font-black font-headline tracking-tight text-primary mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feat.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Premium CTA */}
        <section className="py-32 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary -z-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.1),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(255,255,255,0.1),transparent_30%)] -z-10"></div>
          
          <div className="container mx-auto flex flex-col items-center text-center space-y-10 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black font-headline text-white leading-tight tracking-tighter max-w-4xl">
              Don&apos;t Let the Weather Dictate Your Income.
            </h2>
            <p className="text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
              Join the future of parametric insurance. Protect your weekly earnings with the speed of Guidewire Cloud.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button size="lg" variant="secondary" className="h-16 px-12 rounded-2xl text-xl font-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform" asChild>
                <Link href="/onboarding">Activate My Protection <ChevronRight className="ml-2 h-6 w-6" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 lg:px-12 border-t bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
              <Link className="flex items-center gap-2" href="/">
                <div className="bg-primary p-1.5 rounded-lg shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black text-primary font-headline tracking-tighter">SurakshaPay AI</span>
              </Link>
              <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                Automated parametric insurance for platform economy professionals. Backed by Guidewire DEVTrails 2026.
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="font-black text-primary uppercase text-xs tracking-widest">Platform</h5>
              <ul className="space-y-3 text-sm font-bold text-muted-foreground">
                <li><Link href="/onboarding" className="hover:text-primary">Get Insured</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary">My Dashboard</Link></li>
                <li><Link href="/disruptions" className="hover:text-primary">Live Triggers</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-black text-primary uppercase text-xs tracking-widest">Company</h5>
              <ul className="space-y-3 text-sm font-bold text-muted-foreground">
                <li><Link href="/admin/login" className="hover:text-primary">Insurer Portal</Link></li>
                <li><Link href="/chat" className="hover:text-primary">Support Chat</Link></li>
                <li><Link href="/policy" className="hover:text-primary">Policy Management</Link></li>
                <li><Link href="/claims" className="hover:text-primary">Claims Tracker</Link></li>
                <li><Link href="https://guidewire.com" target="_blank" className="hover:text-primary">Guidewire Cloud</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">© 2026 SurakshaPay AI • Built for DEVTrails</p>
            <div className="flex gap-8 text-xs font-black text-muted-foreground/60 uppercase tracking-widest">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Guidewire</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
