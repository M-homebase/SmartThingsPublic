"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function percentileLabel(iq: number): string {
  if (iq >= 96) return "top 2%";
  if (iq >= 93) return "top 5%";
  if (iq >= 90) return "top 10%";
  if (iq >= 87) return "top 18%";
  if (iq >= 84) return "top 28%";
  if (iq >= 81) return "top 40%";
  return "top 55%";
}

function shameMessage(iq: number): string {
  if (iq >= 93)
    return `${100 - Math.round((iq - 75) * 2.2)}% of people who score this high still don't donate. Will you be one of them?`;
  if (iq >= 87)
    return `People at your score level donate at a rate of roughly 31%. The other 69% prefer to remain theoretically generous.`;
  return `Most people who score here decide they're "not quite ready." That's a choice too.`;
}

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const iq = parseInt(params.get("iq") ?? "85");
  const [displayIQ, setDisplayIQ] = useState(75);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const safeIQ = Math.min(99, Math.max(75, isNaN(iq) ? 85 : iq));

  useEffect(() => {
    const start = 75;
    const end = safeIQ;
    const duration = 1800;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplayIQ(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setRevealed(true);
      }
    };

    const timer = setTimeout(() => requestAnimationFrame(tick), 600);
    return () => clearTimeout(timer);
  }, [safeIQ]);

  const shareText = `My Benefactor IQ: ${safeIQ}. I'm in the ${percentileLabel(safeIQ)} of the Cognoscenti assessment. Think you can beat me?`;

  function copyShareLink() {
    const url = `${window.location.origin}/quiz`;
    const text = `${shareText}\n\n${url}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({
        title: "The Cognoscenti — Benefactor IQ",
        text: shareText,
        url: window.location.origin,
      });
    } else {
      copyShareLink();
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
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-8"
            style={{ color: "#C9A227" }}
          >
            Assessment Complete
          </p>

          {/* Score reveal card */}
          <div
            className="cognoscenti-card p-12 mb-8 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #0f0f0f 0%, #161208 100%)",
              border: "1px solid rgba(201,162,39,0.3)",
            }}
          >
            {/* Subtle radial glow */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(201,162,39,0.3) 0%, transparent 70%)",
              }}
            />

            <p
              className="text-xs tracking-[0.3em] uppercase mb-4 relative"
              style={{ color: "#8A8A88" }}
            >
              Your Benefactor IQ
            </p>
            <div
              className="text-8xl font-bold relative gold-text"
              style={{
                fontSize: "clamp(4rem, 15vw, 7rem)",
                transition: "all 0.1s",
              }}
            >
              {displayIQ}
            </div>

            {revealed && (
              <div
                className="mt-6 reveal-in relative"
                style={{ color: "#8A8A88" }}
              >
                <p className="text-sm">
                  You are in the{" "}
                  <span style={{ color: "#C9A227" }}>
                    {percentileLabel(safeIQ)}
                  </span>{" "}
                  of all Cognoscenti assessments.
                </p>
              </div>
            )}
          </div>

          {/* Shame message */}
          {revealed && (
            <div
              className="reveal-in mb-8 px-6 py-4"
              style={{
                background: "rgba(201,162,39,0.04)",
                border: "1px solid rgba(201,162,39,0.15)",
              }}
            >
              <p className="text-sm italic" style={{ color: "#605E5A" }}>
                {shameMessage(safeIQ)}
              </p>
            </div>
          )}

          {/* CTAs */}
          {revealed && (
            <div className="reveal-in flex flex-col gap-4">
              <button
                onClick={() => router.push(`/donate?iq=${safeIQ}`)}
                className="btn-gold w-full py-4 text-sm"
              >
                Prove it. Donate. →
              </button>

              <div className="flex gap-3">
                <button
                  onClick={shareNative}
                  className="btn-ghost flex-1 text-xs"
                >
                  {copied ? "Copied!" : "Share your score"}
                </button>
                <button
                  onClick={() => router.push(`/donate?iq=${safeIQ}&challenge=true`)}
                  className="btn-ghost flex-1 text-xs"
                >
                  Challenge someone
                </button>
              </div>
            </div>
          )}

          {revealed && (
            <p
              className="text-xs mt-6 reveal-in"
              style={{ color: "#2A2A28" }}
            >
              Assessment results do not expire. Your score is{" "}
              <span style={{ color: "#4A4A48" }}>
                {safeIQ >= 90 ? "exceptional" : safeIQ >= 85 ? "strong" : "above average"}
              </span>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-xs tracking-widest uppercase" style={{ color: "#4A4A48" }}>Loading...</div>
    </div>}>
      <Results />
    </Suspense>
  );
}
