import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  className,
  titleClassName,
  as = "h2"
}: {
  eyebrow?: string;
  title: React.ReactNode;
  copy?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2";
}) {
  const Tag = as;
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className={cn("eyebrow mb-6", align === "center" && "mx-auto")}>
          {eyebrow}
        </p>
      ) : null}
      <Tag
        className={cn(
          "font-heading tracking-gta leading-none text-cream",
          "text-[clamp(2rem,4vw,4rem)]",
          titleClassName
        )}
      >
        {title}
      </Tag>
      {copy ? (
        <p className="mt-5 max-w-2xl text-pretty text-base leading-[1.75] text-cream/45 sm:text-lg">
          {copy}
        </p>
      ) : null}
    </div>
  );
}
