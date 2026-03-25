import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [donationCount, totalAgg] = await Promise.all([
      prisma.donation.count({ where: { paid: true } }),
      prisma.donation.aggregate({
        where: { paid: true },
        _sum: { amount: true },
      }),
    ]);
    return {
      donationCount,
      totalDonated: Math.round((totalAgg._sum.amount ?? 0) / 100),
    };
  } catch {
    return { donationCount: 0, totalDonated: 0 };
  }
}

const TICKER_ITEMS = [
  "Marcus T. just scored 97 on the Benefactor Assessment",
  "Anonymous donated $100 · APEX status achieved",
  "Priya S. challenged her colleague · 'I assumed they wouldn't. I was right.'",
  "James K. scored 91 · Gold Benefactor",
  "Alexandra W. donated $250 · APEX · matching applied",
  "Daniel R. challenged 3 people from his last all-hands",
  "Yuki M. scored 89 · 'Finally, something that made sense to me'",
  "Chris B. donated again · 'I got Standard last time. Unacceptable.'",
  "Nadia O. scored 95 · Silver Benefactor",
  "Robert F. challenged his entire leadership team",
];

export default async function Home() {
  const stats = await getStats();
  const visitorEstimate =
    stats.donationCount > 0 ? Math.round(stats.donationCount / 0.084) : 847;
  const donorPercent =
    stats.donationCount > 0
      ? ((stats.donationCount / visitorEstimate) * 100).toFixed(1)
      : "8.4";

  return (
    <main className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,8,8,0.98), transparent)",
        }}
      >
        <span
          className="text-sm font-bold tracking-[0.3em] uppercase"
          style={{ color: "#C9A227" }}
        >
          The Cognoscenti
        </span>
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/leaderboard"
            className="text-xs tracking-widest uppercase transition-colors hover:text-[#C9A227]"
            style={{ color: "#8A8A88" }}
          >
            Leaderboard
          </Link>
          <Link
            href="/about"
            className="text-xs tracking-widest uppercase transition-colors hover:text-[#C9A227]"
            style={{ color: "#8A8A88" }}
          >
            About
          </Link>
          <Link href="/quiz">
            <button className="btn-gold text-xs">Begin Assessment</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-16 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, #C9A227 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Live badge */}
        <div
          className="flex items-center gap-2 mb-12 px-4 py-2"
          style={{
            border: "1px solid rgba(201,162,39,0.3)",
            background: "rgba(201,162,39,0.05)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full pulse-gold"
            style={{ background: "#C9A227" }}
          />
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: "#8A8A88" }}
          >
            Live ·{" "}
            <span style={{ color: "#C9A227" }}>
              {stats.donationCount || "—"}
            </span>{" "}
            have donated.{" "}
            <span style={{ color: "#C9A227" }}>{donorPercent}%</span> of
            visitors. The rest weren&apos;t ready.
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6 max-w-4xl tracking-tight">
          Most people{" "}
          <span className="italic" style={{ color: "#8A8A88" }}>
            aren&apos;t ready
          </span>
          <br />
          for this.
        </h1>

        <p
          className="text-lg md:text-xl max-w-2xl mb-4 leading-relaxed"
          style={{ color: "#8A8A88" }}
        >
          The Cognoscenti is a giving platform for people who understand that
          being right about the world is <em>insufficient.</em>
        </p>
        <p
          className="text-base max-w-xl mb-12 leading-relaxed"
          style={{ color: "#605E5A" }}
        >
          We&apos;ve found that individuals with above-average pattern
          recognition and genuine intellectual honesty give more — and give
          smarter. Before you donate, we assess where you fall.
        </p>

        <Link href="/quiz">
          <button className="btn-gold text-sm mb-4">
            Take the Benefactor Assessment →
          </button>
        </Link>
        <p className="text-xs tracking-wide" style={{ color: "#4A4A48" }}>
          5 questions · 3 minutes · Honest results
        </p>

        {/* Stats row */}
        {stats.totalDonated > 0 && (
          <div className="mt-16 flex items-center gap-12">
            <div className="text-center">
              <div className="text-3xl font-bold gold-text">
                ${stats.totalDonated.toLocaleString()}
              </div>
              <div
                className="text-xs tracking-widest uppercase mt-1"
                style={{ color: "#4A4A48" }}
              >
                Redistributed
              </div>
            </div>
            <div
              className="w-px h-8"
              style={{ background: "rgba(201,162,39,0.2)" }}
            />
            <div className="text-center">
              <div className="text-3xl font-bold gold-text">
                {stats.donationCount}
              </div>
              <div
                className="text-xs tracking-widest uppercase mt-1"
                style={{ color: "#4A4A48" }}
              >
                Benefactors
              </div>
            </div>
            <div
              className="w-px h-8"
              style={{ background: "rgba(201,162,39,0.2)" }}
            />
            <div className="text-center">
              <div className="text-3xl font-bold gold-text">4</div>
              <div
                className="text-xs tracking-widest uppercase mt-1"
                style={{ color: "#4A4A48" }}
              >
                Partner Nonprofits
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Activity ticker */}
      <div
        className="py-3 overflow-hidden relative"
        style={{
          borderTop: "1px solid rgba(201,162,39,0.1)",
          borderBottom: "1px solid rgba(201,162,39,0.1)",
          background: "rgba(201,162,39,0.03)",
        }}
      >
        <div className="ticker-content flex gap-12">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-xs" style={{ color: "#4A4A48" }}>
              <span style={{ color: "rgba(201,162,39,0.5)" }}>◆</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-4"
              style={{ color: "#C9A227" }}
            >
              The Process
            </p>
            <h2 className="text-4xl font-bold mb-4">Deceptively simple.</h2>
            <p style={{ color: "#8A8A88" }}>
              We designed this for people who have heard every other pitch.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Assess",
                desc: "5 questions that measure how you actually think — not how you wish you did. Most people score higher than they expect. Some are surprised in the other direction.",
              },
              {
                num: "02",
                title: "Decide",
                desc: "Your score unlocks your Benefactor IQ. Then you choose an amount. There is no minimum. There is no suggested donation. This is not a guilt trip.",
              },
              {
                num: "03",
                title: "Reveal",
                desc: "After you give, your Impact Tier is calculated. Each tier tells you exactly where your money goes. Some outcomes are considerably more dramatic than others.",
              },
            ].map((step) => (
              <div key={step.num} className="cognoscenti-card p-8">
                <div
                  className="text-xs tracking-[0.3em] mb-4"
                  style={{ color: "#C9A227" }}
                >
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#8A8A88" }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provocation section */}
      <section
        className="py-20 px-6"
        style={{
          background: "#0C0C0C",
          borderTop: "1px solid rgba(201,162,39,0.08)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: "#C9A227" }}
          >
            An Observation
          </p>
          <blockquote
            className="text-2xl md:text-3xl font-light leading-relaxed mb-8"
            style={{ color: "#D0CEC9" }}
          >
            &ldquo;The people most certain they would act in a moral crisis
            are, statistically, the least likely to when it finally
            arrives.&rdquo;
          </blockquote>
          <p className="text-sm" style={{ color: "#4A4A48" }}>
            — Every study on the bystander effect, ever
          </p>
          <div className="gold-divider mt-12 mb-12" />
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#605E5A" }}
          >
            The Benefactor Assessment takes 3 minutes. You&apos;ll either
            discover your giving capacity — or discover you&apos;re exactly
            the person you&apos;ve been frustrated by in others. Either way,
            you&apos;ll know.
          </p>
          <Link href="/quiz" className="inline-block mt-8">
            <button className="btn-gold">I&apos;m ready →</button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="mt-auto py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "#C9A227" }}
        >
          The Cognoscenti
        </span>
        <div className="flex gap-8">
          <Link
            href="/about"
            className="text-xs hover:text-[#C9A227] transition-colors"
            style={{ color: "#4A4A48" }}
          >
            Where the money goes
          </Link>
          <Link
            href="/leaderboard"
            className="text-xs hover:text-[#C9A227] transition-colors"
            style={{ color: "#4A4A48" }}
          >
            Leaderboard
          </Link>
        </div>
        <p className="text-xs" style={{ color: "#2A2A28" }}>
          100% of donations go to verified nonprofits.
        </p>
      </footer>
    </main>
  );
}
