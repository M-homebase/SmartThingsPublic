# The Cognoscenti — Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (test or live)
- Resend account (optional, for challenge emails)

## Setup

### 1. Environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/cognoscenti
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...       # optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database

```bash
npx prisma migrate dev --name init
# or for production:
npx prisma migrate deploy
```

### 3. Stripe Webhook (local dev)

Install the Stripe CLI, then:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the webhook signing secret it outputs into `STRIPE_WEBHOOK_SECRET` in your `.env`.

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Production deploy (Vercel)

1. Push to GitHub
2. Connect to Vercel
3. Add all environment variables in Vercel dashboard
4. Set Stripe webhook endpoint to `https://your-domain.com/api/webhook`
5. Run `npx prisma migrate deploy` against your production database

## Tier probabilities

| Tier     | Probability | Description                          |
|----------|-------------|--------------------------------------|
| APEX     | 5%          | Dramatic. Matching partner story.    |
| GOLD     | 20%         | DonorsChoose scholarship             |
| SILVER   | 35%         | NAMI mental health support           |
| STANDARD | 40%         | Basic confirmation. Drives repeat.   |

STANDARD is the most common intentionally — it creates the compulsion to donate again.
