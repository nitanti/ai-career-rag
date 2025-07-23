import React from "react";

interface AnswerSectionProps {
  answer: string | null;
  loading: boolean;
}

export default function AnswerSection({ answer, loading }: AnswerSectionProps) {
  return loading || answer !== null ? (
    <div
      className={`
        p-4 bg-white border border-gray-300 rounded min-h-[80px]
        transition duration-500 ease-in-out
        ${
          answer === null && loading
            ? "opacity-0 translate-y-2"
            : "opacity-100 translate-y-0"
        }
      `}
    >
      <h2 className="font-semibold mb-2 text-gray-800">🧠 Answer:</h2>
      {loading ? (
        <p className="text-gray-500 italic">🌀 Loading...</p>
      ) : (
        <p className="text-gray-900 whitespace-pre-line font-medium">
          {answer}
        </p>
      )}
    </div>
  ) : null;
}
