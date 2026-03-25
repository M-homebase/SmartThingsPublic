import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Cognoscenti — Give Like You Mean It",
  description:
    "A giving platform for people who understand that being right about the world is insufficient. Real impact requires action. Assess your potential. Then prove it.",
  openGraph: {
    title: "The Cognoscenti",
    description:
      "Most people aren't ready for this. Take the Benefactor Assessment and find out if you are.",
    siteName: "The Cognoscenti",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
