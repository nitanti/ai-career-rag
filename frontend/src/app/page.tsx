"use client";

import { useRef, useState } from "react";

export default function RAGDemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [backendReady, setBackendReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const selectedFile = selected[0];
    setFile(selectedFile);
    setUploadStatus("⏳ Uploading...");
    setUploading(true);
    setUploadProgress(0);
    setBackendReady(false);
    setAnswer(null); // clear previous answer

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setUploading(false);

        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            if (response.status === "ready") {
              setUploadStatus("✅ Upload success and RAG chain built");
              setBackendReady(true);
            } else {
              setUploadStatus(
                "⚠️ Upload completed but not ready: " + (response.message || "")
              );
            }
          } else {
            setUploadStatus(
              "❌ Upload failed: " + (response.message || xhr.responseText)
            );
          }
        } catch {
          setUploadStatus("⚠️ Upload completed but response parsing failed.");
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setUploadStatus("❌ Upload error occurred.");
      };

      xhr.send(formData);
    } catch (err: any) {
      setUploading(false);
      setUploadStatus("❌ Upload error: " + err.message);
    }
  };

  const handleUploadClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setAnswer("❗ Please enter a question.");
      return;
    }

    if (!backendReady) {
      setAnswer("⚠️ Please upload a document first.");
      return;
    }

    setLoading(true);
    setAnswer("🌀 Loading...");

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(
        res.ok && data.answer
          ? data.answer
          : "❌ Error: " + (data.error || "Unknown error.")
      );
    } catch (err: any) {
      console.error("Ask error:", err);
      setAnswer("❌ Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎓 Career RAG Demo</h1>

      {/* Upload Section */}
      <div>
        <label className="block font-medium">
          📄 Upload resume or document file:
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
        />
        <button
          onClick={handleUploadClick}
          type="button"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>

        {uploading && (
          <div className="mt-2 w-full bg-gray-200 rounded">
            <div
              className="bg-blue-500 text-white text-xs font-medium text-center py-1 rounded"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        {uploadStatus && (
          <p className="mt-2 text-sm text-gray-700">{uploadStatus}</p>
        )}
      </div>

      {/* Ask Section */}
      <div>
        <label className="block font-medium">💬 Career-related question:</label>
        <input
          type="text"
          className="w-full mt-2 p-2 border border-gray-300 rounded"
          placeholder="e.g. How can I transition from a BA to a Data Scientist?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && question.trim()) {
              handleAsk();
            }
          }}
        />
        <button
          onClick={handleAsk}
          type="button"
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={loading || !question.trim() || !backendReady}
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

      {/* Answer */}
      {(loading || answer !== null) && (
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
      )}
    </div>
  );
}
