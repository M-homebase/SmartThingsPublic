import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { assignRevealTier } from "@/lib/reveal";

export async function POST(request: Request) {
  try {
    const { amount, name, email, benefactorIQ, isAnonymous } =
      await request.json();

    if (!amount || amount < 1) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    const amountCents = Math.round(amount * 100);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        benefactorIQ: String(benefactorIQ ?? 0),
        donorName: isAnonymous ? "Anonymous" : name ?? "Anonymous",
      },
    });

    // Assign reveal tier upfront (deterministic per donation)
    const reveal = assignRevealTier();

    // Create pending donation record
    await prisma.donation.create({
      data: {
        amount: amountCents,
        displayName: isAnonymous ? null : name ?? null,
        email: email ?? null,
        benefactorIQ: benefactorIQ ?? 0,
        revealTier: reveal.tier,
        revealMessage: reveal.message,
        stripePaymentId: paymentIntent.id,
        isAnonymous: isAnonymous ?? false,
        paid: false,
      },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Checkout error:", err);
    return Response.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
