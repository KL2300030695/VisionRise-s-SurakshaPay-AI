"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, Send, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportIssueDialogProps {
  workerId: string;
  location: string;
  onSuccess?: () => void;
}

export function ReportIssueDialog({ workerId, location, onSuccess }: ReportIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please describe the problem you are facing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/claims/stimulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          problemDescription: description,
          location,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast({
          title: data.status === "Paid" ? "Claim Approved & Paid!" : "Claim Processed",
          description: data.fraudResult.reason,
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit claim",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-16 rounded-2xl justify-start gap-3 px-6 shadow-sm hover:shadow-md transition-all border-orange-200 hover:border-orange-300 hover:bg-orange-50/50 group">
          <Zap className="h-5 w-5 text-orange-500 group-hover:animate-pulse" />
          <div className="text-left">
            <p className="font-bold text-sm">Report Problem</p>
            <p className="text-xs text-muted-foreground">Stimulate AI trigger for payout</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black font-headline text-primary flex items-center gap-2">
            <Zap className="h-6 w-6 text-orange-500" /> Report an Issue
          </DialogTitle>
          <DialogDescription className="text-base">
            Describe the disruption you are currently facing (e.g., rains, curfews, heat waves). Our AI will verify the claim instantly.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Current Location</Label>
              <Input id="location" value={location} disabled className="bg-muted/50 rounded-xl border-none h-12 font-medium" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What happened?</Label>
              <Textarea
                id="description"
                placeholder="e.g. Heavy rain in Mumbai preventing bike deliveries..."
                className="min-h-[120px] rounded-xl border-2 border-muted focus:border-primary transition-all p-4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            {result.status === "Paid" ? (
              <div className="space-y-4">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-green-600">₹{result.payoutAmount} Paid!</h3>
                  <p className="text-muted-foreground font-medium px-4">{result.fraudResult.reason}</p>
                  <p className="text-xs font-bold text-primary mt-4 py-2 px-4 bg-primary/5 rounded-full inline-block">
                    Sent to UPI: {result.upiId}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-red-600">Claim Flagged</h3>
                  <p className="text-muted-foreground font-medium px-4">{result.fraudResult.reason}</p>
                  <Badge variant="destructive" className="mt-2">Fraud Score: {(result.fraudResult.confidence * 100).toFixed(0)}%</Badge>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          {!result ? (
            <Button 
              type="submit" 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {loading ? "Verifying with AI..." : "Submit Claim for Review"}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                setResult(null);
                setDescription("");
              }}
              className="h-12 rounded-xl px-8"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
