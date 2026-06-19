import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MemoryVault — Emergency Medical Identity Vault",
  description:
    "Secure emergency medical vault that gives hospitals instant access to critical medical history during emergencies when the patient is unconscious.",
  keywords: [
    "MemoryVault",
    "Emergency Medicine",
    "Medical Records",
    "Patient Safety",
    "Biometrics",
    "QR Medical ID",
    "Healthcare AI",
  ],
  authors: [{ name: "MemoryVault Team" }],
  openGraph: {
    title: "MemoryVault — When Seconds Count, Silence is Fatal",
    description:
      "Secure emergency medical vault that speaks for you when you can't.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f1f5f9',
            },
          }}
        />
      </body>
    </html>
  );
}
