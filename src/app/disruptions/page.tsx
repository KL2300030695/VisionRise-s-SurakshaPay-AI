"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CloudRain, AlertCircle, MapPin, ChevronLeft, Zap, ThermometerSun, Wind, Droplets, Eye, Loader2, RefreshCw } from 'lucide-react';

interface CityWeather {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  rainMm: number;
  aqi: number | null;
  description: string;
  weatherCode: number;
  timestamp: string;
}

interface ParametricAlert {
  city: string;
  triggerType: string;
  severity: string;
  value: number;
  threshold: number;
  unit: string;
  description: string;
}

export default function DisruptionsPage() {
  const [mounted, setMounted] = useState(false);
  const [weatherData, setWeatherData] = useState<CityWeather[]>([]);
  const [alerts, setAlerts] = useState<ParametricAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data.weather || []);
        setAlerts(data.alerts || []);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to fetch weather');
      }
    } catch (err) {
      setError('Network error fetching weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchWeather();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const getWeatherIcon = (code: number) => {
    if (code >= 95) return <CloudRain className="h-10 w-10 text-purple-500" />; // Thunderstorm
    if (code >= 61) return <CloudRain className="h-10 w-10 text-blue-500" />; // Rain
    if (code >= 51) return <Droplets className="h-10 w-10 text-cyan-500" />; // Drizzle
    if (code >= 45) return <Wind className="h-10 w-10 text-gray-400" />; // Fog
    if (code >= 2) return <CloudRain className="h-10 w-10 text-gray-500" />; // Cloudy
    return <ThermometerSun className="h-10 w-10 text-yellow-500" />; // Clear
  };

  const getTempColor = (temp: number) => {
    if (temp > 42) return 'text-red-600';
    if (temp > 35) return 'text-orange-500';
    if (temp > 25) return 'text-yellow-500';
    return 'text-blue-500';
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/"><ChevronLeft className="h-6 w-6" /></Link>
            </Button>
            <div>
              <h1 className="text-4xl font-black font-headline text-primary">Live Weather & Triggers</h1>
              <p className="text-muted-foreground">Real-time parametric monitoring powered by Open-Meteo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">Updated: {lastUpdated}</span>
            )}
            <Button variant="outline" size="sm" onClick={fetchWeather} disabled={isLoading} className="rounded-full gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Parametric Alerts Banner */}
        {alerts.length > 0 && (
          <Card className="bg-red-50 border-red-200 shadow-lg animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> 
                {alerts.length} Active Parametric {alerts.length === 1 ? 'Trigger' : 'Triggers'} Detected!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div>
                      <p className="text-sm font-bold text-red-800">{alert.triggerType} — {alert.city}</p>
                      <p className="text-xs text-red-600">{alert.description}</p>
                    </div>
                  </div>
                  <Badge className={alert.severity === 'Critical' ? 'bg-red-600' : 'bg-orange-500'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error Banner */}
        {error && (
          <Card className="bg-yellow-50 border-yellow-200 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-bold text-yellow-800">Weather API Error</p>
                <p className="text-sm text-yellow-700">{error}</p>
                <p className="text-xs text-yellow-600 mt-1">Please check that OPENWEATHERMAP_API_KEY is set in your .env file.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Live Weather Grid */}
        <div>
          <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" /> Live City Monitoring
          </h2>
          
          {isLoading && weatherData.length === 0 ? (
            <div className="flex justify-center p-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weatherData.map((w) => (
                <Card key={w.city} className="border-2 border-primary/10 hover:shadow-xl transition-all overflow-hidden group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" /> {w.city}
                        </CardTitle>
                        <CardDescription className="capitalize">{w.description}</CardDescription>
                      </div>
                      {getWeatherIcon(w.weatherCode)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Temperature */}
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black ${getTempColor(w.temp)}`}>{w.temp}°</span>
                      <span className="text-sm text-muted-foreground">Feels {w.feelsLike}°C</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                        <p className="text-xs text-muted-foreground">Humidity</p>
                        <p className="text-sm font-bold">{w.humidity}%</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <Wind className="h-4 w-4 mx-auto text-slate-500 mb-1" />
                        <p className="text-xs text-muted-foreground">Wind</p>
                        <p className="text-sm font-bold">{w.windSpeed} m/s</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <CloudRain className="h-4 w-4 mx-auto text-cyan-500 mb-1" />
                        <p className="text-xs text-muted-foreground">Rain</p>
                        <p className="text-sm font-bold">{w.rainMm} mm</p>
                      </div>
                    </div>

                    {/* AQI */}
                    {w.aqi !== null && (
                      <div className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold ${
                        w.aqi > 400 ? 'bg-red-100 text-red-700' :
                        w.aqi > 200 ? 'bg-orange-100 text-orange-700' :
                        w.aqi > 100 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        <span>Air Quality Index</span>
                        <span>{w.aqi} AQI</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>  
          )}
        </div>

        {/* Trigger Rules */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-primary text-white shadow-2xl border-none p-6">
            <h3 className="text-lg font-bold mb-4">How Parametric Triggers Work</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">1</div>
                <p className="text-sm text-white/80">Live weather data is fetched from Open-Meteo every 5 minutes for 6 Indian cities.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">2</div>
                <p className="text-sm text-white/80">If any trigger threshold is breached (rain &gt; 8mm, temp &gt; 42°C, AQI &gt; 400), a parametric claim is auto-initiated.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">3</div>
                <p className="text-sm text-white/80">Money is sent to the worker's wallet via UPI. No forms to fill.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary/5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary" /> Active Trigger Thresholds
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  <span>Heavy Rain</span>
                </div>
                <span className="font-bold">&gt; 8mm / hr</span>
              </div>
              <div className="flex justify-between text-xs p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <ThermometerSun className="h-4 w-4 text-orange-500" />
                  <span>Extreme Heat</span>
                </div>
                <span className="font-bold">&gt; 42°C</span>
              </div>
              <div className="flex justify-between text-xs p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-slate-500" />
                  <span>High Wind</span>
                </div>
                <span className="font-bold">&gt; 20 m/s</span>
              </div>
              <div className="flex justify-between text-xs p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-500" />
                  <span>Air Quality</span>
                </div>
                <span className="font-bold">AQI &gt; 400</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
