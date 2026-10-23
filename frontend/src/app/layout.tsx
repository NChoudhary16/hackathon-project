import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StockFlowProvider } from "../lib/stockflow-context";
import { ThemeProvider } from "../lib/theme-context";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockFlow iPDS | Smart Food-Grain Inventory & FIFO Compliance Platform",
  description: "Enterprise inventory management, deterministic FIFO stock allocation, and batch-to-FPS traceability for government food-grain godowns under India's Public Distribution System (PDS).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('stockflow_theme');
                  if (stored === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 font-sans antialiased selection:bg-zinc-900 selection:text-white">
        <ThemeProvider>
          <StockFlowProvider>
            {children}
          </StockFlowProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
