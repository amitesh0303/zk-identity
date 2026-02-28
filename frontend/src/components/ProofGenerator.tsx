"use client";

import { useState } from "react";
import type { CredentialType, ZKProof } from "@/types";
import { generateProof, buildAgeInputs, buildIncomeInputs, buildCitizenshipInputs, commitmentToHex } from "@/lib/zkProof";
import { issueCredential } from "@/lib/api";

interface ProofGeneratorProps {
  walletPublicKey: string;
}

type Step = "select" | "inputs" | "generating" | "done" | "error";

export function ProofGenerator({ walletPublicKey }: ProofGeneratorProps) {
  const [circuitType, setCircuitType] = useState<CredentialType>("age_verification");
  const [step, setStep] = useState<Step>("select");
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [publicSignals, setPublicSignals] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Age form state
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(6);
  const [birthDay, setBirthDay] = useState(15);
  const [minAge, setMinAge] = useState(18);

  // Income form state
  const [incomeCents, setIncomeCents] = useState(5000000);
  const [thresholdCents, setThresholdCents] = useState(3000000);

  // Citizenship form state
  const [countryCode, setCountryCode] = useState(840); // USA
  const [targetCountryCode, setTargetCountryCode] = useState(840);

  const handleGenerate = async () => {
    setStep("generating");
    setErrorMsg("");
    try {
      const saltArray = new Uint8Array(32);
      crypto.getRandomValues(saltArray);
      // Convert 32 random bytes to a BigInt for use as a circuit salt
      const salt = saltArray.reduce(
        (acc, byte) => acc * BigInt(256) + BigInt(byte),
        BigInt(0)
      );

      let inputs: Record<string, string | number | bigint> = {};
      if (circuitType === "age_verification") {
        inputs = buildAgeInputs({ birthYear, birthMonth, birthDay, salt, minAge });
      } else if (circuitType === "income") {
        inputs = buildIncomeInputs({
          annualIncomeCents: BigInt(incomeCents),
          thresholdCents: BigInt(thresholdCents),
          salt,
        });
      } else {
        inputs = buildCitizenshipInputs({
          countryCode,
          documentNumber: BigInt(123456789),
          salt,
          targetCountryCode,
        });
      }

      const { proof: p, publicSignals: sigs } = await generateProof(circuitType, inputs);
      setProof(p);
      setPublicSignals(sigs);
      setStep("done");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Proof generation failed. Ensure circuit files are available."
      );
      setStep("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Circuit selector */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-4">1. Select Credential Type</h2>
        <div className="grid grid-cols-3 gap-3">
          {(["age_verification", "citizenship", "income"] as CredentialType[]).map((ct) => (
            <button
              key={ct}
              onClick={() => { setCircuitType(ct); setStep("select"); }}
              className={`py-3 px-2 rounded-xl text-sm font-medium transition-colors ${
                circuitType === ct
                  ? "bg-brand-600 text-white"
                  : "glass hover:bg-white/10 text-slate-300"
              }`}
            >
              {ct === "age_verification" ? "🎂 Age" : ct === "citizenship" ? "🌍 Citizenship" : "💰 Income"}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-4">2. Enter Your Data (stays local)</h2>
        <p className="text-xs text-slate-500 mb-4">
          🔒 Your inputs are used only to generate the proof and never leave your browser.
        </p>

        {circuitType === "age_verification" && (
          <div className="grid grid-cols-2 gap-4">
            <label className="col-span-2 block">
              <span className="text-sm text-slate-300">Birth Year</span>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Birth Month</span>
              <input
                type="number"
                min={1}
                max={12}
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Birth Day</span>
              <input
                type="number"
                min={1}
                max={31}
                value={birthDay}
                onChange={(e) => setBirthDay(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
              />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm text-slate-300">Minimum Age to Prove</span>
              <input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
              />
            </label>
          </div>
        )}

        {circuitType === "income" && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">Annual Income (in cents)</span>
              <input
                type="number"
                value={incomeCents}
                onChange={(e) => setIncomeCents(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
              />
              <span className="text-xs text-slate-500">${(incomeCents / 100).toLocaleString()}</span>
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Threshold to Prove (in cents)</span>
              <input
                type="number"
                value={thresholdCents}
                onChange={(e) => setThresholdCents(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
              />
              <span className="text-xs text-slate-500">${(thresholdCents / 100).toLocaleString()}</span>
            </label>
          </div>
        )}

        {circuitType === "citizenship" && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">Your Country Code (ISO numeric)</span>
              <input
                type="number"
                value={countryCode}
                onChange={(e) => setCountryCode(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Target Country Code</span>
              <input
                type="number"
                value={targetCountryCode}
                onChange={(e) => setTargetCountryCode(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-brand-500 outline-none text-sm"
              />
            </label>
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={step === "generating"}
        className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 font-semibold text-lg transition-colors"
      >
        {step === "generating" ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙️</span> Generating Proof…
          </span>
        ) : (
          "Generate ZK Proof"
        )}
      </button>

      {step === "error" && (
        <div className="glass rounded-xl p-4 border border-red-500/30">
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}

      {step === "done" && proof && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-3 text-green-400">✓ Proof Generated</h2>
          <p className="text-xs text-slate-500 mb-3">
            Public Signals: {publicSignals.join(", ")}
          </p>
          <pre className="text-xs text-slate-400 overflow-auto max-h-48 font-mono bg-slate-900 rounded-lg p-3">
            {JSON.stringify(proof, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
