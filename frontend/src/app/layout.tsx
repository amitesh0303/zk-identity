import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZK-Identity — Privacy-Preserving Identity on Solana",
  description:
    "Prove who you are without revealing who you are. Zero-knowledge identity verification built on Solana.",
  keywords: ["zero-knowledge", "identity", "Solana", "privacy", "blockchain", "ZK proofs"],
  openGraph: {
    title: "ZK-Identity",
    description: "Privacy-preserving identity verification on Solana",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
