"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import DonationForm, { stripeAppearance } from "@/components/DonationForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

interface DonorInfo {
  name: string;
  email: string;
  isAnonymous: boolean;
}

function DonatePage() {
  const params = useSearchParams();
  const iq = parseInt(params.get("iq") ?? "85");
  const safeIQ = Math.min(99, Math.max(75, isNaN(iq) ? 85 : iq));

  const [step, setStep] = useState<"amount" | "info" | "payment">("amount");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    name: "",
    email: "",
    isAnonymous: false,
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  const finalAmount =
    amount ?? (customAmount ? parseFloat(customAmount) : null);

  async function handleProceedToInfo() {
    if (!finalAmount || finalAmount < 1) return;
    setStep("info");
  }

  async function handleProceedToPayment() {
    if (!finalAmount) return;
    setLoadingIntent(true);
    setIntentError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          name: donorInfo.isAnonymous ? null : donorInfo.name || null,
          email: donorInfo.email || null,
          benefactorIQ: safeIQ,
          isAnonymous: donorInfo.isAnonymous,
        }),
      });

      if (!res.ok) throw new Error("Failed to initialize payment");
      const { clientSecret } = await res.json();
      setClientSecret(clientSecret);
      setStep("payment");
    } catch {
      setIntentError("Something went wrong. Please try again.");
    } finally {
      setLoadingIntent(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs tracking-[0.3em] uppercase font-bold"
          style={{ color: "#C9A227" }}
        >
          The Cognoscenti
        </Link>
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: "#4A4A48" }}
        >
          <span
            style={{
              color: step === "amount" ? "#C9A227" : "#4A4A48",
            }}
          >
            Amount
          </span>
          <span>·</span>
          <span
            style={{
              color: step === "info" ? "#C9A227" : "#4A4A48",
            }}
          >
            Details
          </span>
          <span>·</span>
          <span
            style={{
              color: step === "payment" ? "#C9A227" : "#4A4A48",
            }}
          >
            Payment
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "#C9A227" }}
            >
              Benefactor IQ: {safeIQ}
            </p>
            <h1 className="text-3xl font-bold">
              {step === "amount" && "Choose your contribution."}
              {step === "info" && "One more thing."}
              {step === "payment" && "You're almost there."}
            </h1>
            <p
              className="text-sm mt-3 leading-relaxed"
              style={{ color: "#8A8A88" }}
            >
              {step === "amount" &&
                "There is no correct answer. There is only what you decide you're worth."}
              {step === "info" &&
                "Optional. Your name appears on the leaderboard if you choose. Anonymous donors are respected equally."}
              {step === "payment" &&
                "Secured by Stripe. Your reveal tier is being calculated."}
            </p>
          </div>

          {/* Step 1: Amount Selection */}
          {step === "amount" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                {PRESET_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setAmount(a);
                      setCustomAmount("");
                    }}
                    className="py-4 text-sm font-bold transition-all"
                    style={{
                      background:
                        amount === a
                          ? "rgba(201,162,39,0.15)"
                          : "rgba(255,255,255,0.03)",
                      border:
                        amount === a
                          ? "1px solid rgba(201,162,39,0.7)"
                          : "1px solid rgba(255,255,255,0.06)",
                      color: amount === a ? "#E8D5A3" : "#8A8A88",
                    }}
                  >
                    ${a}
                  </button>
                ))}
              </div>

              <div>
                <label
                  className="text-xs tracking-widest uppercase block mb-2"
                  style={{ color: "#4A4A48" }}
                >
                  Custom amount
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "#8A8A88" }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(null);
                    }}
                    className="w-full pl-8 pr-4 py-4 text-sm outline-none"
                    style={{
                      background: customAmount
                        ? "rgba(201,162,39,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: customAmount
                        ? "1px solid rgba(201,162,39,0.5)"
                        : "1px solid rgba(255,255,255,0.06)",
                      color: "#F5F5F0",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleProceedToInfo}
                disabled={!finalAmount || finalAmount < 1}
                className="btn-gold w-full py-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue →
              </button>

              <p className="text-xs text-center" style={{ color: "#2A2A28" }}>
                After payment, your Impact Tier is revealed. Some outcomes are
                more dramatic than others.
              </p>
            </div>
          )}

          {/* Step 2: Donor Info */}
          {step === "info" && (
            <div className="flex flex-col gap-4">
              <div>
                <label
                  className="text-xs tracking-widest uppercase block mb-2"
                  style={{ color: "#4A4A48" }}
                >
                  Display Name (for leaderboard)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex H."
                  value={donorInfo.name}
                  onChange={(e) =>
                    setDonorInfo({ ...donorInfo, name: e.target.value })
                  }
                  disabled={donorInfo.isAnonymous}
                  className="w-full px-4 py-4 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#F5F5F0",
                    opacity: donorInfo.isAnonymous ? 0.3 : 1,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-xs tracking-widest uppercase block mb-2"
                  style={{ color: "#4A4A48" }}
                >
                  Email (for receipt + monthly impact report)
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={donorInfo.email}
                  onChange={(e) =>
                    setDonorInfo({ ...donorInfo, email: e.target.value })
                  }
                  disabled={donorInfo.isAnonymous}
                  className="w-full px-4 py-4 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#F5F5F0",
                    opacity: donorInfo.isAnonymous ? 0.3 : 1,
                  }}
                />
              </div>

              <button
                onClick={() =>
                  setDonorInfo({
                    ...donorInfo,
                    isAnonymous: !donorInfo.isAnonymous,
                  })
                }
                className="flex items-center gap-3 text-left py-3 px-4 transition-all"
                style={{
                  background: donorInfo.isAnonymous
                    ? "rgba(201,162,39,0.08)"
                    : "transparent",
                  border: "1px solid rgba(201,162,39,0.2)",
                  color: "#8A8A88",
                }}
              >
                <div
                  className="w-4 h-4 border flex items-center justify-center shrink-0"
                  style={{
                    borderColor: donorInfo.isAnonymous
                      ? "#C9A227"
                      : "rgba(255,255,255,0.2)",
                  }}
                >
                  {donorInfo.isAnonymous && (
                    <span style={{ color: "#C9A227", fontSize: "10px" }}>
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-sm">
                  Donate anonymously — I don&apos;t need recognition
                </span>
              </button>

              {intentError && (
                <p className="text-xs text-center" style={{ color: "#FF6B6B" }}>
                  {intentError}
                </p>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={loadingIntent}
                className="btn-gold w-full py-4 text-sm disabled:opacity-50"
              >
                {loadingIntent ? "Preparing..." : `Proceed to Payment — $${finalAmount} →`}
              </button>

              <button
                onClick={() => setStep("amount")}
                className="text-xs text-center transition-colors"
                style={{ color: "#4A4A48" }}
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === "payment" && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: stripeAppearance,
              }}
            >
              <DonationForm
                iq={safeIQ}
                clientSecret={clientSecret}
                amount={finalAmount!}
                onBack={() => setStep("info")}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DonatePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div
            className="text-xs tracking-widest uppercase"
            style={{ color: "#4A4A48" }}
          >
            Loading...
          </div>
        </div>
      }
    >
      <DonatePage />
    </Suspense>
  );
}
