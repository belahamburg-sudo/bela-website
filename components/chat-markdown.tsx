import type { ReactNode } from "react";

/** Inline: **bold** and *italic*. */
function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${keyBase}-b${i}`} className="font-semibold text-cream">{m[1]}</strong>);
    else if (m[2]) out.push(<em key={`${keyBase}-i${i}`}>{m[2]}</em>);
    last = re.lastIndex;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Lightweight markdown: paragraphs + bullet/numbered lists + inline bold/italic. */
export function ChatMarkdown({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul${blocks.length}`} className="my-1.5 grid gap-1 pl-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-gold-300/70" />
              <span>{renderInline(b, `li${blocks.length}-${i}`)}</span>
            </li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flush();
    if (line.trim()) {
      blocks.push(
        <p key={`p${blocks.length}`} className="my-1.5 leading-relaxed first:mt-0 last:mb-0">
          {renderInline(line, `p${blocks.length}`)}
        </p>
      );
    }
  });
  flush();

  return <div className="text-sm text-cream/85">{blocks}</div>;
}
