"use client";

import { useRef, useState } from "react";
import UploadSection from "@/components/UploadSection";
import QuestionSection from "@/components/QuestionSection";
import AnswerSection from "@/components/AnswerSection";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function RAGDemoPage() {
  const [file, setFile] = useState<File | null>(null);

  const [uploadStatus, setUploadStatus] = useState<{
    message: string;
    state: "loading" | "success" | "error" | null;
  }>({ message: "", state: null });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [backendReady, setBackendReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [forceNewSession, setForceNewSession] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setUploadStatus({ message: "⏳ Uploading...", state: "loading" });
    setUploading(true);
    setUploadProgress(0);

    // Clear previous session and reset UI state
    setBackendReady(false);
    setSessionId(null);
    setAnswer(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (forceNewSession) {
      formData.append("force_new_session", "true"); // tell backend to create new session
    }

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
              setUploadStatus({
                message: "✅ File uploaded successfully!",
                state: "success",
              });
              setBackendReady(true);
              setSessionId(response.session_id);
              setForceNewSession(false); // reset flag after successful upload
            } else {
              // ❌ Standard error message for invalid/non-text files
              setUploadStatus({
                message:
                  "❌ Please upload only a resume or career-related document.",
                state: "error",
              });
            }
          } else {
            // ❌ Standard error message (backend returned error)
            setUploadStatus({
              message:
                "❌ Please upload only a resume or career-related document.",
              state: "error",
            });
          }
        } catch {
          setUploadStatus({
            message: "⚠️ Upload completed but response parsing failed.",
            state: "error",
          });
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setUploadStatus({
          message: "❌ Upload error occurred.",
          state: "error",
        });
      };

      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      if (err instanceof Error) {
        setUploadStatus({
          message: "❌ Upload error: " + err.message,
          state: "error",
        });
      } else {
        setUploadStatus({
          message: "❌ Upload error: Unknown error",
          state: "error",
        });
      }
    }
  };

  const handleUploadClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Handle Ask
  const handleAsk = async () => {
    if (!question.trim()) {
      setAnswer("❗ Please enter your question.");
      return;
    }

    if (!backendReady || !sessionId) {
      setAnswer("⚠️ Please upload your document first.");
      return;
    }

    setLoading(true);
    setAnswer("⌛️ Loading...");

    try {
      // Call /ask/{session_id}
      const res = await fetch(`${API_BASE}/ask/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      // Detect expired/invalid session and reset UI state
      const expired =
        data?.error &&
        typeof data.error === "string" &&
        data.error.toLowerCase().includes("session expired");

      if (expired) {
        setAnswer("⚠️ Session expired. Please upload your document again.");
        setBackendReady(false); // disable ask UI
        setSessionId(null); // clear session
        setQuestion(""); // clear input
        setForceNewSession(true);
        setUploadStatus({
          message:
            "⚠️ Your session has expired. Please re-upload your document or refresh the page to continue.",
          state: "error",
        });
      } else {
        setAnswer(
          res.ok && data.answer
            ? data.answer
            : "❌ Error: " + (data.error || "Unknown error.")
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        setAnswer("❌ Ask error: " + err.message);
      } else {
        setAnswer("❌ Ask error: Unknown error");
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎓 Career RAG Demo</h1>
      <UploadSection
        file={file}
        fileInputRef={fileInputRef}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        onFileChange={handleFileChange}
        onUploadClick={handleUploadClick}
      />
      <QuestionSection
        question={question}
        setQuestion={setQuestion}
        loading={loading}
        backendReady={backendReady}
        onAsk={handleAsk}
      />
      <AnswerSection loading={loading} answer={answer} />
    </div>
  );
}
