import React from "react";

interface UploadSectionProps {
  file: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  uploadStatus: {
    message: string;
    state: "loading" | "success" | "error" | null;
  };
  uploadProgress: number;
  onUploadClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadSection({
  file,
  fileInputRef,
  uploading,
  uploadStatus,
  uploadProgress,
  onUploadClick,
  onFileChange,
}: UploadSectionProps) {
  return (
    <div>
      <label className="block font-medium">
        📄 Upload your resume file (support PDF, DOCX, TXT, PNG, JPG, JPEG):
      </label>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
      />

      {/* Upload button */}
      <button
        onClick={onUploadClick}
        type="button"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {/* Show selected file */}
      {file && (
        <p className="mt-2 text-sm text-gray-500">
          📎 Selected file: <strong>{file.name}</strong>
        </p>
      )}

      {/* Show progress bar */}
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

      {/* Upload status (success, error, loading) */}
      {uploadStatus.message && (
        <p
          className={`mt-2 text-sm ${
            uploadStatus.state === "error"
              ? "text-red-600"
              : uploadStatus.state === "success"
              ? "text-green-600"
              : "text-gray-700"
          }`}
        >
          {uploadStatus.message}
        </p>
      )}
    </div>
  );
}
