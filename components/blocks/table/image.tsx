/* eslint-disable @next/next/no-img-element */
export default function TableItemImage({
  value,
  options,
  className,
}: {
  value: string;
  options?: any;
  className?: string;
}) {
  return (
    <img
      src={value}
      alt={value}
      className={`h-10 w-10 rounded-full border border-border/60 object-cover ${className}`}
    />
  );
}
