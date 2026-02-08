"use client";

import { CopyToClipboard } from "react-copy-to-clipboard";
import { ReactNode } from "react";
import { toast } from "sonner";

export default function CopyText({
  text,
  children,
}: {
  text: string;
  children: ReactNode;
}) {
  return (
    <CopyToClipboard text={text} onCopy={() => toast.success("Copied")}>
      <div className="cursor-pointer hover:text-primary transition-colors">{children}</div>
    </CopyToClipboard>
  );
}
