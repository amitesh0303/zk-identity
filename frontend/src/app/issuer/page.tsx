"use client";

import { useState } from "react";

const issuerTypes = ["Government", "Financial Institution", "Educational", "Employer", "Other"];

export default function IssuerPage() {
  const [form, setForm] = useState({
    name: "",
    type: issuerTypes[0],
    publicKey: "",
    website: "",
    email: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would call the API
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="glass rounded-2xl p-12 max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-3">Application Submitted!</h2>
          <p className="text-slate-400">
            Your issuer application is under review. We will reach out to{" "}
            <strong>{form.email}</strong> within 2 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Become an Issuer</h1>
        <p className="text-slate-400 mb-10">
          Trusted issuers can issue ZK credentials to their users. Apply below
          to join the ZK-Identity trust network.
        </p>

        {/* Benefits */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: "🔐", text: "Issue privacy-preserving credentials" },
            { icon: "⚡", text: "Instant on-chain verification" },
            { icon: "🌍", text: "Interoperable across all dApps" },
          ].map((b) => (
            <div key={b.text} className="glass rounded-xl p-4 text-center text-sm">
              <div className="text-2xl mb-2">{b.icon}</div>
              <p className="text-slate-300">{b.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Organisation Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Acme Corp"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Organisation Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
            >
              {issuerTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Solana Public Key
            </label>
            <input
              name="publicKey"
              value={form.publicKey}
              onChange={handleChange}
              required
              placeholder="44-character Solana public key"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Website
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              type="url"
              placeholder="https://acme.example"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Contact Email
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              type="email"
              placeholder="contact@acme.example"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold transition-colors"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
