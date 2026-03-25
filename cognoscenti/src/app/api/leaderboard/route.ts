import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      orderBy: { totalDonated: "desc" },
      take: 25,
    });

    return Response.json(entries);
  } catch (err) {
    console.error("Leaderboard error:", err);
    return Response.json([], { status: 500 });
  }
}
