"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { RevealTier } from "@/lib/reveal";

interface RevealData {
  tier: RevealTier;
  title: string;
  message: string;
  color: string;
  percentage: string;
  amount: number;
  benefactorIQ: number;
}

const TIER_ICONS: Record<RevealTier, string> = {
  APEX: "◆",
  GOLD: "★",
  SILVER: "●",
  STANDARD: "▲",
};

const TIER_DESCRIPTIONS: Record<RevealTier, { nonprofit: string; impact: string }> = {
  APEX: {
    nonprofit: "NAMI + DonorsChoose (matched 3×)",
    impact: "Your contribution funds crisis intervention support AND classroom resources — amplified by our anonymous matching partner.",
  },
  GOLD: {
    nonprofit: "DonorsChoose",
    impact: "Your donation funds verified classroom projects in under-resourced public schools. A teacher submitted a request. You answered it.",
  },
  SILVER: {
    nonprofit: "Crisis Text Line + NAMI",
    impact: "Your contribution funds months of 24/7 mental health crisis support. Real people, real moments, real intervention.",
  },
  STANDARD: {
    nonprofit: "Khan Academy + NAMI",
    impact: "Your donation is distributed across free education access and mental health awareness programs. Every dollar moves.",
  },
};

function RevealContent() {
  const params = useSearchParams();
  const paymentIntentId = params.get("payment_intent");
  const redirectStatus = params.get("redirect_status");

  const [phase, setPhase] = useState<"loading" | "calculating" | "reveal" | "done" | "error">("loading");
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [copied, setCopied] = useState(false);
  const [challengeEmail, setChallengeEmail] = useState("");
  const [challengeSent, setChallengeSent] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  useEffect(() => {
    if (redirectStatus !== "succeeded" && redirectStatus !== null) {
      setPhase("error");
      return;
    }

    if (!paymentIntentId) {
      setPhase("error");
      return;
    }

    // Start calculating animation
    setPhase("calculating");

    async function fetchReveal() {
      try {
        const res = await fetch(`/api/reveal?payment_intent=${paymentIntentId}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setTimeout(() => {
          setRevealData(data);
          setPhase("reveal");
          setTimeout(() => setPhase("done"), 800);
        }, 2500); // Dramatic pause during calculating phase
      } catch {
        setPhase("error");
      }
    }

    fetchReveal();
  }, [paymentIntentId, redirectStatus]);

  async function sendChallenge() {
    if (!challengeEmail || !revealData) return;
    try {
      await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeeEmail: challengeEmail,
          challengerScore: revealData.benefactorIQ,
          challengerName: "A Cognoscenti Benefactor",
          message: `I just donated on The Cognoscenti and scored ${revealData.benefactorIQ} on the Benefactor Assessment. I assumed you'd want to know where you stand.`,
        }),
      });
      setChallengeSent(true);
    } catch {
      // silent fail
    }
  }

  function copyShareText() {
    if (!revealData) return;
    const text = `I gave on The Cognoscenti and received ${revealData.tier} status — ${revealData.percentage}. My Benefactor IQ: ${revealData.benefactorIQ}. Can you beat it?`;
    navigator.clipboard.writeText(`${text}\n\n${window.location.origin}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (phase === "loading" || phase === "calculating") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 mx-auto mb-8 relative"
            style={{
              border: "2px solid rgba(201,162,39,0.15)",
              borderTopColor: "#C9A227",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "#C9A227" }}
          >
            Calculating Impact
          </p>
          <h2 className="text-2xl font-bold mb-3">
            Determining your tier
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#4A4A48" }}>
            Analyzing contribution against Cognoscenti indices and available
            matching programs...
          </p>

          <div className="mt-8 flex flex-col gap-2">
            {["Verifying payment", "Calculating impact tier", "Assigning benefactor status"].map(
              (step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-xs"
                  style={{
                    color: "#4A4A48",
                    animation: `fade-in 0.5s ease ${i * 0.6}s both`,
                  }}
                >
                  <style>{`@keyframes fade-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }`}</style>
                  <span style={{ color: "#C9A227" }}>◆</span>
                  <span>{step}...</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p style={{ color: "#8A8A88" }}>Could not retrieve your donation details.</p>
        <Link href="/" className="mt-6 text-sm" style={{ color: "#C9A227" }}>
          Return home →
        </Link>
      </div>
    );
  }

  if (!revealData) return null;

  const tierInfo = TIER_DESCRIPTIONS[revealData.tier];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-8 py-6">
        <Link
          href="/"
          className="text-xs tracking-[0.3em] uppercase font-bold"
          style={{ color: "#C9A227" }}
        >
          The Cognoscenti
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: "#8A8A88" }}
          >
            Impact Tier Revealed
          </p>

          {/* Main reveal card */}
          <div
            className="reveal-in cognoscenti-card p-12 mb-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, #0f0f0f 0%, rgba(${
                revealData.tier === "APEX"
                  ? "201,162,39"
                  : revealData.tier === "GOLD"
                  ? "192,160,96"
                  : revealData.tier === "SILVER"
                  ? "168,168,176"
                  : "112,128,144"
              }, 0.08) 100%)`,
              border: `1px solid ${revealData.color}40`,
              boxShadow:
                revealData.tier === "APEX"
                  ? `0 0 60px rgba(201,162,39,0.25), 0 0 120px rgba(201,162,39,0.1)`
                  : `0 0 30px ${revealData.color}20`,
            }}
          >
            {/* Tier icon */}
            <div
              className="text-6xl mb-4"
              style={{ color: revealData.color }}
            >
              {TIER_ICONS[revealData.tier]}
            </div>

            <div
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: revealData.color }}
            >
              {revealData.tier === "APEX"
                ? "Apex Benefactor"
                : revealData.tier === "GOLD"
                ? "Gold Benefactor"
                : revealData.tier === "SILVER"
                ? "Silver Benefactor"
                : "Benefactor"}
            </div>

            <h2 className="text-3xl font-bold mb-4">{revealData.title}</h2>

            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "#8A8A88" }}
            >
              {revealData.message}
            </p>

            <div
              className="pt-6"
              style={{ borderTop: `1px solid ${revealData.color}20` }}
            >
              <p
                className="text-xs tracking-widest uppercase mb-2"
                style={{ color: "#4A4A48" }}
              >
                Your contribution goes to
              </p>
              <p className="text-sm font-semibold" style={{ color: revealData.color }}>
                {tierInfo.nonprofit}
              </p>
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: "#4A4A48" }}
              >
                {tierInfo.impact}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="flex items-center justify-center gap-8 mb-8 py-4"
            style={{ borderTop: "1px solid rgba(201,162,39,0.1)", borderBottom: "1px solid rgba(201,162,39,0.1)" }}
          >
            <div>
              <p className="text-xs tracking-widest uppercase" style={{ color: "#4A4A48" }}>
                You gave
              </p>
              <p className="text-xl font-bold" style={{ color: "#E8D5A3" }}>
                ${revealData.amount}
              </p>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(201,162,39,0.2)" }} />
            <div>
              <p className="text-xs tracking-widest uppercase" style={{ color: "#4A4A48" }}>
                Benefactor IQ
              </p>
              <p className="text-xl font-bold gold-text">{revealData.benefactorIQ}</p>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(201,162,39,0.2)" }} />
            <div>
              <p className="text-xs tracking-widest uppercase" style={{ color: "#4A4A48" }}>
                Tier
              </p>
              <p className="text-xl font-bold" style={{ color: revealData.color }}>
                {revealData.tier}
              </p>
            </div>
          </div>

          {/* Actions */}
          {phase === "done" && (
            <div className="flex flex-col gap-3 reveal-in">
              <button onClick={copyShareText} className="btn-gold w-full py-3 text-sm">
                {copied ? "Copied to clipboard ✓" : "Share your tier →"}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowChallenge(!showChallenge)}
                  className="btn-ghost flex-1 text-xs"
                >
                  Challenge someone
                </button>
                <Link href="/leaderboard" className="flex-1">
                  <button className="btn-ghost w-full text-xs">
                    See the leaderboard
                  </button>
                </Link>
              </div>

              {showChallenge && (
                <div
                  className="p-5 flex flex-col gap-3"
                  style={{
                    background: "rgba(201,162,39,0.04)",
                    border: "1px solid rgba(201,162,39,0.15)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#8A8A88" }}>
                    Send a challenge email. They&apos;ll know you donated. They&apos;ll
                    feel the pressure. That&apos;s the point.
                  </p>
                  <input
                    type="email"
                    placeholder="their@email.com"
                    value={challengeEmail}
                    onChange={(e) => setChallengeEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#F5F5F0",
                    }}
                  />
                  <button
                    onClick={sendChallenge}
                    disabled={!challengeEmail || challengeSent}
                    className="btn-gold text-xs disabled:opacity-50"
                  >
                    {challengeSent ? "Challenge sent ✓" : "Send challenge →"}
                  </button>
                </div>
              )}

              <div className="mt-4">
                <Link href="/donate">
                  <button
                    className="text-xs transition-colors"
                    style={{ color: "#4A4A48" }}
                  >
                    Donate again and try for a different tier →
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RevealPage() {
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
      <RevealContent />
    </Suspense>
  );
}
