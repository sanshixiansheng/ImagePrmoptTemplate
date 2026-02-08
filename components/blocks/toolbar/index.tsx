import { Button } from "@/components/ui/button";
import { Button as ButtonType } from "@/types/blocks/base";
import Icon from "@/components/icon";
import { Link } from "@/i18n/routing";

export default function Toolbar({ items }: { items?: ButtonType[] }) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {items?.map((item, idx) => (
        <Button
          key={idx}
          variant={item.variant}
          size="sm"
          className={item.className}
        >
          <Link
            href={item.url as any}
            target={item.target}
            className="flex items-center gap-1.5"
          >
            {item.icon && <Icon name={item.icon} className="size-4" />}
            {item.title}
          </Link>
        </Button>
      ))}
    </div>
  );
}
