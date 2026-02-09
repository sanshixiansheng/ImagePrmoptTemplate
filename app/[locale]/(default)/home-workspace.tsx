"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UsageLimitDialog } from "@/components/billing/usage-limit-dialog";

const ASPECTS = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;
const HISTORY_KEY = "home_workspace_recent_results_v1";

export function HomeWorkspace() {
  const t = useTranslations("ai_image");
  const [prompt, setPrompt] = useState(
    "Cinematic portrait of a traveler in neon rain, 35mm film, soft backlight, high detail."
  );
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECTS)[number]>("1:1");
  const [seed, setSeed] = useState("0");
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState(t("quota_modal_default_message"));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed.filter((item) => typeof item === "string").slice(0, 8);
      if (cleaned.length > 0) {
        setHistory(cleaned);
        setImageUrl(cleaned[0]);
      }
    } catch {
      // Ignore malformed cached data.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
  }, [history]);

  const trimmedPrompt = prompt.trim();
  const canGenerate = trimmedPrompt.length > 0 && !isGenerating;

  const generateOnHome = async () => {
    if (!trimmedPrompt || isGenerating) return;

    setIsGenerating(true);
    setImageUrl(null);

    try {
      const response = await fetch("/api/ai/evolink/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          size: aspectRatio,
          quality: "2K",
          seed,
          outputFormat,
        }),
      });

      const result = await response.json();
      if (result.code === 401 || response.status === 401) {
        throw new Error("Please login first.");
      }
      if (result.errorCode === "FREE_DAILY_IMAGE_QUOTA_USED" || result.code === 4021 || response.status === 402) {
        setQuotaMessage(result.message || t("quota_modal_default_message"));
        setShowQuotaModal(true);
        return;
      }
      if (result.code !== 1000 || !result.data?.id) {
        throw new Error(result.message || "Failed to create generation task.");
      }

      const taskId = result.data.id as string;
      const maxAttempts = 120;
      const pollInterval = 2000;
      let done = false;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        const statusResponse = await fetch(`/api/ai/evolink/task/${taskId}`);
        const statusResult = await statusResponse.json();

        if (statusResult.code !== 1000) {
          throw new Error(statusResult.message || "Failed to query task status.");
        }

        const taskData = statusResult.data;
        if (taskData?.status === "completed" && taskData.results?.[0]) {
          const newUrl = taskData.results[0] as string;
          setImageUrl(newUrl);
          setHistory((prev) => [newUrl, ...prev.filter((item) => item !== newUrl)].slice(0, 8));
          toast.success("Image generated.");
          done = true;
          break;
        }

        if (taskData?.status === "failed") {
          throw new Error("Image generation failed.");
        }
      }

      if (!done) {
        throw new Error("Generation timed out, please try again.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const statusText = useMemo(() => {
    if (isGenerating) return "Generating...";
    if (imageUrl) return "Generation complete";
    return "Your generated image will appear here";
  }, [isGenerating, imageUrl]);

  return (
    <div className="rounded-3xl border border-border/70 bg-background/90 p-3 shadow-sm backdrop-blur md:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Your Prompt</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground/70">Live</span>
          </div>

          <div className="rounded-xl border border-border/70 bg-background p-3 md:p-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Describe the image you want to generate..."
              className="resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
            />
          </div>

          <div className="mt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">Aspect Ratio</p>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {ASPECTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAspectRatio(item)}
                  className={`rounded-lg border bg-background p-2 text-center font-medium transition-all ${
                    aspectRatio === item
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/70 hover:-translate-y-0.5 hover:border-primary/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">Seed</p>
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">Output Format</p>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary/50"
              >
                <option value="jpeg">jpeg</option>
                <option value="png">png</option>
                <option value="webp">webp</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <Button size="sm" className="w-full" onClick={generateOnHome} disabled={!canGenerate}>
              {isGenerating ? "Generating..." : "Generate Image"}
            </Button>
            <p className="mt-2 text-xs text-foreground/65">
              {t("home_workspace_free_quota_hint")}
            </p>
            <p className="mt-1 text-xs text-foreground/65">
              {t("home_workspace_video_quota_hint")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Preview</p>
            <span className="text-xs text-foreground/60">{statusText}</span>
          </div>
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background">
            {imageUrl ? (
              <div className="relative h-[420px] w-full">
                <Image
                  src={imageUrl}
                  alt="Generated result"
                  fill
                  unoptimized
                  loader={({ src }) => src}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="px-4 text-center text-sm text-foreground/50">
                {isGenerating ? "Generating image, please wait..." : "Your generated image will appear here"}
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">Recent Results</p>
            <div className="grid grid-cols-4 gap-2">
              {history.length === 0 ? (
                <div className="col-span-4 rounded-lg border border-dashed border-border/70 bg-background p-3 text-center text-xs text-foreground/50">
                  No generated images yet.
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setImageUrl(item)}
                    className={`relative h-16 overflow-hidden rounded-md border transition-all ${
                      imageUrl === item
                        ? "border-primary/70 ring-1 ring-primary/40"
                        : "border-border/70 hover:border-primary/40"
                    }`}
                  >
                    <Image
                      src={item}
                      alt="History item"
                      fill
                      unoptimized
                      loader={({ src }) => src}
                      className="object-cover"
                    />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <UsageLimitDialog
        open={showQuotaModal}
        onOpenChange={setShowQuotaModal}
        title={t("quota_modal_title")}
        message={quotaMessage}
        primaryLabel={t("quota_modal_buy_credits")}
        secondaryLabel={t("quota_modal_try_tomorrow")}
      />
    </div>
  );
}
