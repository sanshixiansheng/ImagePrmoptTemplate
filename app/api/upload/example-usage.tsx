/* eslint-disable @next/next/no-img-element */
/**
 * 鏂囦欢涓婁紶缁勪欢浣跨敤绀轰緥
 * 
 * 杩欎釜鏂囦欢灞曠ず浜嗗浣曞湪 React 缁勪欢涓娇鐢ㄤ笂浼?API
 * 澶嶅埗鐩稿叧浠ｇ爜鍒颁綘鐨勫疄闄呯粍浠朵腑浣跨敤
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function FileUploadExample() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  /**
   * 澶勭悊鏂囦欢閫夋嫨
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 楠岃瘉鏂囦欢澶у皬
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error("鏂囦欢澶у皬涓嶈兘瓒呰繃 10MB");
        return;
      }

      // 楠岃瘉鏂囦欢绫诲瀷
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("浠呮敮鎸?JPG銆丳NG銆丟IF銆乄ebP 鏍煎紡");
        return;
      }

      setFile(selectedFile);
    }
  };

  /**
   * 涓婁紶鏂囦欢鍒版湇鍔″櫒
   */
  const handleUpload = async () => {
    if (!file) {
      toast.error("璇峰厛閫夋嫨鏂囦欢");
      return;
    }

    setUploading(true);

    try {
      // 鍒涘缓 FormData
      const formData = new FormData();
      formData.append("file", file);

      // 璋冪敤涓婁紶 API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.code === 1000) {
        // 涓婁紶鎴愬姛
        toast.success("File uploaded successfully");
        setUploadedUrl(result.data.fileUrl);
        console.log("涓婁紶缁撴灉:", result.data);
      } else if (result.code === 401) {
        // 鏈櫥褰?
        toast.error("璇峰厛鐧诲綍");
      } else {
        // 鍏朵粬閿欒
        toast.error(result.message || "涓婁紶澶辫触");
      }
    } catch (error: any) {
      console.error("涓婁紶閿欒:", error);
      toast.error("涓婁紶澶辫触锛岃绋嶅悗閲嶈瘯");
    } finally {
      setUploading(false);
    }
  };

  /**
   * 鎷栨嫿涓婁紶锛堝彲閫夊姛鑳斤級
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">鏂囦欢涓婁紶绀轰緥</h2>

      {/* 鎷栨嫿涓婁紶鍖哄煙 */}
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
              <p className="text-sm text-gray-600">宸查€夋嫨鏂囦欢:</p>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">鐐瑰嚮閫夋嫨鏂囦欢鎴栨嫋鎷藉埌姝ゅ</p>
              <p className="text-xs text-gray-500 mt-2">
                鏀寔 JPG銆丳NG銆丟IF銆乄ebP锛屾渶澶?10MB
              </p>
            </div>
          )}
        </label>
      </div>

      {/* 涓婁紶鎸夐挳 */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "涓婁紶涓?.." : "涓婁紶鏂囦欢"}
      </button>

      {/* 鏄剧ず涓婁紶缁撴灉 */}
      {uploadedUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-600">Upload successful</p>
          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-xs text-gray-600">鏂囦欢 URL:</p>
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="w-full text-xs p-2 border rounded bg-gray-50"
            />
            <img
              src={uploadedUrl}
              alt="Uploaded"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * 绠€鍖栫増浣跨敤绀轰緥锛堝鍒跺埌浣犵殑缁勪欢涓級
 * ==========================================
 */

// 1. 鍩虹涓婁紶鍑芥暟
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

// 2. 鍦ㄧ粍浠朵腑浣跨敤
// const handleUpload = async () => {
//   try {
//     const result = await uploadFile(selectedFile);
//     if (result.code === 1000) {
//       console.log("鏂囦欢 URL:", result.data.fileUrl);
//       toast.success("涓婁紶鎴愬姛锛?);
//     }
//   } catch (error) {
//     toast.error("涓婁紶澶辫触");
//   }
// };

