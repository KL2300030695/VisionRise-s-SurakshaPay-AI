'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Send, ChevronLeft, Loader2, Bot, User } from 'lucide-react';
import { supportChat } from '@/ai/flows/support-chat-flow';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Namaste! I'm your SurakshaPay AI assistant. How can I help you with your insurance today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await supportChat({
        message: userMessage,
        history: messages
      });
      setMessages(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl flex-1 flex flex-col gap-4">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/dashboard"><ChevronLeft className="h-6 w-6" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold font-headline">SurakshaPay AI Support</h1>
          </div>
        </header>

        <Card className="flex-1 flex flex-col shadow-xl border-none overflow-hidden">
          <CardHeader className="border-b bg-muted/30 py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> AI Assistant is online
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="h-8 w-8 border">
                        {m.role === 'model' ? (
                          <>
                            <AvatarImage src="/bot-avatar.png" />
                            <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-muted rounded-tl-none'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 items-center text-muted-foreground text-xs bg-muted/50 px-3 py-2 rounded-full">
                      <Loader2 className="h-3 w-3 animate-spin" /> SurakshaPay AI is thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-white">
              <Input
                placeholder="Ask about your policy, claims, or triggers..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-full h-12 px-6 focus-visible:ring-primary"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="rounded-full h-12 w-12 shrink-0 shadow-lg" disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
