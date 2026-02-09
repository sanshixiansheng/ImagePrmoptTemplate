"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackTryItNowClick } from "@/lib/analytics";

export function TryNowButton({ label }: { label: string }) {
  return (
    <Link
      href="#workspace"
      onClick={() => trackTryItNowClick('hero')}
    >
      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full"
      >
        {label}
      </Button>
    </Link>
  );
}


