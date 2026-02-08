"use client";

import Icon from "@/components/icon";
import { Link } from "@/i18n/routing";
import { NavItem } from "@/types/blocks/base";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function SidebarNav({
  className,
  items,
  ...props
}: {
  className?: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("rounded-2xl border border-border/70 bg-background p-2", className)} {...props}>
      <ul className="space-y-1">
        {items.map((item, index) => {
          const active = !!item.url && pathname.includes(item.url as any);
          return (
            <li key={index}>
              <Link
                href={item.url as any}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-accent hover:text-foreground"
                )}
              >
                {item.icon && <Icon name={item.icon} className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
