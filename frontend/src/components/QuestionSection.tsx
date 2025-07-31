import React from "react";

interface QuestionSectionProps {
  question: string;
  setQuestion: (q: string) => void;
  onAsk: () => void;
  loading: boolean;
  backendReady: boolean;
}

export default function QuestionSection({
  question,
  setQuestion,
  onAsk,
  loading,
  backendReady,
}: QuestionSectionProps) {
  return (
    <div>
      <label className="block font-medium">💬 Career-related question:</label>
      <input
        type="text"
        className="w-full mt-2 p-2 border border-gray-300 rounded disabled:opacity-50"
        placeholder={
          backendReady
            ? "e.g. How can I transition from a BA to a Data Scientist?"
            : "Please upload your document first (or re-upload if session expired)"
        }
        value={question}
        disabled={!backendReady} // disable input if session expired
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !loading &&
            question.trim() &&
            backendReady
          ) {
            onAsk();
          }
        }}
      />
      <button
        onClick={onAsk}
        type="button"
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        disabled={loading || !question.trim() || !backendReady} // Disable button if backend is not ready
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              />
            </svg>
            Asking...
          </span>
        ) : (
          "Ask Question"
        )}
      </button>
    </div>
  );
}
