"use client";

import { useRef, useState } from "react";
import UploadSection from "@/components/UploadSection";
import QuestionSection from "@/components/QuestionSection";
import AnswerSection from "@/components/AnswerSection";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface UploadResponse {
  status: "ready" | "error";
  session_id?: string;
  message?: string;
}

interface AskResponse {
  answer?: string;
  error?: string;
}

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
      formData.append("force_new_session", "true");
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

        let response: UploadResponse | null = null;

        try {
          response = JSON.parse(xhr.responseText);
        } catch {
          // ❌ Cannot convert JSON (e.g. received HTML instead)
          const fallbackMessage =
            xhr.status === 404
              ? "❌ The service is temporarily unavailable. Please try again shortly."
              : [502, 503, 504].includes(xhr.status)
              ? "❌ The system is under heavy load or unavailable. Please try again soon."
              : "⚠️ Upload completed but received an invalid response.";
          setUploadStatus({ message: fallbackMessage, state: "error" });
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          if (response.status === "ready") {
            setUploadStatus({
              message: "✅ File uploaded successfully!",
              state: "success",
            });
            setBackendReady(true);
            setSessionId(response.session_id);
            setForceNewSession(false);
          } else {
            const fallbackMessage =
              response.message ||
              "⚠️ Upload failed. File was accepted but could not be processed.";
            setUploadStatus({ message: fallbackMessage, state: "error" });
          }
        } else {
          const isGatewayError = [502, 503, 504].includes(xhr.status);
          const isClientError = xhr.status >= 400 && xhr.status < 500;
          const isServerError = xhr.status >= 500 && xhr.status < 600;

          const fallbackMessage = isGatewayError
            ? "❌ The system is currently under maintenance or experiencing heavy load. Please try again shortly."
            : isClientError
            ? "⚠️ Upload failed. Please check your file format or try a different document."
            : isServerError
            ? "❌ A server error occurred. Please try again later."
            : "❌ Upload failed. Please try again.";

          setUploadStatus({
            message: response.message || fallbackMessage,
            state: "error",
          });
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setUploadStatus({
          message:
            "❌ Upload failed due to a connection or service issue. Please check your internet or try again shortly.",
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
      const res = await fetch(`${API_BASE}/ask/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data: AskResponse = await res.json();

      const expired =
        data?.error &&
        typeof data.error === "string" &&
        data.error.toLowerCase().includes("session expired");

      if (expired) {
        setAnswer("⚠️ Session expired. Please upload your document again.");
        setBackendReady(false);
        setSessionId(null);
        setQuestion("");
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
