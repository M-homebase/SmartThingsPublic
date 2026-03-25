import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      // Mark donation as paid
      const donation = await prisma.donation.update({
        where: { stripePaymentId: paymentIntent.id },
        data: { paid: true },
      });

      // Upsert leaderboard entry if donor has a name and email
      if (!donation.isAnonymous && (donation.displayName || donation.email)) {
        const key = donation.email ?? `nomail_${donation.id}`;
        const displayName = donation.displayName ?? "Anonymous";

        const existing = await prisma.leaderboardEntry.findUnique({
          where: { email: key },
        });

        if (existing) {
          await prisma.leaderboardEntry.update({
            where: { email: key },
            data: {
              totalDonated: existing.totalDonated + donation.amount,
              donationCount: existing.donationCount + 1,
              // Update IQ to highest score
              benefactorIQ: Math.max(
                existing.benefactorIQ,
                donation.benefactorIQ
              ),
            },
          });
        } else {
          await prisma.leaderboardEntry.create({
            data: {
              displayName,
              email: key,
              totalDonated: donation.amount,
              donationCount: 1,
              benefactorIQ: donation.benefactorIQ,
            },
          });
        }
      }

      // Handle anonymous donors on leaderboard
      if (donation.isAnonymous) {
        await prisma.leaderboardEntry.create({
          data: {
            displayName: "Anonymous Benefactor",
            email: `anon_${donation.id}`,
            totalDonated: donation.amount,
            donationCount: 1,
            benefactorIQ: donation.benefactorIQ,
          },
        });
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
      return Response.json(
        { error: "Processing failed" },
        { status: 500 }
      );
    }
  }

  return Response.json({ received: true });
}
