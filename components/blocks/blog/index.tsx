/* eslint-disable @next/next/no-img-element */
import { ArrowRight } from "lucide-react";
import { Blog as BlogType } from "@/types/blocks/blog";

export default function Blog({ blog }: { blog: BlogType }) {
  if (blog.disabled) {
    return null;
  }

  return (
    <section className="w-full py-16 md:py-24">
      <div className="container flex flex-col items-center gap-8">
        <div className="text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {blog.label}
          </p>
          <h2 className="mb-3 text-pretty text-3xl font-semibold tracking-tight md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
            {blog.title}
          </h2>
          <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            {blog.description}
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blog.items?.map((item, idx) => (
            <a
              key={idx}
              href={item.url || `/${item.locale}/posts/${item.slug}`}
              target={item.target || "_self"}
              className="group"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                {item.cover_url && (
                  <div>
                    <img
                      src={item.cover_url}
                      alt={item.title || ""}
                      className="aspect-[16/9] h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col px-5 py-5">
                  <h3 className="mb-3 text-lg font-semibold md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 text-muted-foreground">
                    {item.description}
                  </p>
                  {blog.read_more_text && (
                    <p className="mt-auto flex items-center text-sm font-medium text-foreground group-hover:underline">
                      {blog.read_more_text}
                      <ArrowRight className="ml-2 size-4" />
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
