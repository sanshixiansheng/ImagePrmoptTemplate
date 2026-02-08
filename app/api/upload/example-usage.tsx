/* eslint-disable @next/next/no-img-element */
/**
 * File Upload Component Usage Example
 *
 * This file demonstrates how to use the upload API in a React component.
 * Copy the relevant parts into your actual component as needed.
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function FileUploadExample() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  /**
   * Handle file selection.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size.
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("File size cannot exceed 10MB");
      return;
    }

    // Validate file type.
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only JPG, PNG, GIF, and WebP are supported");
      return;
    }

    setFile(selectedFile);
  };

  /**
   * Upload file to server.
   */
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.code === 1000) {
        toast.success("Upload successful");
        setUploadedUrl(result.data.fileUrl);
        console.log("Upload result:", result.data);
      } else if (result.code === 401) {
        toast.error("Please log in first");
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed, please try again later");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Drag-and-drop upload (optional).
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">File Upload Example</h2>

      {/* Drag-and-drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          {file ? (
            <div>
              <p className="text-sm text-gray-600">Selected file:</p>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Click to select a file or drag it here</p>
              <p className="text-xs text-gray-500 mt-2">
                Supports JPG/PNG/GIF/WebP, up to 10MB
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Uploading..." : "Upload file"}
      </button>

      {/* Upload result */}
      {uploadedUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-600">Upload successful</p>
          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-xs text-gray-600">File URL:</p>
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="w-full text-xs p-2 border rounded bg-gray-50"
            />
            <img src={uploadedUrl} alt="Uploaded" className="w-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * Simplified usage example (copy into your component)
 * ==========================================
 */

// 1. Basic upload helper.
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  return result;
}

// 2. Use inside your component.
// const handleUpload = async () => {
//   try {
//     const result = await uploadFile(selectedFile);
//     if (result.code === 1000) {
//       console.log("File URL:", result.data.fileUrl);
//       toast.success("Upload successful");
//     }
//   } catch (error) {
//     toast.error("Upload failed");
//   }
// };
