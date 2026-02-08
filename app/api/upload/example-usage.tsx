/**
 * 文件上传组件使用示例
 * 
 * 这个文件展示了如何在 React 组件中使用上传 API
 * 复制相关代码到你的实际组件中使用
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function FileUploadExample() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  /**
   * 处理文件选择
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 验证文件大小
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error("文件大小不能超过 10MB");
        return;
      }

      // 验证文件类型
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("仅支持 JPG、PNG、GIF、WebP 格式");
        return;
      }

      setFile(selectedFile);
    }
  };

  /**
   * 上传文件到服务器
   */
  const handleUpload = async () => {
    if (!file) {
      toast.error("请先选择文件");
      return;
    }

    setUploading(true);

    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append("file", file);

      // 调用上传 API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.code === 1000) {
        // 上传成功
        toast.success("文件上传成功！");
        setUploadedUrl(result.data.fileUrl);
        console.log("上传结果:", result.data);
      } else if (result.code === 401) {
        // 未登录
        toast.error("请先登录");
      } else {
        // 其他错误
        toast.error(result.message || "上传失败");
      }
    } catch (error: any) {
      console.error("上传错误:", error);
      toast.error("上传失败，请稍后重试");
    } finally {
      setUploading(false);
    }
  };

  /**
   * 拖拽上传（可选功能）
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
      <h2 className="text-2xl font-bold">文件上传示例</h2>

      {/* 拖拽上传区域 */}
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
              <p className="text-sm text-gray-600">已选择文件:</p>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">点击选择文件或拖拽到此处</p>
              <p className="text-xs text-gray-500 mt-2">
                支持 JPG、PNG、GIF、WebP，最大 10MB
              </p>
            </div>
          )}
        </label>
      </div>

      {/* 上传按钮 */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "上传中..." : "上传文件"}
      </button>

      {/* 显示上传结果 */}
      {uploadedUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-600">上传成功！</p>
          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-xs text-gray-600">文件 URL:</p>
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
 * 简化版使用示例（复制到你的组件中）
 * ==========================================
 */

// 1. 基础上传函数
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

// 2. 在组件中使用
// const handleUpload = async () => {
//   try {
//     const result = await uploadFile(selectedFile);
//     if (result.code === 1000) {
//       console.log("文件 URL:", result.data.fileUrl);
//       toast.success("上传成功！");
//     }
//   } catch (error) {
//     toast.error("上传失败");
//   }
// };
