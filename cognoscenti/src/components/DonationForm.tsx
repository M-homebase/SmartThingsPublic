"use client";

import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

interface DonationFormProps {
  iq: number;
  clientSecret: string;
  amount: number;
  onBack: () => void;
}

export default function DonationForm({
  iq,
  clientSecret: _clientSecret,
  amount,
  onBack,
}: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reveal`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Summary */}
      <div
        className="p-5"
        style={{
          background: "rgba(201,162,39,0.05)",
          border: "1px solid rgba(201,162,39,0.2)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: "#8A8A88" }}>
              Donation Amount
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#E8D5A3" }}>
              ${amount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-widest uppercase" style={{ color: "#8A8A88" }}>
              Benefactor IQ
            </p>
            <p className="text-2xl font-bold mt-1 gold-text">{iq}</p>
          </div>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-3"
          style={{ color: "#8A8A88" }}
        >
          Payment Details
        </p>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-center" style={{ color: "#FF6B6B" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-gold w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : `Give $${amount} →`}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-center transition-colors"
        style={{ color: "#4A4A48" }}
      >
        ← Change amount
      </button>

      <p className="text-xs text-center" style={{ color: "#2A2A28" }}>
        Secured by Stripe. 100% of your donation goes to partner nonprofits.
      </p>
    </form>
  );
}

// Stripe appearance config (exported for use in page)
export const stripeAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#C9A227",
    colorBackground: "#161616",
    colorText: "#F5F5F0",
    colorDanger: "#FF6B6B",
    fontFamily: "Arial, sans-serif",
    borderRadius: "2px",
  },
};
