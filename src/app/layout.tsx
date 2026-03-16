import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SurakshaPay AI | Gig Economy Insurance',
  description: 'AI-powered parametric income protection for India\'s gig economy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-secondary selection:text-primary" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
