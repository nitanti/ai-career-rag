"use client";

import { useRef, useState } from "react";
import UploadSection from "@/components/UploadSection";
import QuestionSection from "@/components/QuestionSection";
import AnswerSection from "@/components/AnswerSection";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);
    setUploadStatus("⏳ Uploading...");
    setUploading(true);
    setUploadProgress(0);
    setBackendReady(false);
    setAnswer(null);

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
    } catch (err) {
      setUploading(false);
      if (err instanceof Error) {
        setUploadStatus("❌ Upload error: " + err.message);
      } else {
        setUploadStatus("❌ Upload error: Unknown error");
      }
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
