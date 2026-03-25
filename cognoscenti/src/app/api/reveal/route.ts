import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get("payment_intent");

  if (!paymentIntentId) {
    return Response.json({ error: "Missing payment_intent" }, { status: 400 });
  }

  try {
    // Verify payment status with Stripe directly
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return Response.json({ error: "Payment not completed" }, { status: 402 });
    }

    // Get the donation record
    const donation = await prisma.donation.findUnique({
      where: { stripePaymentId: paymentIntentId },
    });

    if (!donation) {
      return Response.json({ error: "Donation not found" }, { status: 404 });
    }

    // Mark as paid if not already (in case webhook hasn't fired yet)
    if (!donation.paid) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { paid: true },
      });
    }

    const TIER_COLORS: Record<string, string> = {
      APEX: "#C9A227",
      GOLD: "#C0A060",
      SILVER: "#A8A8B0",
      STANDARD: "#708090",
    };

    const TIER_PERCENTAGES: Record<string, string> = {
      APEX: "top 5%",
      GOLD: "top 25%",
      SILVER: "top 60%",
      STANDARD: "confirmed",
    };

    const TIER_TITLES: Record<string, string> = {
      APEX: "Apex Status Achieved",
      GOLD: "Gold Benefactor",
      SILVER: "Silver Benefactor",
      STANDARD: "Benefactor Confirmed",
    };

    return Response.json({
      tier: donation.revealTier,
      title: TIER_TITLES[donation.revealTier] ?? "Benefactor Confirmed",
      message: donation.revealMessage,
      color: TIER_COLORS[donation.revealTier] ?? "#708090",
      percentage: TIER_PERCENTAGES[donation.revealTier] ?? "confirmed",
      amount: Math.round(donation.amount / 100),
      benefactorIQ: donation.benefactorIQ,
    });
  } catch (err) {
    console.error("Reveal error:", err);
    return Response.json({ error: "Failed to retrieve reveal" }, { status: 500 });
  }
}
