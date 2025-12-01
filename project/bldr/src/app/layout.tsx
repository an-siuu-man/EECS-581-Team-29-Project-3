import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, DM_Sans, Figtree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScheduleBuilderProvider } from "@/contexts/ScheduleBuilderContext";
import { ActiveScheduleProvider } from "@/contexts/ActiveScheduleContext";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const dmsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  weight: ["400", "500", "700"],
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "bldr: Flagship Schedule Builder",
  description:
    "This is a student-led effort to ease the schedule building process for college students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${inter.variable} ${figtree.variable} ${dmsans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src={process.env.NEXT_PUBLIC_GOOGLE_MANAGER_URL}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');`}
        </Script>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ActiveScheduleProvider>
              <ScheduleBuilderProvider>
                {children}
                <Toaster />
              </ScheduleBuilderProvider>
            </ActiveScheduleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
