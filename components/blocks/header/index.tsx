"use client";

import { useMemo, useState } from "react";
import { Header as HeaderType } from "@/types/blocks/header";
import Icon from "@/components/icon";
import { Link, usePathname } from "@/i18n/routing";
import LocaleToggle from "@/components/locale/toggle";
import ThemeToggle from "@/components/theme/toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Header({ header }: { header: HeaderType }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("user");
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => header.nav?.items || [], [header.nav?.items]);

  if (header.disabled) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="container">
        <div className="flex h-20 items-center gap-6 transition-[padding] duration-200">
          <Link href={(header.brand?.url as any) || "/"} className="flex items-center gap-2">
            {header.brand?.logo?.src ? (
              <Image
                src={header.brand.logo.src}
                alt={header.brand.logo.alt || "Visora"}
                width={220}
                height={60}
                className="h-11 w-auto md:h-12"
              />
            ) : (
              <span className="font-serif text-xl font-semibold">{header.brand?.title || "Visora"}</span>
            )}
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {navItems.map((item, i) => {
              const hasChildren = !!item.children?.length;
              if (hasChildren) {
                return (
                  <DropdownMenu key={i}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-9 rounded-md px-3 text-sm font-medium text-foreground/80">
                        {item.icon && <Icon name={item.icon} className="mr-1.5 size-4" />}
                        {item.title}
                        <ChevronDown className="ml-1.5 size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72">
                      {item.children?.map((child, idx) => {
                        if (child.children?.length) {
                          return (
                            <div key={idx} className="px-2 py-1.5">
                              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {child.title}
                              </p>
                              {child.children.map((g, gIdx) => (
                                <DropdownMenuItem asChild key={gIdx}>
                                  <Link href={g.url as any} target={g.target} className="cursor-pointer">
                                    {g.icon && <Icon name={g.icon} className="mr-2 size-4" />}
                                    <span>{g.title}</span>
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <DropdownMenuItem asChild key={idx}>
                            <Link href={child.url as any} target={child.target} className="cursor-pointer">
                              {child.icon && <Icon name={child.icon} className="mr-2 size-4" />}
                              <span>{child.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={i}
                  href={item.url as any}
                  target={item.target}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.url
                      ? "font-semibold text-foreground"
                      : "text-foreground/75 hover:text-foreground"
                  )}
                >
                  {item.icon && <Icon name={item.icon} className="mr-1.5 inline size-4" />}
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {header.show_theme && <ThemeToggle />}
            {header.show_locale && <LocaleToggle />}

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/my-profile")}>{t("my_profile")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-orders")}>{t("my_orders")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/pricing")}>{t("recharge_credits")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>{t("sign_out")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              header.buttons?.map((item, i) => {
                if (item.url === "/auth/signin") {
                  return (
                    <Button
                      key={i}
                      variant={item.variant}
                      onClick={() => window.dispatchEvent(new CustomEvent("open-sign-modal"))}
                    >
                      {item.title}
                    </Button>
                  );
                }
                return (
                  <Button key={i} variant={item.variant} asChild>
                    <Link href={item.url as any} target={item.target || ""}>
                      {item.title}
                    </Link>
                  </Button>
                );
              })
            )}
          </div>

          <div className="ml-auto lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-2">
                  {navItems.map((item, i) => (
                    <div key={i} className="rounded-lg border border-border/70 bg-card p-2">
                      {item.url ? (
                        <Link
                          href={item.url as any}
                          target={item.target}
                          className="block rounded-md px-3 py-2 font-medium"
                          onClick={() => setOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <p className="px-3 py-2 font-medium">{item.title}</p>
                      )}
                      {!!item.children?.length && (
                        <div className="space-y-1 px-1 pb-1">
                          {item.children.map((child, idx) =>
                            child.children?.length ? (
                              <div key={idx}>
                                <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide">
                                  {child.title}
                                </p>
                                {child.children.map((g, gIdx) => (
                                  <Link
                                    key={gIdx}
                                    href={g.url as any}
                                    target={g.target}
                                    className="block rounded-md px-2 py-2 text-sm text-muted-foreground"
                                    onClick={() => setOpen(false)}
                                  >
                                    {g.title}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <Link
                                key={idx}
                                href={child.url as any}
                                target={child.target}
                                className="block rounded-md px-2 py-2 text-sm text-muted-foreground"
                                onClick={() => setOpen(false)}
                              >
                                {child.title}
                              </Link>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  {header.show_theme && <ThemeToggle />}
                  {header.show_locale && <LocaleToggle />}
                </div>

                <div className="mt-5 space-y-2 border-t border-border pt-4">
                  {session ? (
                    <>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/my-profile")}>{t("my_profile")}</Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/my-orders")}>{t("my_orders")}</Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/pricing")}>{t("recharge_credits")}</Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>{t("sign_out")}</Button>
                    </>
                  ) : (
                    header.buttons?.map((item, i) => {
                      if (item.url === "/auth/signin") {
                        return (
                          <Button
                            key={i}
                            className="w-full"
                            variant={item.variant}
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent("open-sign-modal"));
                              setOpen(false);
                            }}
                          >
                            {item.title}
                          </Button>
                        );
                      }
                      return (
                        <Button key={i} className="w-full" variant={item.variant} asChild>
                          <Link href={item.url as any} target={item.target || ""} onClick={() => setOpen(false)}>
                            {item.title}
                          </Link>
                        </Button>
                      );
                    })
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}



