export type RevealTier = "APEX" | "GOLD" | "SILVER" | "STANDARD";

export interface RevealResult {
  tier: RevealTier;
  title: string;
  message: string;
  color: string;
  percentage: string;
}

export function assignRevealTier(): RevealResult {
  const rand = Math.random();

  if (rand < 0.05) {
    return {
      tier: "APEX",
      title: "Apex Status Achieved",
      message:
        "Your contribution has been flagged for amplification by an anonymous matching partner. Your impact has been tripled. You are in the top 5% of all Cognoscenti benefactors.",
      color: "#D4AF37",
      percentage: "top 5%",
    };
  } else if (rand < 0.25) {
    return {
      tier: "GOLD",
      title: "Gold Benefactor",
      message:
        "Exceptional. Your donation has been allocated to fund verified scholarships through our DonorsChoose partnership. A student's trajectory changes today because you acted.",
      color: "#C0A060",
      percentage: "top 25%",
    };
  } else if (rand < 0.60) {
    return {
      tier: "SILVER",
      title: "Silver Benefactor",
      message:
        "Your contribution directly funds mental health crisis support through NAMI's partner network. Real people. Real moments of intervention. Your name is attached to that.",
      color: "#A8A8B0",
      percentage: "top 60%",
    };
  } else {
    return {
      tier: "STANDARD",
      title: "Benefactor Confirmed",
      message:
        "Your donation is on its way to our partner nonprofits. You did what most people only talk about. That counts.",
      color: "#708090",
      percentage: "confirmed",
    };
  }
}

export const NONPROFIT_PARTNERS = [
  {
    name: "NAMI",
    description: "National Alliance on Mental Illness",
    focus: "Mental Health",
    url: "https://www.nami.org",
  },
  {
    name: "DonorsChoose",
    description: "Direct classroom funding for public school teachers",
    focus: "Education",
    url: "https://www.donorschoose.org",
  },
  {
    name: "Khan Academy",
    description: "Free education for anyone, anywhere",
    focus: "Education",
    url: "https://www.khanacademy.org",
  },
  {
    name: "Crisis Text Line",
    description: "Free 24/7 mental health crisis support via text",
    focus: "Mental Health",
    url: "https://www.crisistextline.org",
  },
];
