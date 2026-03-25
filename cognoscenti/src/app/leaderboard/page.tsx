import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface LeaderboardRow {
  id: string;
  displayName: string;
  totalDonated: number;
  donationCount: number;
  benefactorIQ: number;
}

async function getLeaderboard(): Promise<LeaderboardRow[]> {
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      orderBy: { totalDonated: "desc" },
      take: 25,
    });
    return entries;
  } catch {
    return [];
  }
}

async function getGlobalStats() {
  try {
    const [count, agg] = await Promise.all([
      prisma.donation.count({ where: { paid: true } }),
      prisma.donation.aggregate({
        where: { paid: true },
        _sum: { amount: true },
        _avg: { benefactorIQ: true },
      }),
    ]);
    return {
      donationCount: count,
      totalDonated: Math.round((agg._sum.amount ?? 0) / 100),
      avgIQ: Math.round(agg._avg.benefactorIQ ?? 0),
    };
  } catch {
    return { donationCount: 0, totalDonated: 0, avgIQ: 0 };
  }
}

const TIER_COLORS: Record<string, string> = {
  APEX: "#C9A227",
  GOLD: "#C0A060",
  SILVER: "#A8A8B0",
  STANDARD: "#708090",
};

export default async function LeaderboardPage() {
  const [entries, stats] = await Promise.all([
    getLeaderboard(),
    getGlobalStats(),
  ]);

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

      <div className="flex-1 px-6 py-16 max-w-3xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "#C9A227" }}
          >
            The Cognoscenti
          </p>
          <h1 className="text-4xl font-bold mb-4">Benefactor Leaderboard</h1>
          <p style={{ color: "#8A8A88" }}>
            Those who acted. Ranked by total contribution.
          </p>
        </div>

        {/* Stats row */}
        {stats.donationCount > 0 && (
          <div
            className="grid grid-cols-3 gap-4 mb-12 p-6"
            style={{
              background: "rgba(201,162,39,0.04)",
              border: "1px solid rgba(201,162,39,0.15)",
            }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold gold-text">
                ${stats.totalDonated.toLocaleString()}
              </div>
              <div
                className="text-xs tracking-widest uppercase mt-1"
                style={{ color: "#4A4A48" }}
              >
                Total Redistributed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gold-text">
                {stats.donationCount}
              </div>
              <div
                className="text-xs tracking-widest uppercase mt-1"
                style={{ color: "#4A4A48" }}
              >
                Benefactors
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gold-text">
                {stats.avgIQ || "—"}
              </div>
              <div
                className="text-xs tracking-widest uppercase mt-1"
                style={{ color: "#4A4A48" }}
              >
                Avg. Benefactor IQ
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard table */}
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4" style={{ color: "rgba(201,162,39,0.3)" }}>◆</p>
            <p style={{ color: "#4A4A48" }}>
              The leaderboard is empty. You could be first.
            </p>
            <Link href="/quiz" className="inline-block mt-6">
              <button className="btn-gold text-sm">Begin Assessment →</button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Column headers */}
            <div
              className="grid grid-cols-12 px-4 py-2 text-xs tracking-widest uppercase"
              style={{ color: "#2A2A28" }}
            >
              <span className="col-span-1">#</span>
              <span className="col-span-5">Name</span>
              <span className="col-span-2 text-right">IQ</span>
              <span className="col-span-2 text-right">Given</span>
              <span className="col-span-2 text-right">Donations</span>
            </div>

            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 items-center px-4 py-4 transition-all"
                style={{
                  background:
                    i === 0
                      ? "rgba(201,162,39,0.08)"
                      : i < 3
                      ? "rgba(201,162,39,0.04)"
                      : "rgba(255,255,255,0.02)",
                  border:
                    i === 0
                      ? "1px solid rgba(201,162,39,0.3)"
                      : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                {/* Rank */}
                <span
                  className="col-span-1 text-sm font-bold"
                  style={{
                    color:
                      i === 0
                        ? "#C9A227"
                        : i < 3
                        ? "#8B7536"
                        : "#2A2A28",
                  }}
                >
                  {i + 1}
                </span>

                {/* Name */}
                <div className="col-span-5">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: i === 0 ? "#E8D5A3" : "#8A8A88",
                    }}
                  >
                    {entry.displayName}
                  </span>
                  {i === 0 && (
                    <span
                      className="ml-2 text-xs px-2 py-0.5"
                      style={{
                        background: "rgba(201,162,39,0.2)",
                        color: "#C9A227",
                      }}
                    >
                      #1
                    </span>
                  )}
                </div>

                {/* IQ */}
                <span
                  className="col-span-2 text-sm text-right font-medium"
                  style={{ color: "#C9A227" }}
                >
                  {entry.benefactorIQ}
                </span>

                {/* Total */}
                <span
                  className="col-span-2 text-sm text-right"
                  style={{ color: i === 0 ? "#E8D5A3" : "#605E5A" }}
                >
                  ${Math.round(entry.totalDonated / 100).toLocaleString()}
                </span>

                {/* Count */}
                <span
                  className="col-span-2 text-xs text-right"
                  style={{ color: "#2A2A28" }}
                >
                  {entry.donationCount}×
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-12 p-8 text-center"
          style={{ border: "1px solid rgba(201,162,39,0.15)" }}
        >
          <p className="text-sm mb-4" style={{ color: "#8A8A88" }}>
            Your name could be here. Your Benefactor IQ is already established.
          </p>
          <Link href="/quiz">
            <button className="btn-gold text-sm">
              {entries.length === 0 ? "Be the first →" : "Compete →"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
