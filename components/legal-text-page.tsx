import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { readLegalDoc, type LegalBlock } from "@/lib/legal";

function sectionId(heading: string) {
  return heading
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Render inline **bold** markup. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-cream">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "ul") {
    return (
      <ul className="mt-4 grid gap-2">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 leading-7 text-muted">
            <span className="mt-2 h-2 w-2 flex-none rounded-full bg-gold-300/60" aria-hidden />
            {inline(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "h3") {
    return <h3 className="mt-6 font-heading text-lg font-bold text-cream">{inline(block.text)}</h3>;
  }
  return <p className="mt-4 leading-8 text-muted">{inline(block.text)}</p>;
}

/**
 * Renders a legal document sourced from an external .txt file in public/legal.
 * Editors change the .txt — no code change needed — and the raw file stays
 * downloadable at /legal/<slug>.txt.
 */
export async function LegalTextPage({
  slug,
  eyebrow = "Rechtliches",
}: {
  slug: string;
  eyebrow?: string;
}) {
  const doc = await readLegalDoc(slug);
  if (!doc) notFound();

  return (
    <section className="pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="container-shell mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="eyebrow">{eyebrow}</p>
          <a
            href={`/legal/${slug}.txt`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold-300/30 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cream/60 transition-colors hover:border-gold-300/60 hover:text-cream"
          >
            <FileText className="h-3.5 w-3.5 text-gold-300/70" />
            Als .txt öffnen
          </a>
        </div>

        <h1 className="mt-5 font-heading text-5xl font-black text-cream">{doc.title}</h1>
        {doc.intro ? <p className="mt-6 text-lg leading-9 text-muted">{doc.intro}</p> : null}

        {doc.lead.length > 0 ? (
          <div className="mt-6">
            {doc.lead.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        ) : null}

        <div className="mt-10 grid gap-5">
          {doc.sections.map((section) => (
            <article
              id={sectionId(section.heading)}
              key={section.heading}
              className="panel-surface rounded-[1.35rem] p-6"
            >
              <h2 className="font-heading text-2xl font-black text-cream">{section.heading}</h2>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
