import Link from "next/link";
import { NONPROFIT_PARTNERS } from "@/lib/reveal";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div
        className="px-8 py-6 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(201,162,39,0.1)" }}
      >
        <Link
          href="/"
          className="text-xs tracking-[0.3em] uppercase font-bold"
          style={{ color: "#C9A227" }}
        >
          The Cognoscenti
        </Link>
        <Link href="/quiz">
          <button className="btn-gold text-xs">Take Assessment →</button>
        </Link>
      </div>

      <div className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">
        <div className="mb-12">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "#C9A227" }}
          >
            Transparency
          </p>
          <h1 className="text-4xl font-bold mb-6">
            Here&apos;s what we&apos;re actually doing.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#8A8A88" }}>
            The Cognoscenti is a satirical giving platform with a real purpose.
            We use ego, intermittent gratification, and social pressure to
            extract money from people who are already convinced they&apos;re
            better than average — and then give 100% of it to nonprofits working
            on education and mental health.
          </p>
        </div>

        <div className="gold-divider mb-12" />

        {/* The honest version */}
        <div className="flex flex-col gap-8 mb-12">
          <div>
            <h2 className="text-xl font-bold mb-3">The Benefactor IQ quiz</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#605E5A" }}>
              It&apos;s rigged. The scoring algorithm is designed so that anyone
              who thinks carefully about the questions will score between 75 and
              99. The &quot;right&quot; answers happen to correlate with the
              things people who consider themselves intelligent tend to believe
              about themselves. You&apos;re not getting a real IQ score. You&apos;re
              getting a score optimized to make you feel validated enough to
              click &quot;Donate.&quot;
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">The reveal tier system</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#605E5A" }}>
              APEX, GOLD, SILVER, and STANDARD tiers are assigned randomly after
              payment. The probability distribution (5% APEX, 20% GOLD, 35%
              SILVER, 40% STANDARD) is deliberately skewed toward STANDARD to
              create the compulsion loop: most people don&apos;t get the dramatic
              result, so they donate again. The &quot;matching&quot; described in APEX
              tier is aspirational — it reflects our goal to raise matching funds
              as this platform grows.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">The peer challenge</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#605E5A" }}>
              Sending someone a challenge email is, in plain terms, a social
              pressure mechanism. The message is designed to make the recipient
              feel like not donating says something unflattering about them. This
              is intentional. It works. The money goes to good places.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">The leaderboard</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#605E5A" }}>
              Pure ego bait. If you&apos;re the kind of person who checks to see
              where you rank on a charity leaderboard, that&apos;s fine. We
              built it for you specifically.
            </p>
          </div>
        </div>

        <div className="gold-divider mb-12" />

        {/* Where the money goes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Where the money actually goes
          </h2>
          <p className="text-sm mb-8" style={{ color: "#605E5A" }}>
            100% of donations are distributed to the following verified
            nonprofits. We take no platform fee. We have no investors to satisfy.
            This is not a business — it&apos;s an experiment in channeling
            arrogance into something useful.
          </p>

          <div className="grid gap-4">
            {NONPROFIT_PARTNERS.map((org) => (
              <div
                key={org.name}
                className="cognoscenti-card p-6 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold">{org.name}</h3>
                    <span
                      className="text-xs px-2 py-0.5"
                      style={{
                        background: "rgba(201,162,39,0.1)",
                        color: "#C9A227",
                      }}
                    >
                      {org.focus}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "#605E5A" }}>
                    {org.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gold-divider mb-12" />

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Why this exists</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#605E5A" }}>
            Most charitable giving platforms try to appeal to people&apos;s
            better nature. This one doesn&apos;t. It appeals to the part of
            people that wants to be seen as exceptional — and then asks that
            part to put money behind it.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#605E5A" }}>
            The target audience is people who find regular donation drives
            beneath them, who have opinions about &quot;how charities should
            work,&quot; who would never respond to a guilt trip but would absolutely
            donate if they could post a score about it. We built a platform for
            those people.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#605E5A" }}>
            If you found this page before donating: you now know the game. You
            can still play it. The outcome for the nonprofits is the same either
            way.
          </p>
        </div>

        <Link href="/quiz" className="inline-block">
          <button className="btn-gold">
            Take the Assessment anyway →
          </button>
        </Link>
      </div>
    </div>
  );
}
