"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const QUESTIONS = [
  {
    id: 1,
    question: "When you spot a flaw in someone's reasoning, what do you typically do?",
    options: [
      { text: "Politely hint at it and hope they catch on", points: 15 },
      { text: "Let it go — most people aren't open to feedback anyway", points: 10 },
      { text: "Address it directly, even if it's uncomfortable", points: 30 },
      { text: "Wait. If it matters enough, they'll figure it out", points: 20 },
    ],
  },
  {
    id: 2,
    question: "How would people who know you well describe your decision-making?",
    options: [
      { text: "Careful and considered — sometimes frustratingly so", points: 25 },
      { text: "Fast and usually right, which has become its own problem", points: 28 },
      { text: "Thoughtful, independent, occasionally contrarian", points: 30 },
      { text: "Good. Better when they listen to me about it.", points: 22 },
    ],
  },
  {
    id: 3,
    question: "When a popular opinion is clearly wrong, you:",
    options: [
      { text: "Say nothing — pick your battles", points: 12 },
      { text: "Engage directly with the people who hold it", points: 30 },
      { text: "Post something that will be misunderstood by everyone", points: 18 },
      { text: "Add it to the long list of things you're apparently alone in seeing", points: 25 },
    ],
  },
  {
    id: 4,
    question: "Your honest relationship with most institutions is:",
    options: [
      { text: "Broadly supportive — they're doing their best", points: 8 },
      { text: "Respectful but skeptical — show me the evidence", points: 30 },
      { text: "Deeply cynical — I've seen how the sausage is made", points: 20 },
      { text: "It entirely depends on which institution and who's asking", points: 27 },
    ],
  },
  {
    id: 5,
    question: "What actually drives you to give back?",
    options: [
      { text: "Guilt, if I'm being honest", points: 8 },
      { text: "The tax benefits, and also let's be honest everyone knows it", points: 12 },
      { text: "Systemic change — individual charity doesn't scale, but it's a start", points: 30 },
      { text: "I genuinely want to help. I know that sounds simple.", points: 25 },
    ],
  },
];

function calculateIQ(totalPoints: number): number {
  const max = 150;
  const iq = Math.round(75 + (totalPoints / max) * 24);
  return Math.min(99, Math.max(75, iq));
}

export default function QuizPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  function handleSelect(optionIndex: number) {
    if (transitioning) return;
    setSelected(optionIndex);
  }

  function handleNext() {
    if (selected === null || transitioning) return;
    const points = question.options[selected].points;
    const newAnswers = [...answers, points];

    setTransitioning(true);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setAnswers(newAnswers);
        setCurrentQ(currentQ + 1);
        setSelected(null);
        setTransitioning(false);
      } else {
        setCalculating(true);
        const total = newAnswers.reduce((a, b) => a + b, 0);
        const iq = calculateIQ(total);
        setTimeout(() => {
          router.push(`/results?iq=${iq}`);
        }, 2800);
      }
    }, 300);
  }

  if (calculating) {
    return <CalculatingScreen />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs tracking-[0.3em] uppercase font-bold"
          style={{ color: "#C9A227" }}
        >
          The Cognoscenti
        </Link>
        <span className="text-xs" style={{ color: "#4A4A48" }}>
          Question {currentQ + 1} of {QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-px" style={{ background: "rgba(201,162,39,0.1)" }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            background: "linear-gradient(90deg, #C9A227, #E8D5A3)",
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div
          className="w-full max-w-2xl"
          style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.3s" }}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-8 text-center"
            style={{ color: "#C9A227" }}
          >
            Benefactor Assessment
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center leading-snug">
            {question.question}
          </h2>

          <div className="flex flex-col gap-3">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className="text-left px-6 py-5 transition-all duration-200"
                style={{
                  background:
                    selected === i
                      ? "rgba(201,162,39,0.12)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    selected === i
                      ? "1px solid rgba(201,162,39,0.7)"
                      : "1px solid rgba(255,255,255,0.06)",
                  color: selected === i ? "#E8D5A3" : "#8A8A88",
                  boxShadow:
                    selected === i
                      ? "0 0 20px rgba(201,162,39,0.1)"
                      : "none",
                }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs mt-0.5 shrink-0"
                    style={{
                      color:
                        selected === i
                          ? "#C9A227"
                          : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm leading-relaxed">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selected === null}
              className="btn-gold disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ opacity: selected === null ? 0.3 : 1 }}
            >
              {currentQ < QUESTIONS.length - 1 ? "Continue →" : "Calculate Score →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalculatingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div
          className="w-16 h-16 mx-auto mb-8 border-2 rounded-full"
          style={{
            borderColor: "rgba(201,162,39,0.2)",
            borderTopColor: "#C9A227",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p
          className="text-xs tracking-[0.3em] uppercase mb-4"
          style={{ color: "#C9A227" }}
        >
          Processing Assessment
        </p>
        <h2 className="text-2xl font-bold mb-3">Calculating your Benefactor IQ</h2>
        <p className="text-sm" style={{ color: "#4A4A48" }}>
          Cross-referencing response patterns against the Cognoscenti index...
        </p>
      </div>
    </div>
  );
}
