import Link from "next/link";
import { PrivacyBadge } from "@/components/PrivacyBadge";

const stats = [
  { label: "Credentials Issued", value: "12,400+" },
  { label: "Proofs Verified", value: "98,000+" },
  { label: "Issuers Onboarded", value: "34" },
  { label: "Avg Proof Time", value: "1.2s" },
];

const useCases = [
  {
    icon: "🏦",
    title: "DeFi KYC",
    description:
      "Meet regulatory requirements without exposing personal data on-chain. Prove you are over 18 and not a sanctioned entity — nothing more.",
  },
  {
    icon: "🗳️",
    title: "DAO Governance",
    description:
      "Gate voting by citizenship or unique-human status while keeping voter identities completely private.",
  },
  {
    icon: "🎓",
    title: "Credential Gating",
    description:
      "Restrict access to communities, airdrops, or dApps based on verified credentials without a central data store.",
  },
  {
    icon: "💸",
    title: "Income Verification",
    description:
      "Prove income exceeds a threshold for undercollateralised lending — without disclosing the actual figure.",
  },
];

const steps = [
  {
    step: "01",
    title: "Get Issued a Credential",
    description:
      "A trusted issuer (government, bank, employer) signs your credential and anchors a commitment on Solana.",
  },
  {
    step: "02",
    title: "Generate a ZK Proof",
    description:
      "In your browser, snarkjs generates a Groth16 proof that satisfies the verifier's policy — no private data leaves your device.",
  },
  {
    step: "03",
    title: "Submit On-Chain",
    description:
      "The proof is verified by the ZK-Identity Anchor program. A verification record is written to Solana.",
  },
  {
    step: "04",
    title: "Access Granted",
    description:
      "The requesting dApp reads the verification record and grants access. Your private data was never shared.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-pattern pt-32 pb-24 px-4 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-300">Live on Solana Devnet</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Prove You Are Who You Say{" "}
            <span className="gradient-text">Without Revealing Anything</span>
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto text-balance">
            ZK-Identity uses zero-knowledge proofs to let you satisfy any
            identity requirement on Solana — age, citizenship, income — without
            exposing your personal data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/proof"
              className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-lg transition-colors"
            >
              Generate a Proof
            </Link>
            <Link
              href="/verify"
              className="px-8 py-4 rounded-xl glass hover:bg-white/10 font-semibold text-lg transition-colors"
            >
              Verify a Credential
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy badges */}
      <section className="py-10 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          <PrivacyBadge label="Zero-Knowledge Proofs" color="blue" />
          <PrivacyBadge label="No Personal Data On-Chain" color="green" />
          <PrivacyBadge label="Groth16 / Circom 2.0" color="purple" />
          <PrivacyBadge label="Solana Native" color="orange" />
          <PrivacyBadge label="Open Source" color="slate" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              The Problem with Traditional Identity
            </h2>
            <ul className="space-y-3 text-slate-300">
              {[
                "Your personal data is stored by every service you use",
                "Data breaches expose millions of records every year",
                "You have no control over how your identity is used",
                "On-chain KYC is public — anyone can see your details",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">
              ZK-Identity's Solution
            </h2>
            <ul className="space-y-3 text-slate-300">
              {[
                "Proofs are generated locally — data never leaves your device",
                "Only a cryptographic proof is submitted on-chain",
                "You choose exactly what to reveal and to whom",
                "Fully verifiable without a trusted third party",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="glass rounded-2xl p-6">
                <div className="text-4xl mb-4">{uc.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-400">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            {steps.map((s, i) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-lg">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                  <p className="text-slate-400">{s.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute left-7 mt-14 w-px h-8 bg-brand-600/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto glass rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Build with ZK-Identity</h2>
          <p className="text-slate-300 mb-8">
            Open-source Anchor program, Circom circuits, and a TypeScript SDK.
            Integrate privacy-preserving identity checks into your dApp in
            minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/zk-identity"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
            >
              View on GitHub
            </a>
            <Link
              href="/issuer"
              className="px-6 py-3 rounded-xl glass hover:bg-white/10 font-semibold transition-colors"
            >
              Become an Issuer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} ZK-Identity. Built with 🔒 and zero-knowledge.</p>
      </footer>
    </div>
  );
}
