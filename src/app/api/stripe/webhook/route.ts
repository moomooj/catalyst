import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { getStripeWebhookSecret, stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

    // Find the booking first to preserve and append to the note
    const booking = await db.booking.findUnique({
      where: { stripeCheckoutSessionId: session.id },
      select: { id: true, note: true },
    });

    if (booking) {
      const isFinal = session.metadata?.type === "final";
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

      await db.booking.update({
        where: { id: booking.id },
        data: {
          depositPaid: true,
          finalPaid: isFinal || booking.finalPaid,
          status: isFinal ? "CONFIRMED" : "DEPOSIT_PAID",
          paymentStatus: "PAID",
          stripePaymentIntentId: paymentIntentId,
          note: (booking.note ? booking.note + "\n" : "") + `[LOG:PAYMENT] ${new Date().toISOString()}|${isFinal ? "Final Payment" : "Payment"} Received|$${amountPaid}`,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
