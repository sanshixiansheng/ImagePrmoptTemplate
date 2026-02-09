"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UsageLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref?: string;
  onSecondaryClick?: () => void;
}

export function UsageLimitDialog({
  open,
  onOpenChange,
  title,
  message,
  primaryLabel,
  secondaryLabel,
  primaryHref = "/pricing",
  onSecondaryClick,
}: UsageLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-primary/20 bg-slate-950 text-slate-100 shadow-2xl sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-50">{title}</DialogTitle>
          <DialogDescription className="text-base leading-8 text-slate-300">{message}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 pt-2">
          <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-slate-100"
            onClick={onSecondaryClick ?? (() => onOpenChange(false))}
          >
            {secondaryLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

