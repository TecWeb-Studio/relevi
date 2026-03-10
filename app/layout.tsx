import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import I18nProvider from './components/I18nProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Relevi Healing - Laboratorio Interattivo per il Benessere",
  description: "Relevi Healing è un progetto interattivo e laboratorio polifunzionale dedicato al benessere della persona, con esperienze che favoriscono salute fisica, mentale ed emozionale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        {/* iubenda Cookie Solution — shows the consent banner */}
        <Script id="iubenda-cs-init" strategy="beforeInteractive">
          {`var _iub = _iub || {}; _iub.csConfiguration = {"siteId":29386294,"cookiePolicyId":29386294,"lang":"it","storage":{"useSiteId":true}};`}
        </Script>
        <Script src="https://cs.iubenda.com/autoblocking/29386294.js" strategy="beforeInteractive" />
        <Script src="//cdn.iubenda.com/cs/iubenda_cs.js" strategy="afterInteractive" />
        {/* iubenda Consent Solution — records and manages consent */}
        <Script id="iubenda-cons-init" strategy="beforeInteractive">
          {`var _iub = _iub || {}; _iub.cons_instructions = _iub.cons_instructions || []; _iub.cons_instructions.push(["init", {api_key: "Nfmt5EjVdtKjpG1ypN10sxRpmyNioMz2"}]);`}
        </Script>
        <Script src="https://cdn.iubenda.com/cons/iubenda_cons.js" strategy="afterInteractive" />
        <I18nProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
