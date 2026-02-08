/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, Copy, Wand2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type AnalysisMode = "describe" | "prompt" | "detailed";

export default function ImageToPromptPage() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<AnalysisMode>("prompt");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setImageFile(file);
    
    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    
    // Upload to R2
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadResult = await uploadResponse.json();
      
      if (uploadResult.code === 1000 && uploadResult.data?.fileUrl) {
        setImageUrl(uploadResult.data.fileUrl);
        toast.success("Image uploaded successfully");
      } else {
        throw new Error(uploadResult.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("[Upload Error]", error);
      toast.error(error.message || "Failed to upload image");
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    setResult("");

    try {
      const response = await fetch("/api/image-to-prompt/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          mode: mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 1000) {
        setResult(data.data.result);
        toast.success("Analysis completed!");
      } else {
        throw new Error(data.message || "Analysis failed");
      }
    } catch (error: any) {
      console.error("[Analysis Error]", error);
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  const handleClear = () => {
    setImageUrl("");
    setImageFile(null);
    setPreviewUrl("");
    setResult("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Image to Prompt
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload an image and AI will analyze it to generate a detailed prompt or description
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Upload */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Upload Image
          </h2>

          {/* Upload Area */}
          <div className="mb-4">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-4 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, WEBP (MAX. 10MB)
                  </p>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Analysis Mode */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Analysis Mode</label>
            <Tabs value={mode} onValueChange={(value) => setMode(value as AnalysisMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
                <TabsTrigger value="describe">Describe</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-gray-500 mt-2">
              {mode === "prompt" && "Generate a concise image generation prompt"}
              {mode === "describe" && "Get a detailed description of the image"}
              {mode === "detailed" && "Get a comprehensive, technical prompt"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!imageUrl || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Analyze Image
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={isProcessing}
            >
              Clear
            </Button>
          </div>
        </Card>

        {/* Right: Result */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          
          {result ? (
            <>
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="min-h-[400px] mb-4 font-mono text-sm"
                placeholder="Analysis result will appear here..."
              />
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Result
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <Wand2 className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">
                Upload an image and click "Analyze Image" to see the result
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Examples */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold mb-4">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">1. Upload Image</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Upload any image you want to analyze
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. Choose Mode</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Select prompt generation, description, or detailed analysis
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">3. Get Result</h4>
            <p className="text-gray-600 dark:text-gray-400">
              AI analyzes the image and generates the result
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

