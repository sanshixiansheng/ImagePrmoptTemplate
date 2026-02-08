import { ReactNode } from "react";
import { Sidebar } from "@/types/blocks/sidebar";
import SidebarNav from "@/components/console/sidebar/nav";

export default async function ConsoleLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar?: Sidebar;
}) {
  return (
    <div className="bg-background">
      <div className="container py-8 md:py-10">
        <div className="rounded-3xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur md:p-6">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
            {sidebar?.nav?.items && (
              <aside className="lg:sticky lg:top-24 lg:h-fit">
                <SidebarNav items={sidebar.nav.items} />
              </aside>
            )}
            <section className="min-w-0">{children}</section>
          </div>
        </div>
      </div>
    </div>
  );
}
