import { Footer as FooterType } from "@/types/blocks/footer";
import Icon from "@/components/icon";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default function Footer({ footer }: { footer: FooterType }) {
  if (footer.disabled) {
    return null;
  }

  return (
    <footer id={footer.name} className="border-t py-8 text-foreground/70">
      <div className="container py-6 md:py-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_2fr]">
          <div className="space-y-5">
            <Link href={(footer.brand?.url as any) || "/"} className="inline-flex items-center gap-2">
              {footer.brand?.logo?.src ? (
                <Image
                  src={footer.brand.logo.src}
                  alt={footer.brand.logo.alt || footer.brand.title || "Logo"}
                  width={180}
                  height={40}
                  className="h-10 w-auto"
                />
              ) : (
                <span className="font-serif text-2xl font-semibold opacity-80">{footer.brand?.title}</span>
              )}
            </Link>

            {footer.brand?.description && (
              <p className="max-w-md text-sm leading-6 text-foreground/60">
                {footer.brand.description}
              </p>
            )}

            {!!footer.social?.items?.length && (
              <ul className="flex items-center gap-3">
                {footer.social.items.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.url}
                      target={item.target}
                      rel="noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 text-foreground/60 transition-colors hover:text-foreground"
                    >
                      {item.icon && <Icon name={item.icon} className="size-4" />}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {footer.nav?.items?.map((item, i) => (
              <div key={i}>
                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground/50">
                  {item.title}
                </p>
                <ul className="space-y-2.5 text-sm">
                  {item.children?.map((child, idx) => (
                    <li key={idx}>
                      <a
                        href={child.url}
                        target={child.target}
                        rel="noreferrer"
                        className="text-foreground/70 transition-colors hover:text-foreground"
                      >
                        {child.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-foreground/55 md:flex-row md:items-center md:justify-between">
          <p>{footer.copyright}</p>
          {!!footer.agreement?.items?.length && (
            <ul className="flex flex-wrap items-center gap-3 md:justify-end">
              {footer.agreement.items.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.url}
                    target={item.target}
                    rel="noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}


